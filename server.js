// 우리사이 서버 — 의존성 없음 (node:http + node:sqlite). 모든 권한 검사는 여기서 한다.
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const DATA = process.env.DATA_DIR || path.join(here, 'data');
fs.mkdirSync(path.join(DATA, 'media'), { recursive: true });
const db = new DatabaseSync(path.join(DATA, 'woorisai.db'));
db.exec('PRAGMA journal_mode=WAL');
db.exec(`
create table if not exists users(id integer primary key, username text unique not null, name text not null, pw text, salt text, status text default 'active', mem_enabled integer default 0, created_at text default (datetime('now')));
create table if not exists sessions(token text primary key, user_id integer not null);
create table if not exists connections(id integer primary key, from_id integer not null, to_id integer not null, status text not null default 'pending', unique(from_id,to_id));
create table if not exists blocks(blocker integer, blocked integer, primary key(blocker,blocked));
create table if not exists invite_links(code text primary key, creator integer, expires_at text, revoked integer default 0);
create table if not exists groups(id integer primary key, owner_id integer, name text, type_hint text);
create table if not exists group_members(group_id integer, user_id integer, primary key(group_id,user_id));
create table if not exists meetups(id integer primary key, organizer_id integer, title text, starts_at text, tz text, place text, descr text, status text default 'active');
create table if not exists meetup_participants(meetup_id integer, user_id integer, rsvp text default 'invited', attended integer default 0, primary key(meetup_id,user_id));
create table if not exists posts(id integer primary key, admin_id integer, title text, occurred_on text, meetup_id integer, status text default 'active', cover_media_id integer, place_name text, place_area text, place_city text, place_country text, place_precision text default 'city', created_at text default (datetime('now')));
create table if not exists post_groups(post_id integer, group_id integer, primary key(post_id,group_id));
create table if not exists post_members(post_id integer, user_id integer, role text default 'contributor', access text default 'invited', invited_by integer, primary key(post_id,user_id));
create table if not exists post_participants(post_id integer, user_id integer, attended integer default 1, primary key(post_id,user_id));
create table if not exists media(id integer primary key, post_id integer, uploader_id integer, file text, status text default 'active', created_at text default (datetime('now')));
create table if not exists notes(id integer primary key, post_id integer, author_id integer, kind text, text text, status text default 'active', created_at text default (datetime('now')));
create table if not exists reactions(post_id integer, user_id integer, primary key(post_id,user_id));
create table if not exists settlements(id integer primary key, meetup_id integer, creator_id integer, payer_id integer, title text, total integer, status text default 'open');
create table if not exists shares(settlement_id integer, user_id integer, amount integer, confirmed integer default 0, primary key(settlement_id,user_id));
create table if not exists reports(id integer primary key, reporter_id integer, target_type text, target_id integer, category text, detail text, status text default 'RECEIVED', created_at text default (datetime('now')));
create table if not exists saves(user_id integer, post_id integer, primary key(user_id,post_id));
create table if not exists post_log(id integer primary key, post_id integer, actor_id integer, what text, created_at text default (datetime('now')));
create table if not exists privacy_requests(id integer primary key, user_id integer, kind text, detail text, status text default 'RECEIVED', created_at text default (datetime('now')));
create table if not exists hides(user_id integer, target_type text, target_id integer, primary key(user_id,target_type,target_id));
`);

// ---------- helpers ----------
const q = (sql, ...p) => db.prepare(sql).all(...p);
const one = (sql, ...p) => db.prepare(sql).get(...p);
const run = (sql, ...p) => db.prepare(sql).run(...p);
const tx = fn => { db.exec('BEGIN'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } };
class HttpError extends Error { constructor(status, msg, extra) { super(msg); this.status = status; this.extra = extra; } }
const fail = (msg, status = 400, extra) => new HttpError(status, msg, extra);
const ids = a => [...new Set((Array.isArray(a) ? a : []).map(Number).filter(n => Number.isInteger(n) && n > 0))];
const str = (v, max, min = 0) => { v = String(v ?? '').trim(); if (v.length < min || v.length > max) throw fail(`${min ? min + '–' : ''}${max}자 이내로 입력해 주세요.`); return v; };
const optStr = (v, max) => (v == null || v === '' ? null : str(v, max));
const dateOk = d => /^\d{4}-\d{2}-\d{2}$/.test(d) && !isNaN(Date.parse(d));
const leap = y => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

const blockedBetween = (a, b) => !!one('select 1 from blocks where (blocker=? and blocked=?) or (blocker=? and blocked=?)', a, b, b, a);
const blockedIds = uid => ['0', ...q('select blocked x from blocks where blocker=? union select blocker from blocks where blocked=?', uid, uid).map(r => r.x)].join(',');
const isFriend = (a, b) => !!one(`select 1 from connections where status='accepted' and ((from_id=? and to_id=?) or (from_id=? and to_id=?))`, a, b, b, a);
const friendsOnly = (uid, list) => { for (const id of list) if (id === uid || !isFriend(uid, id) || blockedBetween(uid, id)) throw fail('연결된 사람만 초대할 수 있어요.'); return list; };
const pub = u => ({ id: u.id, name: u.name, username: u.username });

// ---------- 인증 ----------
const hashPw = (pw, salt) => crypto.scryptSync(pw, salt, 32).toString('hex');
const tries = new Map();
function throttle(key) { const now = Date.now(); const t = (tries.get(key) || []).filter(x => now - x < 600000); if (t.length >= 8) throw fail('잠시 후 다시 시도해 주세요.', 429); tries.set(key, t); return () => t.push(now); }
function startSession(c, uid) {
  const token = crypto.randomBytes(24).toString('base64url');
  run('insert into sessions(token,user_id) values(?,?)', token, uid);
  c.cookie = `sid=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${c.req.headers['x-forwarded-proto'] === 'https' ? '; Secure' : ''}`;
}
const me = u => ({ id: u.id, name: u.name, username: u.username, mem_enabled: !!u.mem_enabled });

// ---------- 권한 코어 (PostMember가 열람권한의 유일한 기준) ----------
function access(pid, uid) {
  const p = one('select * from posts where id=?', pid);
  if (!p || p.status === 'deleted') throw fail('이 기록은 삭제되었어요.', 404);
  const m = one('select * from post_members where post_id=? and user_id=?', pid, uid);
  if (!m || !['invited', 'accepted'].includes(m.access)) throw fail('이 추억은 더 이상 공유되지 않아요.', 403);
  return { p, m };
}
function member(pid, uid) { const r = access(pid, uid); if (r.m.access !== 'accepted') throw fail('초대를 수락하면 볼 수 있어요.', 403); return r; }
const admin = (pid, uid) => { const r = member(pid, uid); if (r.m.role !== 'admin') throw fail('게시물 관리자만 할 수 있어요.', 403); return r; };
const active = r => { if (r.p.status !== 'active') throw fail('종료된 추억에는 기록을 추가할 수 없어요.', 409); return r; };
const accessible = uid => q(`select p.* from posts p join post_members m on m.post_id=p.id where m.user_id=? and m.access='accepted' and p.status in ('active','closed') and p.id not in (select target_id from hides where user_id=? and target_type='post')`, uid, uid);

function placeView(p) {
  if (!p.place_city && !p.place_country) return null;
  const j = a => a.filter(Boolean).join(', ');
  const label = p.place_precision === 'exact' ? j([p.place_name, p.place_area, p.place_city]) : p.place_precision === 'area' ? j([p.place_area, p.place_city]) : (p.place_city || p.place_country);
  return { label, country: p.place_country || '기타', city: p.place_city || p.place_country || '기타', precision: p.place_precision };
}
function placeIn(b) {
  if (!b || (!b.city && !b.country && !b.name)) return {};
  const precision = ['exact', 'area', 'city'].includes(b.precision) ? b.precision : 'city';
  return { place_name: optStr(b.name, 40), place_area: optStr(b.area, 30), place_city: optStr(b.city, 30), place_country: optStr(b.country, 30), place_precision: precision };
}
function card(p, uid) {
  const cover = one(`select id from media where post_id=? and status='active' and uploader_id not in (${blockedIds(uid)}) order by (id=?) desc, id limit 1`, p.id, p.cover_media_id || 0);
  const mem = q(`select u.name from post_members m join users u on u.id=m.user_id where m.post_id=? and m.access='accepted' order by m.role='admin' desc, u.id`, p.id);
  return { id: p.id, title: p.title, occurred_on: p.occurred_on, status: p.status, cover: cover?.id || null, place: placeView(p), count: mem.length, names: mem.slice(0, 3).map(x => x.name) };
}
function purgeMedia(rows) {
  for (const r of rows) { try { fs.unlinkSync(path.join(DATA, 'media', r.file)); } catch {} run(`update media set status='deleted' where id=?`, r.id); run('update posts set cover_media_id=null where cover_media_id=?', r.id); }
}
function purgePost(pid) {
  purgeMedia(q(`select * from media where post_id=? and status!='deleted'`, pid));
  run(`update notes set status='deleted', text='' where post_id=?`, pid);
  run(`update posts set status='deleted' where id=?`, pid);
}
function dropContributions(pid, uid) {
  purgeMedia(q(`select * from media where post_id=? and uploader_id=? and status!='deleted'`, pid, uid));
  run(`update notes set status='deleted', text='' where post_id=? and author_id=?`, pid, uid);
}
const logAct = (pid, uid, what) => run('insert into post_log(post_id,actor_id,what) values(?,?,?)', pid, uid, what);
function leavePost(pid, uid, deleteMine) {
  const { m } = member(pid, uid);
  const others = q(`select user_id from post_members where post_id=? and access='accepted' and user_id!=?`, pid, uid);
  if (m.role === 'admin' && others.length) throw fail('관리자를 넘기거나 추억을 종료한 뒤 나갈 수 있어요.', 409, { code: 'ADMIN_TRANSFER_REQUIRED' });
  tx(() => {
    if (deleteMine) dropContributions(pid, uid);
    run(`update post_members set access='left', role='contributor' where post_id=? and user_id=?`, pid, uid);
    if (!others.length) purgePost(pid); // OD-03: 마지막 멤버가 나가면 종료
  });
}

// ---------- 라우터 ----------
const routes = [];
const R = (method, pattern, fn, opt = {}) => routes.push({ method, re: new RegExp('^' + pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)') + '$'), fn, opt });

// 사용자명 규칙은 가입·확인 API가 같은 함수를 쓴다. 사유(탈퇴·제재 등)는 노출하지 않고 "사용할 수 없음"으로만 답한다.
const RESERVED = ['admin', 'administrator', 'root', 'system', 'support', 'help', 'woorisai', 'official', 'staff', 'test', 'null', 'undefined'];
const usernameState = u => !/^[a-z0-9_]{3,20}$/.test(u) ? 'invalid' : (RESERVED.includes(u) || u.startsWith('deleted_') || one('select 1 from users where username=?', u)) ? 'unavailable' : 'available';
const pwProblem = pw => pw.length < 8 || pw.length > 100 ? '비밀번호는 8자 이상이어야 해요.' : !/[A-Za-z]/.test(pw) ? '비밀번호에 영문을 포함해 주세요.' : !/[0-9]/.test(pw) ? '비밀번호에 숫자를 포함해 주세요.' : null;
const checks = new Map();
function rate(key, max) { const now = Date.now(), t = (checks.get(key) || []).filter(x => now - x < 600000); if (t.length >= max) throw fail('잠시 후 다시 시도해 주세요.', 429); t.push(now); checks.set(key, t); }
R('GET', '/api/username-check', c => { rate('uc:' + c.req.socket.remoteAddress, 60); return { state: usernameState(String(c.query.u || '').toLowerCase()) }; }, { pub: true });
R('POST', '/api/signup', c => {
  const username = str(c.body.username, 20, 3).toLowerCase(), name = str(c.body.name, 20, 1), pw = String(c.body.password || '');
  const us = usernameState(username);
  if (us === 'invalid') throw fail('사용자명은 영문 소문자, 숫자, _ 로 3–20자예요.');
  if (pwProblem(pw)) throw fail(pwProblem(pw));
  if (us === 'unavailable') throw fail('이미 사용 중이거나 사용할 수 없는 사용자명이에요.', 409);
  const salt = crypto.randomBytes(16).toString('hex');
  const id = run('insert into users(username,name,pw,salt) values(?,?,?,?)', username, name, hashPw(pw, salt), salt).lastInsertRowid;
  startSession(c, id);
  return me(one('select * from users where id=?', id));
}, { pub: true });

R('POST', '/api/login', c => {
  const username = String(c.body.username || '').toLowerCase().trim();
  const bump = throttle(c.req.socket.remoteAddress + ':' + username);
  const u = one(`select * from users where username=? and status='active'`, username);
  const okPw = u && crypto.timingSafeEqual(Buffer.from(hashPw(String(c.body.password || ''), u.salt), 'hex'), Buffer.from(u.pw, 'hex'));
  if (!okPw) { bump(); throw fail('사용자명 또는 비밀번호를 확인해 주세요.', 401); }
  startSession(c, u.id);
  return me(u);
}, { pub: true });

R('POST', '/api/logout', c => { run('delete from sessions where token=?', /sid=([^;]+)/.exec(c.req.headers.cookie)[1]); c.cookie = 'sid=; Path=/; Max-Age=0'; return {}; });
R('GET', '/api/me', c => me(c.u), { pub: true, soft: true });
R('PATCH', '/api/me', c => {
  if (c.body.name !== undefined) run('update users set name=? where id=?', str(c.body.name, 20, 1), c.u.id);
  if (c.body.mem_enabled !== undefined) run('update users set mem_enabled=? where id=?', c.body.mem_enabled ? 1 : 0, c.u.id);
  return me(one('select * from users where id=?', c.u.id));
});

R('GET', '/api/me/export', c => {
  const u = c.u.id;
  return { _download: 'woorisai-my-data.json', profile: me(c.u), people: q(`select u.name,u.username from connections c join users u on u.id=case when c.from_id=? then c.to_id else c.from_id end where c.status='accepted' and (c.from_id=? or c.to_id=?)`, u, u, u),
    groups: q('select g.name from groups g join group_members m on m.group_id=g.id where m.user_id=?', u),
    my_notes: q(`select n.kind,n.text,n.created_at,p.title post from notes n join posts p on p.id=n.post_id where n.author_id=? and n.status='active'`, u),
    my_photos: q(`select id,post_id,created_at from media where uploader_id=? and status='active'`, u).map(m => ({ ...m, url: `/media/${m.id}` })),
    my_reports: q('select category,target_type,status,created_at from reports where reporter_id=?', u) };
});

R('DELETE', '/api/me', c => {
  const uid = c.u.id;
  const u = one('select * from users where id=?', uid);
  if (hashPw(String(c.body.password || ''), u.salt) !== u.pw) throw fail('비밀번호를 확인해 주세요.', 401);
  tx(() => {
    for (const m of q(`select post_id,role from post_members where user_id=? and access='accepted'`, uid)) {
      if (m.role === 'admin') {
        const next = one(`select user_id from post_members where post_id=? and access='accepted' and user_id!=? order by user_id limit 1`, m.post_id, uid);
        if (next) { run(`update post_members set role='admin' where post_id=? and user_id=?`, m.post_id, next.user_id); run('update posts set admin_id=? where id=?', next.user_id, m.post_id); }
      }
      if (c.body.deleteContent) dropContributions(m.post_id, uid);
      run(`update post_members set access='left', role='contributor' where post_id=? and user_id=?`, m.post_id, uid);
      if (!one(`select 1 from post_members where post_id=? and access='accepted'`, m.post_id)) purgePost(m.post_id);
    }
    run(`update post_members set access='left' where user_id=?`, uid);
    run(`update meetups set status='cancelled' where organizer_id=?`, uid);
    run('delete from meetup_participants where user_id=?', uid);
    run('delete from connections where from_id=? or to_id=?', uid, uid);
    run('delete from group_members where user_id=?', uid);
    run('delete from groups where owner_id=? and id not in (select group_id from group_members)', uid);
    run('delete from sessions where user_id=?', uid);
    run('delete from invite_links where creator=?', uid);
    run(`update users set status='deleted', name='탈퇴한 사용자', username=?, pw=null, salt=null where id=?`, 'deleted_' + uid, uid);
  });
  c.cookie = 'sid=; Path=/; Max-Age=0';
  return {};
});

// ----- 사람 / 초대 링크 / 차단 -----
R('GET', '/api/people', c => {
  const u = c.u.id;
  return {
    friends: q(`select u.id,u.name,u.username from connections c join users u on u.id=case when c.from_id=? then c.to_id else c.from_id end where c.status='accepted' and (c.from_id=? or c.to_id=?) and u.status='active' order by u.name`, u, u, u),
    incoming: q(`select u.id,u.name,u.username from connections c join users u on u.id=c.from_id where c.to_id=? and c.status='pending'`, u),
    outgoing: q(`select u.id,u.name,u.username from connections c join users u on u.id=c.to_id where c.from_id=? and c.status='pending'`, u),
    links: q(`select code,expires_at from invite_links where creator=? and revoked=0 and expires_at>?`, u, new Date().toISOString()),
  };
});
function connect(a, b) {
  if (a === b) throw fail('나 자신은 연결할 수 없어요.');
  if (blockedBetween(a, b)) throw fail('사용자를 찾을 수 없어요.', 404);
  if (isFriend(a, b)) throw fail('이미 연결된 사람이에요.', 409);
  if (one(`select 1 from connections where from_id=? and to_id=? and status='pending'`, b, a)) return run(`update connections set status='accepted' where from_id=? and to_id=?`, b, a);
  if (one('select 1 from connections where from_id=? and to_id=?', a, b)) throw fail('이미 요청을 보냈어요.', 409);
  run('insert into connections(from_id,to_id) values(?,?)', a, b);
}
R('POST', '/api/people/request', c => {
  const t = one(`select id from users where username=? and status='active'`, String(c.body.username || '').toLowerCase().replace(/^@/, ''));
  if (!t) throw fail('사용자를 찾을 수 없어요.', 404);
  connect(c.u.id, t.id); return {};
});
R('POST', '/api/people/:id/accept', c => {
  const r = run(`update connections set status='accepted' where from_id=? and to_id=? and status='pending'`, +c.params.id, c.u.id);
  if (!r.changes || blockedBetween(c.u.id, +c.params.id)) throw fail('요청을 찾을 수 없어요.', 404);
  return {};
});
R('DELETE', '/api/people/:id', c => { run('delete from connections where (from_id=? and to_id=?) or (from_id=? and to_id=?)', c.u.id, +c.params.id, +c.params.id, c.u.id); return {}; });

R('POST', '/api/invites', c => {
  const code = crypto.randomBytes(9).toString('base64url');
  run('insert into invite_links(code,creator,expires_at) values(?,?,?)', code, c.u.id, new Date(Date.now() + 7 * 864e5).toISOString());
  return { code };
});
const linkOk = code => { const l = one('select * from invite_links where code=?', code); if (!l || l.revoked || l.expires_at < new Date().toISOString()) throw fail('만료되었거나 사용할 수 없는 초대 링크예요.', 410); const u = one(`select * from users where id=? and status='active'`, l.creator); if (!u) throw fail('만료되었거나 사용할 수 없는 초대 링크예요.', 410); return u; };
R('GET', '/api/invites/:code', c => ({ from: pub(linkOk(c.params.code)).name }));
R('POST', '/api/invites/:code/accept', c => {
  const from = linkOk(c.params.code);
  tx(() => { connect(c.u.id, from.id); run(`update connections set status='accepted' where (from_id=? and to_id=?) or (from_id=? and to_id=?)`, c.u.id, from.id, from.id, c.u.id); run('update invite_links set revoked=1 where code=?', c.params.code); });
  return { from: from.name }; // 한 번 쓰면 만료되는 1회용 링크
});
R('DELETE', '/api/invites/:code', c => { run('update invite_links set revoked=1 where code=? and creator=?', c.params.code, c.u.id); return {}; });

R('GET', '/api/blocks', c => ({ blocks: q('select u.id,u.name,u.username from blocks b join users u on u.id=b.blocked where b.blocker=?', c.u.id) }));
R('POST', '/api/blocks', c => {
  const t = +c.body.user_id, uid = c.u.id;
  if (!one('select 1 from users where id=?', t) || t === uid) throw fail('대상을 찾을 수 없어요.', 404);
  tx(() => {
    run('insert or ignore into blocks(blocker,blocked) values(?,?)', uid, t);
    run('delete from connections where (from_id=? and to_id=?) or (from_id=? and to_id=?)', uid, t, t, uid);
    run(`delete from post_members where access='invited' and ((user_id=? and invited_by=?) or (user_id=? and invited_by=?))`, uid, t, t, uid);
    run(`delete from meetup_participants where rsvp='invited' and ((user_id=? and meetup_id in (select id from meetups where organizer_id=?)) or (user_id=? and meetup_id in (select id from meetups where organizer_id=?)))`, uid, t, t, uid);
    if (c.body.hideShared) for (const r of q(`select a.post_id from post_members a join post_members b on a.post_id=b.post_id where a.user_id=? and b.user_id=? and a.access='accepted' and b.access='accepted'`, uid, t)) run(`insert or ignore into hides values(?, 'post', ?)`, uid, r.post_id);
  });
  return {};
});
R('DELETE', '/api/blocks/:id', c => { run('delete from blocks where blocker=? and blocked=?', c.u.id, +c.params.id); return {}; });

// ----- 그룹 (편의용 묶음. 권한을 주지 않는다) -----
const groupOf = (gid, uid) => { const g = one('select * from groups where id=?', gid); if (!g || !one('select 1 from group_members where group_id=? and user_id=?', gid, uid)) throw fail('그룹을 찾을 수 없어요.', 404); return g; };
R('GET', '/api/groups', c => ({ groups: q('select g.* from groups g join group_members m on m.group_id=g.id where m.user_id=? order by g.id desc', c.u.id).map(g => ({ ...g, members: q('select u.id,u.name from group_members m join users u on u.id=m.user_id where m.group_id=? order by u.id', g.id) })) }));
R('POST', '/api/groups', c => {
  const members = friendsOnly(c.u.id, ids(c.body.member_ids));
  const name = str(c.body.name, 20, 1), hint = ['friend', 'family', 'couple'].includes(c.body.type_hint) ? c.body.type_hint : null;
  const key = [c.u.id, ...members].sort((a, b) => a - b).join();
  const dup = q('select g.id,g.name from groups g join group_members m on m.group_id=g.id where m.user_id=?', c.u.id).find(g => q('select user_id from group_members where group_id=? order by user_id', g.id).map(r => r.user_id).join() === key);
  const id = tx(() => { const gid = run('insert into groups(owner_id,name,type_hint) values(?,?,?)', c.u.id, name, hint).lastInsertRowid; for (const m of [c.u.id, ...members]) run('insert into group_members values(?,?)', gid, m); return gid; });
  return { id, duplicateOf: dup?.name || null };
});
R('POST', '/api/groups/:id/members', c => {
  const g = groupOf(+c.params.id, c.u.id); if (g.owner_id !== c.u.id) throw fail('그룹 소유자만 초대할 수 있어요.', 403);
  for (const m of friendsOnly(c.u.id, ids(c.body.user_ids))) run('insert or ignore into group_members values(?,?)', g.id, m);
  return {};
});
R('DELETE', '/api/groups/:id/members/:uid', c => {
  const g = groupOf(+c.params.id, c.u.id), t = +c.params.uid;
  if (t !== c.u.id && g.owner_id !== c.u.id) throw fail('그룹 소유자만 내보낼 수 있어요.', 403);
  if (t === g.owner_id) throw fail('소유자는 그룹을 삭제해야 나갈 수 있어요.', 409);
  run('delete from group_members where group_id=? and user_id=?', g.id, t); return {};
});
R('DELETE', '/api/groups/:id', c => {
  const g = groupOf(+c.params.id, c.u.id); if (g.owner_id !== c.u.id) throw fail('그룹 소유자만 삭제할 수 있어요.', 403);
  tx(() => { run('delete from group_members where group_id=?', g.id); run('delete from post_groups where group_id=?', g.id); run('delete from groups where id=?', g.id); }); // 추억은 그대로
  return {};
});

// ----- 추억(공동 게시물) -----
function filtered(c) {
  const uid = c.u.id, Q = c.query;
  const people = ids((Q.people || '').split(',')), and = Q.mode !== 'or', year = /^\d{4}$/.test(Q.year || '') ? Q.year : null, g = +Q.group || null;
  if (g) groupOf(g, uid);
  return accessible(uid).filter(p => {
    if (year && (p.occurred_on || '').slice(0, 4) !== year) return false;
    if (g && !one('select 1 from post_groups where post_id=? and group_id=?', p.id, g)) return false;
    if (people.length) {
      const have = new Set(q('select user_id from post_participants where post_id=? and attended=1', p.id).map(r => r.user_id));
      if (!(and ? people.every(x => have.has(x)) : people.some(x => have.has(x)))) return false;
    }
    return true;
  }).sort((a, b) => (b.occurred_on || '').localeCompare(a.occurred_on || '') || b.id - a.id);
}
R('GET', '/api/posts', c => ({ posts: filtered(c).map(p => card(p, c.u.id)) }));

R('GET', '/api/map', c => {
  const posts = filtered(c).map(p => ({ ...card(p, c.u.id) })).filter(p => p.place);
  const tree = {};
  for (const p of posts) { const { country, city, label } = p.place; (((tree[country] ||= {})[city] ||= []).push({ id: p.id, title: p.title, occurred_on: p.occurred_on, label, cover: p.cover, count: p.count })); }
  return { countries: Object.entries(tree).map(([country, cities]) => ({ country, count: Object.values(cities).flat().length, cities: Object.entries(cities).map(([city, items]) => ({ city, count: items.length, items })) })), total: posts.length };
});

R('GET', '/api/today', c => {
  if (!c.u.mem_enabled) return { enabled: false, items: [] };
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(c.query.date || '');
  if (!d) throw fail('날짜가 올바르지 않아요.');
  const y = +d[1], md = `${d[2]}-${d[3]}`, mds = [md];
  if (md === '02-28' && !leap(y)) mds.push('02-29'); // OD-05: 평년에는 2/29 기록을 2/28에
  const bl = new Set(blockedIds(c.u.id).split(',').map(Number));
  const hiddenUsers = new Set(q(`select target_id from hides where user_id=? and target_type='user'`, c.u.id).map(r => r.target_id));
  const items = accessible(c.u.id).filter(p => {
    if (!p.occurred_on || !mds.includes(p.occurred_on.slice(5)) || +p.occurred_on.slice(0, 4) >= y) return false;
    return !q(`select user_id from post_members where post_id=? and access='accepted'`, p.id).some(m => bl.has(m.user_id) || hiddenUsers.has(m.user_id));
  }).map(p => ({ ...card(p, c.u.id), years_ago: y - +p.occurred_on.slice(0, 4), saved: !!one('select 1 from saves where user_id=? and post_id=?', c.u.id, p.id) }));
  return { enabled: true, items };
});

R('GET', '/api/home', c => {
  const u = c.u.id, now = new Date().toISOString();
  return {
    postInvites: q(`select p.id,p.title,i.name inviter from post_members m join posts p on p.id=m.post_id join users i on i.id=m.invited_by where m.user_id=? and m.access='invited' and p.status!='deleted'`, u),
    friendRequests: q(`select u.id,u.name from connections c join users u on u.id=c.from_id where c.to_id=? and c.status='pending'`, u),
    meetupInvites: q(`select m.id,m.title,m.starts_at,m.tz from meetups m join meetup_participants p on p.meetup_id=m.id where p.user_id=? and p.rsvp='invited' and m.status='active' and m.starts_at>?`, u, now),
    upcoming: q(`select m.id,m.title,m.starts_at,m.tz,m.place,p.rsvp from meetups m join meetup_participants p on p.meetup_id=m.id where p.user_id=? and m.status='active' and m.starts_at>? order by m.starts_at limit 3`, u, now),
    posts: accessible(u).sort((a, b) => b.id - a.id).slice(0, 30).map(p => card(p, u)),
  };
});

function postForCreate(c, b) {
  const uid = c.u.id, title = str(b.title, 40, 1), members = friendsOnly(uid, ids(b.member_ids));
  if (!members.length) throw fail('함께한 사람을 한 명 이상 선택해 주세요.');
  const date = b.occurred_on ? (dateOk(b.occurred_on) ? b.occurred_on : (() => { throw fail('날짜가 올바르지 않아요.'); })()) : null;
  const gid = +b.group_id || null; if (gid) groupOf(gid, uid);
  const mid = +b.meetup_id || null; if (mid && !one('select 1 from meetup_participants where meetup_id=? and user_id=?', mid, uid)) throw fail('모임을 찾을 수 없어요.', 404);
  return { title, members, date, gid, mid, place: placeIn(b.place) };
}
R('POST', '/api/posts', c => {
  const uid = c.u.id, x = postForCreate(c, c.body);
  const text = optStr(c.body.text, 2000);
  return { id: tx(() => {
    const pl = x.place;
    const pid = run(`insert into posts(admin_id,title,occurred_on,meetup_id,place_name,place_area,place_city,place_country,place_precision) values(?,?,?,?,?,?,?,?,?)`, uid, x.title, x.date, x.mid, pl.place_name ?? null, pl.place_area ?? null, pl.place_city ?? null, pl.place_country ?? null, pl.place_precision ?? 'city').lastInsertRowid;
    run(`insert into post_members(post_id,user_id,role,access,invited_by) values(?,?, 'admin','accepted',?)`, pid, uid, uid);
    run('insert into post_participants(post_id,user_id) values(?,?)', pid, uid);
    for (const m of x.members) run(`insert into post_members(post_id,user_id,invited_by) values(?,?,?)`, pid, m, uid);
    if (x.gid) run('insert into post_groups values(?,?)', pid, x.gid);
    if (text) run(`insert into notes(post_id,author_id,kind,text) values(?,?, 'story',?)`, pid, uid, text);
    return pid;
  }) };
});

R('GET', '/api/posts/:id', c => {
  const uid = c.u.id, pid = +c.params.id, { p, m } = access(pid, uid);
  if (m.access === 'invited') { // OD-01: 수락 전에는 초대한 사람 이름과 일반 제목만
    return { preview: true, id: p.id, title: p.title, inviter: one('select name from users where id=?', m.invited_by)?.name };
  }
  const bl = blockedIds(uid);
  const hidden = new Set(q(`select target_type||':'||target_id k from hides where user_id=? and target_type in ('note','media')`, uid).map(r => r.k));
  return {
    id: p.id, title: p.title, occurred_on: p.occurred_on, status: p.status, cover: p.cover_media_id,
    place: placeView(p), place_raw: m.role === 'admin' ? { name: p.place_name, area: p.place_area, city: p.place_city, country: p.place_country, precision: p.place_precision } : undefined,
    me: { id: uid, role: m.role },
    members: q(`select u.id,u.name,m.role,m.access from post_members m join users u on u.id=m.user_id where m.post_id=? and m.access in ('accepted','invited') order by m.access='accepted' desc, m.role='admin' desc, u.id`, pid),
    media: q(`select id,uploader_id,status from media where post_id=? and status in ('active','restricted') and uploader_id not in (${bl}) order by id`, pid).filter(x => !hidden.has('media:' + x.id)).map(x => ({ id: x.id, mine: x.uploader_id === uid, restricted: x.status === 'restricted' })),
    notes: q(`select n.id,n.kind,n.text,n.status,n.created_at,n.author_id,u.name author from notes n join users u on u.id=n.author_id where n.post_id=? and n.status in ('active','restricted') and n.author_id not in (${bl}) order by n.id`, pid).filter(x => !hidden.has('note:' + x.id)).map(n => ({ id: n.id, kind: n.kind, author: n.author, created_at: n.created_at, mine: n.author_id === uid, restricted: n.status === 'restricted', text: n.status === 'restricted' ? '' : n.text })),
    saved: !!one('select 1 from saves where user_id=? and post_id=?', uid, pid),
    reactions: { count: one(`select count(*) n from reactions where post_id=?`, pid).n, mine: !!one('select 1 from reactions where post_id=? and user_id=?', pid, uid) },
    groups: q(`select g.id,g.name from post_groups pg join groups g on g.id=pg.group_id join group_members gm on gm.group_id=g.id and gm.user_id=? where pg.post_id=?`, uid, pid),
    meetup: p.meetup_id && one('select 1 from meetup_participants where meetup_id=? and user_id=?', p.meetup_id, uid) ? one('select id,title,status from meetups where id=?', p.meetup_id) : null,
  };
});

R('POST', '/api/posts/:id/respond', c => {
  const pid = +c.params.id, { m } = access(pid, c.u.id);
  if (m.access !== 'invited') throw fail('이미 응답한 초대예요.', 409);
  logAct(pid, c.u.id, c.body.accept ? '초대를 수락했어요' : '초대를 거절했어요');
  tx(() => {
    run('update post_members set access=? where post_id=? and user_id=?', c.body.accept ? 'accepted' : 'declined', pid, c.u.id);
    if (c.body.accept) run('insert or ignore into post_participants(post_id,user_id) values(?,?)', pid, c.u.id);
  });
  return {};
});
R('POST', '/api/posts/:id/leave', c => { leavePost(+c.params.id, c.u.id, !!c.body.deleteMine); return {}; });
R('PATCH', '/api/posts/:id', c => {
  const pid = +c.params.id; admin(pid, c.u.id);
  const b = c.body; logAct(pid, c.u.id, [b.title !== undefined && '제목', b.occurred_on !== undefined && '날짜', b.place !== undefined && '장소'].filter(Boolean).join('·') + ' 정보를 수정했어요');
  if (b.title !== undefined) run('update posts set title=? where id=?', str(b.title, 40, 1), pid);
  if (b.occurred_on !== undefined) { if (b.occurred_on && !dateOk(b.occurred_on)) throw fail('날짜가 올바르지 않아요.'); run('update posts set occurred_on=? where id=?', b.occurred_on || null, pid); }
  if (b.place !== undefined) { const pl = placeIn(b.place); run('update posts set place_name=?,place_area=?,place_city=?,place_country=?,place_precision=? where id=?', pl.place_name ?? null, pl.place_area ?? null, pl.place_city ?? null, pl.place_country ?? null, pl.place_precision ?? 'city', pid); }
  return {};
});
R('POST', '/api/posts/:id/invite', c => {
  const pid = +c.params.id; active(admin(pid, c.u.id));
  logAct(pid, c.u.id, `${ids(c.body.user_ids).length}명을 초대했어요`);
  tx(() => { for (const u of friendsOnly(c.u.id, ids(c.body.user_ids))) {
    const cur = one('select access from post_members where post_id=? and user_id=?', pid, u);
    if (!cur) run('insert into post_members(post_id,user_id,invited_by) values(?,?,?)', pid, u, c.u.id);
    else if (['left', 'declined', 'removed'].includes(cur.access)) run(`update post_members set access='invited', invited_by=? where post_id=? and user_id=?`, c.u.id, pid, u);
  } });
  return {};
});
R('DELETE', '/api/posts/:id/members/:uid', c => {
  const pid = +c.params.id, t = +c.params.uid; admin(pid, c.u.id);
  if (t === c.u.id) throw fail('나가기를 이용해 주세요.');
  logAct(pid, c.u.id, '참여자 1명을 내보냈어요');
  run(`update post_members set access='removed' where post_id=? and user_id=?`, pid, t); run('delete from post_participants where post_id=? and user_id=?', pid, t); return {};
});
R('POST', '/api/posts/:id/admin', c => {
  const pid = +c.params.id, t = +c.body.user_id; admin(pid, c.u.id);
  if (!one(`select 1 from post_members where post_id=? and user_id=? and access='accepted'`, pid, t)) throw fail('참여 중인 사람에게만 넘길 수 있어요.');
  logAct(pid, c.u.id, '관리자를 넘겼어요');
  tx(() => { run(`update post_members set role='contributor' where post_id=? and user_id=?`, pid, c.u.id); run(`update post_members set role='admin' where post_id=? and user_id=?`, pid, t); run('update posts set admin_id=? where id=?', t, pid); });
  return {};
});
R('POST', '/api/posts/:id/close', c => { const pid = +c.params.id; admin(pid, c.u.id); logAct(pid, c.u.id, c.body.closed ? '추억을 종료했어요' : '추억을 다시 열었어요'); run('update posts set status=? where id=?', c.body.closed ? 'closed' : 'active', pid); return {}; });
R('DELETE', '/api/posts/:id', c => { const pid = +c.params.id; admin(pid, c.u.id); purgePost(pid); return {}; });

R('GET', '/api/posts/:id/log', c => { const pid = +c.params.id; member(pid, c.u.id); return { log: q('select l.what,l.created_at,u.name actor from post_log l join users u on u.id=l.actor_id where l.post_id=? order by l.id desc limit 50', pid) }; });
R('POST', '/api/posts/:id/cover', c => {
  const pid = +c.params.id; member(pid, c.u.id);
  logAct(pid, c.u.id, '대표 사진을 바꿨어요');
  if (!one(`select 1 from media where id=? and post_id=? and status='active'`, +c.body.media_id, pid)) throw fail('사진을 찾을 수 없어요.', 404);
  run('update posts set cover_media_id=? where id=?', +c.body.media_id, pid); return {};
});

// 사진: JPEG만 받고 EXIF(APP1: GPS 포함)는 업로드 시 제거한다.
function stripJpeg(b) {
  if (b[0] !== 0xFF || b[1] !== 0xD8 || b[2] !== 0xFF) throw fail('JPEG 사진만 올릴 수 있어요.', 415);
  const out = [b.subarray(0, 2)]; let i = 2;
  while (i + 4 <= b.length && b[i] === 0xFF) {
    const mk = b[i + 1]; if (mk === 0xDA) break;
    const len = b.readUInt16BE(i + 2);
    if (mk !== 0xE1) out.push(b.subarray(i, i + 2 + len)); // APP1(EXIF/XMP) 제거
    i += 2 + len;
  }
  out.push(b.subarray(i)); return Buffer.concat(out);
}
R('POST', '/api/posts/:id/media', async c => {
  const pid = +c.params.id; active(member(pid, c.u.id));
  const buf = stripJpeg(await c.raw(8 * 1024 * 1024));
  const file = crypto.randomBytes(16).toString('hex') + '.jpg';
  fs.writeFileSync(path.join(DATA, 'media', file), buf);
  return { id: run('insert into media(post_id,uploader_id,file) values(?,?,?)', pid, c.u.id, file).lastInsertRowid };
}, { raw: true });
R('GET', '/media/:id', c => { // 요청마다 권한 확인: 로그인 + 현재 멤버. 권한이 사라지면 즉시 접근 불가.
  const m = one(`select * from media where id=? and status='active'`, +c.params.id);
  if (!m) throw fail('찾을 수 없어요.', 404);
  member(m.post_id, c.u.id);
  if (blockedBetween(c.u.id, m.uploader_id) && m.uploader_id !== c.u.id) throw fail('찾을 수 없어요.', 404);
  return { _raw: fs.readFileSync(path.join(DATA, 'media', m.file)), type: 'image/jpeg' };
});
R('DELETE', '/api/media/:id', c => {
  const m = one(`select * from media where id=? and status!='deleted'`, +c.params.id);
  if (!m || m.uploader_id !== c.u.id) throw fail('내가 올린 사진만 삭제할 수 있어요.', 403);
  purgeMedia([m]); return {};
});
R('POST', '/api/posts/:id/notes', c => {
  const pid = +c.params.id; active(member(pid, c.u.id));
  const kind = c.body.kind === 'comment' ? 'comment' : 'story';
  return { id: run('insert into notes(post_id,author_id,kind,text) values(?,?,?,?)', pid, c.u.id, kind, str(c.body.text, 2000, 1)).lastInsertRowid };
});
R('DELETE', '/api/notes/:id', c => {
  const n = one(`select * from notes where id=? and status!='deleted'`, +c.params.id);
  if (!n || n.author_id !== c.u.id) throw fail('내가 쓴 글만 삭제할 수 있어요.', 403);
  run(`update notes set status='deleted', text='' where id=?`, n.id); return {};
});
R('POST', '/api/posts/:id/react', c => {
  const pid = +c.params.id; member(pid, c.u.id);
  if (run('delete from reactions where post_id=? and user_id=?', pid, c.u.id).changes === 0) run('insert into reactions values(?,?)', pid, c.u.id);
  return {};
});

// ----- 모임 -----
function meetupFor(mid, uid) {
  const m = one('select * from meetups where id=?', mid), me_ = m && one('select * from meetup_participants where meetup_id=? and user_id=?', mid, uid);
  if (!m || !me_) throw fail('모임을 찾을 수 없어요.', 404);
  return { m, me: me_ };
}
const orgOnly = (mid, uid) => { const r = meetupFor(mid, uid); if (r.m.organizer_id !== uid) throw fail('주최자만 할 수 있어요.', 403); return r; };
const tzOk = tz => { try { new Intl.DateTimeFormat('ko-KR', { timeZone: tz || 'Asia/Seoul' }); return tz || 'Asia/Seoul'; } catch { return 'Asia/Seoul'; } };
const isoOk = s => { const t = Date.parse(s); if (isNaN(t)) throw fail('일시가 올바르지 않아요.'); return new Date(t).toISOString(); };

R('GET', '/api/meetups', c => ({ meetups: q(`select m.id,m.title,m.starts_at,m.tz,m.place,m.status,p.rsvp,u.name organizer, (select count(*) from meetup_participants x where x.meetup_id=m.id and x.rsvp='yes') yes from meetups m join meetup_participants p on p.meetup_id=m.id join users u on u.id=m.organizer_id where p.user_id=? order by m.starts_at desc`, c.u.id) }));
R('POST', '/api/meetups', c => {
  const uid = c.u.id; let inv = ids(c.body.user_ids);
  if (c.body.group_id) { groupOf(+c.body.group_id, uid); inv = [...new Set([...inv, ...q('select user_id from group_members where group_id=?', +c.body.group_id).map(r => r.user_id)])].filter(x => x !== uid && isFriend(uid, x)); } // 시점 스냅샷
  friendsOnly(uid, inv);
  return { id: tx(() => {
    const mid = run('insert into meetups(organizer_id,title,starts_at,tz,place,descr) values(?,?,?,?,?,?)', uid, str(c.body.title, 40, 1), isoOk(c.body.starts_at), tzOk(c.body.tz), optStr(c.body.place, 60), optStr(c.body.descr, 500)).lastInsertRowid;
    run(`insert into meetup_participants(meetup_id,user_id,rsvp) values(?,?, 'yes')`, mid, uid);
    for (const u of inv) run('insert into meetup_participants(meetup_id,user_id) values(?,?)', mid, u);
    return mid;
  }) };
});
R('GET', '/api/meetups/:id', c => {
  const mid = +c.params.id, uid = c.u.id, { m, me: mine } = meetupFor(mid, uid);
  const sets = q(`select s.* from settlements s where s.meetup_id=? and (s.creator_id=? or s.payer_id=? or exists(select 1 from shares h where h.settlement_id=s.id and h.user_id=?))`, mid, uid, uid, uid)
    .map(s => ({ ...s, payer: one('select name from users where id=?', s.payer_id).name, shares: q('select u.id,u.name,h.amount,h.confirmed from shares h join users u on u.id=h.user_id where h.settlement_id=?', s.id) }));
  return { ...m, organizer: one('select name from users where id=?', m.organizer_id).name, mine,
    participants: q('select u.id,u.name,p.rsvp,p.attended from meetup_participants p join users u on u.id=p.user_id where p.meetup_id=? order by u.id', mid),
    settlements: sets,
    posts: q(`select p.id from posts p join post_members x on x.post_id=p.id where p.meetup_id=? and x.user_id=? and x.access='accepted' and p.status!='deleted'`, mid, uid).map(r => card(one('select * from posts where id=?', r.id), uid)) };
});
R('PATCH', '/api/meetups/:id', c => {
  const mid = +c.params.id, { m } = orgOnly(mid, c.u.id), b = c.body;
  const next = { title: b.title !== undefined ? str(b.title, 40, 1) : m.title, starts_at: b.starts_at ? isoOk(b.starts_at) : m.starts_at, tz: b.tz ? tzOk(b.tz) : m.tz, place: b.place !== undefined ? optStr(b.place, 60) : m.place, descr: b.descr !== undefined ? optStr(b.descr, 500) : m.descr };
  tx(() => {
    run('update meetups set title=?,starts_at=?,tz=?,place=?,descr=? where id=?', next.title, next.starts_at, next.tz, next.place, next.descr, mid);
    if (next.starts_at !== m.starts_at || next.place !== m.place) run(`update meetup_participants set rsvp='invited' where meetup_id=? and user_id!=?`, mid, c.u.id); // 중대한 변경: 재응답
  });
  return { reconfirm: next.starts_at !== m.starts_at || next.place !== m.place };
});
R('POST', '/api/meetups/:id/rsvp', c => {
  const mid = +c.params.id, { m } = meetupFor(mid, c.u.id);
  if (m.status !== 'active') throw fail('취소된 모임이에요.', 409);
  if (!['yes', 'no', 'maybe'].includes(c.body.rsvp)) throw fail('응답을 선택해 주세요.');
  run('update meetup_participants set rsvp=? where meetup_id=? and user_id=?', c.body.rsvp, mid, c.u.id); return {};
});
R('POST', '/api/meetups/:id/invite', c => {
  const mid = +c.params.id; orgOnly(mid, c.u.id);
  for (const u of friendsOnly(c.u.id, ids(c.body.user_ids))) run('insert or ignore into meetup_participants(meetup_id,user_id) values(?,?)', mid, u);
  return {};
});
R('POST', '/api/meetups/:id/cancel', c => { const mid = +c.params.id; orgOnly(mid, c.u.id); run(`update meetups set status='cancelled' where id=?`, mid); return {}; });
R('POST', '/api/meetups/:id/attended', c => { // RSVP와 별개인 실제 참석 확인. 게시물 멤버는 자동으로 만들지 않는다.
  const mid = +c.params.id, { m } = orgOnly(mid, c.u.id);
  if (Date.parse(m.starts_at) > Date.now()) throw fail('모임이 시작된 뒤에 확인할 수 있어요.', 409);
  const yes = new Set(ids(c.body.user_ids));
  tx(() => { for (const p of q('select user_id from meetup_participants where meetup_id=?', mid)) run('update meetup_participants set attended=? where meetup_id=? and user_id=?', yes.has(p.user_id) ? 1 : 0, mid, p.user_id); });
  return {};
});

// ----- 정산 (참여자만 열람. 추억·지도·회상에는 절대 포함하지 않는다) -----
R('POST', '/api/meetups/:id/settlements', c => {
  const mid = +c.params.id, uid = c.u.id; meetupFor(mid, uid);
  const part = new Set(q('select user_id from meetup_participants where meetup_id=?', mid).map(r => r.user_id));
  const members = ids(c.body.member_ids), payer = +c.body.payer_id, total = Number(c.body.total);
  if (!Number.isInteger(total) || total <= 0 || total > 1e9) throw fail('금액은 1원 이상의 정수로 입력해 주세요.');
  if (!members.length || ![payer, ...members].every(x => part.has(x))) throw fail('모임 참여자만 정산에 넣을 수 있어요.');
  let amounts;
  if (c.body.method === 'custom') {
    amounts = members.map(m => Math.round(Number(c.body.amounts?.[m]) || 0));
    const diff = amounts.reduce((a, b) => a + b, 0) - total;
    if (amounts.some(a => a < 0)) throw fail('금액은 0원 이상이어야 해요.');
    if (diff) throw fail(`나눈 금액의 합이 전체 금액보다 ${Math.abs(diff).toLocaleString('ko-KR')}원 ${diff > 0 ? '많아요' : '적어요'}.`);
  } else {
    const base = Math.floor(total / members.length), rest = total - base * members.length;
    amounts = members.map(() => base); amounts[Math.max(0, members.indexOf(payer))] += rest; // 남는 금액은 지출한 사람(없으면 첫 번째)이 부담
  }
  return { id: tx(() => {
    const sid = run('insert into settlements(meetup_id,creator_id,payer_id,title,total) values(?,?,?,?,?)', mid, uid, payer, str(c.body.title, 40, 1), total).lastInsertRowid;
    members.forEach((m, i) => run('insert into shares(settlement_id,user_id,amount,confirmed) values(?,?,?,?)', sid, m, amounts[i], m === payer ? 1 : 0));
    return sid;
  }) };
});
R('POST', '/api/settlements/:id/confirm', c => { // 본인 몫만 본인이 확인
  const sid = +c.params.id;
  if (!run('update shares set confirmed=1 where settlement_id=? and user_id=?', sid, c.u.id).changes) throw fail('정산을 찾을 수 없어요.', 404);
  if (!one('select 1 from shares where settlement_id=? and confirmed=0', sid)) run(`update settlements set status='done' where id=?`, sid);
  return {};
});
R('DELETE', '/api/settlements/:id', c => {
  const s = one('select * from settlements where id=?', +c.params.id);
  if (!s || s.creator_id !== c.u.id) throw fail('정산을 만든 사람만 삭제할 수 있어요.', 403);
  tx(() => { run('delete from shares where settlement_id=?', s.id); run('delete from settlements where id=?', s.id); }); return {};
});

// ----- 신고 / 숨김 -----
const CATS = ['privacy', 'harass', 'sexual_minor', 'impersonation', 'illegal', 'rights', 'spam', 'other'];
R('POST', '/api/reports', c => {
  const { target_type: t, category } = c.body, tid = +c.body.target_id, uid = c.u.id;
  if (!CATS.includes(category) || !['post', 'note', 'media', 'user'].includes(t)) throw fail('신고 유형을 선택해 주세요.');
  if (t === 'post') member(tid, uid);
  if (t === 'media') { const m = one('select post_id from media where id=?', tid); if (!m) throw fail('찾을 수 없어요.', 404); member(m.post_id, uid); }
  if (t === 'note') { const n = one('select post_id from notes where id=?', tid); if (!n) throw fail('찾을 수 없어요.', 404); member(n.post_id, uid); }
  if (t === 'user' && !one('select 1 from users where id=?', tid)) throw fail('찾을 수 없어요.', 404);
  tx(() => {
    run('insert into reports(reporter_id,target_type,target_id,category,detail) values(?,?,?,?,?)', uid, t, tid, category, optStr(c.body.detail, 1000));
    if (c.body.hide && t !== 'user') run('insert or ignore into hides values(?,?,?)', uid, t, tid);
    if (category === 'sexual_minor') { // 고위험 유형: 검토 전까지 모두에게 임시 제한
      if (t === 'media') { run(`update media set status='restricted' where id=? and status='active'`, tid); run('update posts set cover_media_id=null where cover_media_id=?', tid); }
      if (t === 'note') run(`update notes set status='restricted' where id=? and status='active'`, tid);
    }
  });
  return {};
});
R('GET', '/api/reports', c => ({ reports: q('select id,target_type,category,status,created_at from reports where reporter_id=? order by id desc', c.u.id) }));

R('POST', '/api/saves', c => { // 개인 저장: 나만의 책갈피. 다른 사람에게 보이지 않는다.
  const pid = +c.body.post_id; member(pid, c.u.id);
  if (run('delete from saves where user_id=? and post_id=?', c.u.id, pid).changes === 0) run('insert into saves values(?,?)', c.u.id, pid);
  return {};
});
R('GET', '/api/saves', c => { const ok = new Set(accessible(c.u.id).map(p => p.id)); return { posts: q('select post_id from saves where user_id=?', c.u.id).filter(r => ok.has(r.post_id)).map(r => card(one('select * from posts where id=?', r.post_id), c.u.id)) }; });
const PRIV = ['access', 'correct', 'delete', 'stop'];
R('POST', '/api/privacy', c => {
  if (!PRIV.includes(c.body.kind)) throw fail('요청 종류를 선택해 주세요.');
  return { id: run('insert into privacy_requests(user_id,kind,detail) values(?,?,?)', c.u.id, c.body.kind, optStr(c.body.detail, 1000)).lastInsertRowid };
});
R('GET', '/api/privacy', c => ({ requests: q('select id,kind,status,created_at from privacy_requests where user_id=? order by id desc', c.u.id) }));
R('GET', '/api/hides', c => ({
  posts: q(`select p.id,p.title from hides h join posts p on p.id=h.target_id where h.user_id=? and h.target_type='post'`, c.u.id),
  users: q(`select u.id,u.name from hides h join users u on u.id=h.target_id where h.user_id=? and h.target_type='user'`, c.u.id),
}));
R('POST', '/api/hides', c => {
  const t = c.body.type, id = +c.body.id;
  if (t === 'post') member(id, c.u.id);
  else if (t === 'user') { if (!one('select 1 from users where id=?', id)) throw fail('찾을 수 없어요.', 404); }
  else throw fail('대상이 올바르지 않아요.');
  run('insert or ignore into hides values(?,?,?)', c.u.id, t, id); return {};
});
R('DELETE', '/api/hides/:type/:id', c => { run('delete from hides where user_id=? and target_type=? and target_id=?', c.u.id, c.params.type, +c.params.id); return {}; });

// ---------- 서버 ----------
const readBody = (req, max) => new Promise((ok, no) => {
  const ch = []; let n = 0, big = false;
  req.on('data', d => { n += d.length; if (n > max) big = true; else ch.push(d); });
  req.on('end', () => big ? no(fail('파일이 너무 커요. 8MB 이하로 올려 주세요.', 413)) : ok(Buffer.concat(ch)));
  req.on('error', no);
});
const SEC = { 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src https://cdn.jsdelivr.net; frame-ancestors 'none'" };
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json' };

async function handle(req, res) {
  const url = new URL(req.url, 'http://x');
  const route = routes.filter(r => r.method === req.method).map(r => ({ r, m: r.re.exec(url.pathname) })).find(x => x.m);
  if (!route) {
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/')) throw fail('찾을 수 없어요.', 404);
    let f = path.join(here, 'public', path.normalize(url.pathname));
    if (!f.startsWith(path.join(here, 'public')) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(here, 'public', 'index.html');
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream', 'cache-control': 'no-cache', ...SEC });
    return res.end(fs.readFileSync(f));
  }
  const { r, m } = route;
  const u = (() => { const t = /(?:^|; )sid=([^;]+)/.exec(req.headers.cookie || ''); return t ? one(`select u.* from sessions s join users u on u.id=s.user_id where s.token=? and u.status='active'`, t[1]) : null; })();
  if (req.method !== 'GET' && req.headers['x-ww'] !== '1') throw fail('잘못된 요청이에요.', 403); // CSRF: 커스텀 헤더 + SameSite=Strict
  if (!r.opt.pub && !u) throw fail('로그인이 필요해요.', 401);
  const c = { req, u, params: { ...m.groups }, query: Object.fromEntries(url.searchParams), cookie: null, raw: max => readBody(req, max) };
  if (!r.opt.raw) { const b = await readBody(req, 1 << 20); try { c.body = b.length ? JSON.parse(b) : {}; } catch { throw fail('요청 형식이 올바르지 않아요.'); } }
  if (r.opt.soft && !u) { res.writeHead(401, { 'content-type': 'application/json' }); return res.end('{"error":"로그인이 필요해요."}'); }
  const out = await r.fn(c);
  const h = { 'cache-control': 'no-store', ...SEC }; if (c.cookie) h['set-cookie'] = c.cookie;
  if (out?._raw) { res.writeHead(200, { ...h, 'content-type': out.type, 'cache-control': 'private, no-store' }); return res.end(out._raw); }
  if (out?._download) h['content-disposition'] = `attachment; filename="${out._download}"`;
  res.writeHead(200, { ...h, 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(out ?? {}));
}
export const server = http.createServer((req, res) => handle(req, res).catch(e => {
  if (!e.status) console.error(e);
  if (res.headersSent) return res.end();
  res.writeHead(e.status || 500, { 'content-type': 'application/json; charset=utf-8', ...SEC });
  res.end(JSON.stringify({ error: e.status ? e.message : '문제가 생겼어요. 잠시 후 다시 시도해 주세요.', ...e.extra }));
}));
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`우리사이 → http://localhost:${port}`));
}
