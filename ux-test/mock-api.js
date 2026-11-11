/* UX 테스트 전용 모의 API.
 * 브라우저의 fetch 를 가로채 /api/* 요청에 가상 데이터로 답한다. 서버·DB·쿠키 세션이 없다.
 * - 데이터는 이 브라우저 탭(sessionStorage)에만 있고 어디로도 전송되지 않는다.
 * - 비밀번호는 저장하지 않는다. 로그인은 가입해 둔 이름만 확인한다.
 * - 실제 서버의 권한 정책(초대 수락자만 열람 등)을 구현한 것이 아니다.
 */
import { FRIEND_POOL, TAKEN, ME_ID, DEMO_USER, DEMO_FRIENDS, DEMO_POSTS, SEED_MEDIA, demoPlans } from './seed.js';

const KEY = 'wsux_state', DRAFT = 'ws_draft';
const emit = (name, params) => window.dispatchEvent(new CustomEvent('ux:event', { detail: { name, params: params || {} } }));
const fresh = () => ({ mode: 'fresh', stash: null, user: null, loggedIn: false, friends: [], outgoing: [], links: [], posts: [], media: [], saves: [], meetups: [], seq: 200, completed: false });
let S;
const load = () => { try { S = JSON.parse(sessionStorage.getItem(KEY)) || fresh(); } catch { S = fresh(); } };
const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(S)); } catch { /* 저장 불가해도 메모리 상태로 동작 */ } };
load();

// 업로드한 사진은 브라우저 메모리(Blob)에만 둔다. 새로고침하면 사라진다.
const BLOBS = new Map();
// 샘플 사진(시안과 같은 Unsplash 사진의 정적 사본) > 사용자가 올린 사진(브라우저 메모리) > 대체 이미지. 사용자 사진은 샘플 사진으로 덮어쓰지 않는다.
export const mediaUrl = id => SEED_MEDIA[+id] || BLOBS.get(+id) || '/ux-test/media/seed-' + ((+id % 3) + 1) + '.svg';

export function resetAll() {
  S = fresh(); BLOBS.clear(); save();
  try { localStorage.removeItem(DRAFT); for (const k of ['ws_join', 'wsux_sent', 'wsux_run']) sessionStorage.removeItem(k); } catch { /* 무시 */ }
}
export const state = () => S;
export const markCompleted = () => { S.completed = true; save(); };

// 체험용 샘플 계정(demo)으로 시작한다. 지금 계정이 있으면 따로 보관해 두었다가 그 이름으로 로그인하면 돌려준다.
const strip = st => { const { stash, ...rest } = st; return rest; };
function demoState(prev) {
  const d = fresh();
  Object.assign(d, { mode: 'demo', user: { ...DEMO_USER }, loggedIn: true, friends: [...DEMO_FRIENDS], seq: 500, meetups: demoPlans(), posts: JSON.parse(JSON.stringify(DEMO_POSTS)).map(p => ({ ...p, seed: true, cover: null, reactions: false })) });
  if (prev && prev.user) d.stash = strip(prev);
  return d;
}
export function startDemo() { S = demoState(S.user ? S : null); save(); emit('experience_start', { mode: 'demo' }); }

const fail = (error, status = 400, field) => ({ status, body: { error, ...(field ? { field } : {}) } });
const ok = (body = {}) => ({ status: 200, body });
const meView = u => ({ id: u.id, name: u.name, nickname: u.name, username: u.username, mem_enabled: u.mem_enabled, has_password: true, nickname_updated_at: null });
const person = id => FRIEND_POOL.find(f => f.id === id);
const placeView = p => {
  if (!p.place || (!p.place.city && !p.place.country)) return null;
  const j = a => a.filter(Boolean).join(', '), q = p.place;
  const label = q.precision === 'exact' ? j([q.name, q.area, q.city]) : q.precision === 'area' ? j([q.area, q.city]) : (q.city || q.country);
  return { label, country: q.country || '기타', city: q.city || q.country || '기타', precision: q.precision || 'city' };
};
const cover = p => (p.cover || p.media[0] || null);
const acc = p => (p.accepted || []).map(person).filter(Boolean).map(f => f.name);
const card = p => ({ id: p.id, title: p.title, occurred_on: p.occurred_on, status: 'active', cover: cover(p), place: placeView(p), count: 1 + acc(p).length, names: [S.user.name, ...acc(p)].slice(0, 3) });

// 친구 요청은 몇 초 뒤 상대가 수락한 것으로 시뮬레이션한다.
const ACCEPT_MS = 3000;
function settle() {
  const now = Date.now(); let changed = false;
  for (const o of [...S.outgoing]) if (o.at <= now) { S.outgoing = S.outgoing.filter(x => x !== o); S.friends.push(o.id); changed = true; emit('friend_add_complete', { friend_count: S.friends.length }); }
  if (changed) save();
  return changed;
}
const scheduleSettle = () => {
  const next = Math.min(...S.outgoing.map(o => o.at));
  if (!isFinite(next)) return;
  setTimeout(() => { if (settle()) window.dispatchEvent(new HashChangeEvent('hashchange')); scheduleSettle(); }, Math.max(50, next - Date.now() + 30));
};

const needLogin = () => (S.loggedIn && S.user ? null : fail('로그인이 필요해요.', 401));
const usernameState = u => !/^[a-z0-9_]{3,20}$/.test(u) ? 'invalid' : TAKEN.includes(u) ? 'unavailable' : 'available';

const H = [];
const R = (method, re, fn, pub) => H.push({ method, re: new RegExp('^' + re + '$'), fn, pub });

R('GET', '/api/username-check', c => ok({ state: usernameState(String(c.q.get('u') || '').toLowerCase()) }), true);
R('GET', '/api/oauth/providers', () => ok({}), true); // 간편가입은 테스트 범위 밖
R('GET', '/api/me', () => (S.loggedIn && S.user ? ok(meView(S.user)) : ok(null)), true);
R('POST', '/api/signup', c => {
  const username = String(c.b.username || '').trim().toLowerCase(), name = String(c.b.nickname || c.b.name || '').trim();
  const us = usernameState(username);
  if (us === 'invalid') return fail('이름은 영문 소문자, 숫자, _ 로 3–20자예요.', 400, 'username');
  if (us === 'unavailable') return fail('현재 이 이름으로 가입할 수 없어요. 다른 이름을 써 주세요.', 409, 'username');
  if (!name) return fail('닉네임을 입력해 주세요.', 400, 'nickname');
  if (!c.b.consents || !c.b.consents.terms || !c.b.consents.privacy) return fail('필수 항목에 동의해 주세요.', 400);
  // 비밀번호는 받지도 저장하지도 않는다.
  S.user = { id: ME_ID, name, username, mem_enabled: true }; S.loggedIn = true; save();
  emit('sign_up', { method: 'username' });
  return ok(meView(S.user));
}, true);
R('POST', '/api/login', c => {
  const username = String(c.b.username || '').trim().toLowerCase();
  const here = S.user && S.user.username === username, held = S.stash && S.stash.user && S.stash.user.username === username;
  if (here) { /* 같은 계정 */ }
  else if (held) { const cur = strip(S); S = S.stash; S.stash = cur; } // 보관해 둔 다른 체험 계정으로 바꾼다
  else if (username === 'demo') S = demoState(S.user ? S : null);
  else return fail('이름 또는 비밀번호를 확인해 주세요. (체험에서는 이 브라우저에서 가입한 이름이나 demo 로 로그인해요. 비밀번호는 확인하지 않아요)', 401, 'password');
  S.loggedIn = true; save(); return ok(meView(S.user));
}, true);
R('POST', '/api/logout', () => { S.loggedIn = false; save(); return ok(); });
R('PATCH', '/api/me', c => {
  if (c.b.nickname !== undefined) { const n = String(c.b.nickname).trim(); if (!n) return fail('닉네임을 입력해 주세요.', 400, 'nickname'); S.user.name = n; }
  if (c.b.mem_enabled !== undefined) S.user.mem_enabled = !!c.b.mem_enabled;
  save(); return ok(meView(S.user));
});

// ----- 사람(친구) -----
R('GET', '/api/people', () => {
  settle(); scheduleSettle();
  return ok({
    friends: S.friends.map(person).filter(Boolean).map(({ id, name, username }) => ({ id, name, username })),
    incoming: [],
    outgoing: S.outgoing.map(o => person(o.id)).filter(Boolean).map(({ id, name, username }) => ({ id, name, username })),
    links: S.links.map(l => ({ code: l.code, expires_at: l.expires_at }))
  });
});
R('POST', '/api/people/request', c => {
  const un = String(c.b.username || '').trim().toLowerCase().replace(/^@/, '');
  const t = FRIEND_POOL.find(f => f.username === un);
  if (!t) return fail('사용자를 찾을 수 없어요.', 404, 'username');
  if (S.friends.includes(t.id)) return fail('이미 연결된 사람이에요.', 409, 'username');
  if (S.outgoing.some(o => o.id === t.id)) return fail('이미 요청을 보냈어요.', 409, 'username');
  S.outgoing.push({ id: t.id, at: Date.now() + ACCEPT_MS }); save(); scheduleSettle();
  return ok();
});
R('POST', '/api/people/(\\d+)/accept', () => ok());
R('DELETE', '/api/people/(\\d+)', c => { const id = +c.m[1]; S.friends = S.friends.filter(x => x !== id); S.outgoing = S.outgoing.filter(o => o.id !== id); save(); return ok(); });
R('POST', '/api/invites', () => { const code = 'test' + (++S.seq); S.links.unshift({ code, expires_at: new Date(Date.now() + 7 * 864e5).toISOString() }); save(); return ok({ code }); });
R('DELETE', '/api/invites/([^/]+)', c => { S.links = S.links.filter(l => l.code !== c.m[1]); save(); return ok(); });

// ----- 추억 -----
const posts = () => [...S.posts].sort((a, b) => (b.occurred_on || '').localeCompare(a.occurred_on || '') || b.id - a.id); // 서버와 같은 순서: 날짜 최신순, 같으면 나중에 만든 것 먼저
R('GET', '/api/home', () => { settle(); return ok({ postInvites: [], friendRequests: [], meetupInvites: [], upcoming: upcoming(), pastNudge: pastNudge(), posts: posts().map(card) }); });
R('GET', '/api/today', () => ok({ enabled: !!S.user && S.user.mem_enabled, items: [] }));
const filt = q => { const ids = (q.get('people') || '').split(',').filter(Boolean).map(Number), or = q.get('mode') === 'or', y = q.get('year'), acc = p => p.accepted || p.members || []; return p => (!y || (p.occurred_on || '').startsWith(y)) && (!ids.length || (or ? ids.some(i => acc(p).includes(i)) : ids.every(i => acc(p).includes(i)))); };
R('GET', '/api/posts', c => ok({ posts: posts().filter(filt(c.q)).map(card) }));
R('GET', '/api/map', c => {
  const tree = {}; let total = 0;
  for (const p of posts().filter(filt(c.q))) { const pv = placeView(p); if (!pv) continue; total++; (((tree[pv.country] ||= {})[pv.city] ||= []).push({ id: p.id, title: p.title, occurred_on: p.occurred_on, label: pv.label, cover: cover(p), count: 1 })); }
  return ok({ total, countries: Object.entries(tree).map(([country, cities]) => ({ country, count: Object.values(cities).flat().length, cities: Object.entries(cities).map(([city, items]) => ({ city, count: items.length, items })) })) });
});
R('POST', '/api/posts', c => {
  const title = String(c.b.title || '').trim();
  if (!title) return fail('추억 제목을 입력해 주세요.', 400, 'title');
  const ids = (c.b.member_ids || []).map(Number).filter(id => S.friends.includes(id));
  if (!ids.length) return fail('함께한 사람을 한 명 이상 선택해 주세요.');
  const p = { id: ++S.seq, title, occurred_on: c.b.occurred_on || null, place: c.b.place || null, members: ids, notes: [], media: [], cover: null, reactions: false };
  if (String(c.b.text || '').trim()) p.notes.push({ id: ++S.seq, kind: 'story', text: String(c.b.text).trim().slice(0, 2000), at: new Date().toISOString() });
  S.posts.push(p);
  if (c.b.meetup_id) { const mm = MS().find(x => x.id === +c.b.meetup_id); if (mm) (mm.post_ids ||= []).push(p.id); }
  save();
  emit('post_create_complete', { member_count: ids.length + 1, has_text: !!p.notes.length, has_place: !!(p.place && (p.place.name || p.place.area || p.place.city)) });
  return ok({ id: p.id });
});
const findPost = id => S.posts.find(p => p.id === +id);
R('GET', '/api/posts/(\\d+)', c => {
  const p = findPost(c.m[1]); if (!p) return fail('이 기록은 삭제되었어요.', 404);
  return ok({
    id: p.id, title: p.title, occurred_on: p.occurred_on, status: 'active', cover: cover(p), place: placeView(p),
    place_raw: p.place ? { name: p.place.name, area: p.place.area, city: p.place.city, country: p.place.country, precision: p.place.precision } : undefined,
    me: { id: ME_ID, role: 'admin' },
    // 초대한 친구는 수락 전(invited) 상태로 둔다. 가상 데이터라 수락은 일어나지 않는다.
    members: [{ id: ME_ID, name: S.user.name, role: 'admin', access: 'accepted' }, ...p.members.map(id => ({ id, name: person(id).name, role: 'member', access: (p.accepted || []).includes(id) ? 'accepted' : 'invited' }))],
    media: p.media.map(id => ({ id, mine: !p.seed, restricted: false })),
    notes: p.notes.map(n => ({ id: n.id, kind: n.kind, author: n.by || S.user.name, created_at: n.at || '2026-10-26T09:00:00.000Z', mine: !n.by, restricted: false, text: n.text })),
    saved: S.saves.includes(p.id), reactions: { count: p.reactions ? 1 : 0, mine: !!p.reactions }, groups: [], meetup: (m => m ? { id: m.id, title: m.title } : null)(MS().find(x => (x.post_ids || []).includes(p.id)))
  });
});
R('POST', '/api/posts/(\\d+)/notes', c => {
  const p = findPost(c.m[1]); if (!p) return fail('이 기록은 삭제되었어요.', 404);
  const text = String(c.b.text || '').trim(); if (!text) return fail('내용을 입력해 주세요.', 400, 'text');
  const n = { id: ++S.seq, kind: c.b.kind === 'comment' ? 'comment' : 'story', text: text.slice(0, 2000), at: new Date().toISOString() };
  p.notes.push(n); save(); return ok({ id: n.id });
});
R('DELETE', '/api/notes/(\\d+)', c => { for (const p of S.posts) p.notes = p.notes.filter(n => n.id !== +c.m[1]); save(); return ok(); });
R('POST', '/api/posts/(\\d+)/media', c => {
  const p = findPost(c.m[1]); if (!p) return fail('이 기록은 삭제되었어요.', 404);
  const id = ++S.seq; p.media.push(id); if (c.b instanceof Blob) BLOBS.set(id, URL.createObjectURL(c.b)); save(); return ok({ id });
});
R('DELETE', '/api/media/(\\d+)', c => { const id = +c.m[1]; for (const p of S.posts) { p.media = p.media.filter(x => x !== id); if (p.cover === id) p.cover = null; } BLOBS.delete(id); save(); return ok(); });
R('POST', '/api/posts/(\\d+)/cover', c => { const p = findPost(c.m[1]); if (p) { p.cover = +c.b.media_id; save(); } return ok(); });
R('POST', '/api/posts/(\\d+)/react', c => { const p = findPost(c.m[1]); if (p) { p.reactions = !p.reactions; save(); } return ok(); });
R('POST', '/api/posts/(\\d+)/close', () => ok());
R('DELETE', '/api/posts/(\\d+)', c => { S.posts = S.posts.filter(p => p.id !== +c.m[1]); save(); return ok(); });
R('POST', '/api/saves', c => { const id = +c.b.post_id; S.saves = S.saves.includes(id) ? S.saves.filter(x => x !== id) : [...S.saves, id]; save(); return ok(); });
R('GET', '/api/saves', () => ok({ posts: posts().filter(p => S.saves.includes(p.id)).map(card) }));

// ----- 테스트 범위 밖: 빈 목록으로 답해 화면이 깨지지 않게 한다 -----
R('GET', '/api/groups', () => ok({ groups: [] }));
// ----- 약속(시안의 '약속'): 목록·상세·만들기·응답·수정·취소 -----
const MS = () => (S.meetups ||= []);
const nameOf = id => id === S.user.id ? S.user.name : person(id)?.name || '알 수 없음';
const mine = m => m.parts[S.user.id] || null;
const mrow = m => { const yes = Object.entries(m.parts).filter(([, v]) => v === 'yes').map(([i]) => +i); return { id: m.id, title: m.title, starts_at: m.starts_at, tz: 'Asia/Seoul', place: m.place || '', status: m.status, rsvp: mine(m) || 'invited', organizer: nameOf(m.organizer_id), yes: yes.length, going: yes.filter(i => i !== S.user.id).slice(0, 3).map(nameOf), changed: m.changed || '', post_id: (m.post_ids || [])[0] || null }; };
const mine_ = () => MS().filter(m => mine(m));
const upcoming = () => mine_().filter(m => m.status === 'active' && Date.parse(m.starts_at) > Date.now()).sort((a, b) => a.starts_at.localeCompare(b.starts_at)).slice(0, 3).map(mrow);
const pastNudge = () => { const m = mine_().filter(m => m.status === 'active' && Date.parse(m.starts_at) < Date.now() && mine(m) === 'yes' && !(m.post_ids || []).length).sort((a, b) => b.starts_at.localeCompare(a.starts_at))[0]; return m ? mrow(m) : null; };
const mget = id => MS().find(m => m.id === +id);
const MISS = () => fail('이 약속은 볼 수 없어요.', 404);
R('GET', '/api/meetups', () => ok({ meetups: mine_().sort((a, b) => b.starts_at.localeCompare(a.starts_at)).map(mrow) }));
R('POST', '/api/meetups', c => {
  const title = String(c.b.title || '').trim(); if (!title) return fail('약속 이름을 입력해 주세요.', 400, 'title');
  if (!c.b.starts_at || isNaN(Date.parse(c.b.starts_at))) return fail('날짜와 시간을 입력해 주세요.', 400, 'when');
  const ids = (c.b.user_ids || []).map(Number).filter(i => S.friends.includes(i));
  const m = { id: ++S.seq, title: title.slice(0, 40), starts_at: new Date(c.b.starts_at).toISOString(), place: String(c.b.place || '').trim().slice(0, 60), descr: String(c.b.descr || '').trim().slice(0, 500), organizer_id: S.user.id, status: 'active', parts: { [S.user.id]: 'yes', ...Object.fromEntries(ids.map(i => [i, 'invited'])) }, post_ids: [] };
  MS().push(m); save(); return ok({ id: m.id });
});
R('GET', '/api/meetups/(\\d+)', c => {
  const m = mget(c.m[1]); if (!m || !mine(m)) return MISS();
  return ok({ ...mrow(m), tz: 'Asia/Seoul', descr: m.descr || '', organizer_id: m.organizer_id, mine: { rsvp: mine(m) },
    participants: Object.entries(m.parts).map(([id, rsvp]) => ({ id: +id, name: nameOf(+id), rsvp, attended: false })), settlements: [],
    posts: (m.post_ids || []).map(id => S.posts.find(p => p.id === id)).filter(Boolean).map(card) });
});
R('PATCH', '/api/meetups/(\\d+)', c => {
  const m = mget(c.m[1]); if (!m || m.organizer_id !== S.user.id) return MISS();
  const title = String(c.b.title || '').trim(); if (!title) return fail('약속 이름을 입력해 주세요.', 400, 'title');
  const at = c.b.starts_at ? new Date(c.b.starts_at).toISOString() : m.starts_at, place = String(c.b.place ?? m.place).trim(), notes = [];
  if (place !== m.place) notes.push(`장소가 ${m.place || '미정'}에서 ${place || '미정'}(으)로 바뀌었어요`);
  if (at !== m.starts_at) notes.push('날짜나 시간이 바뀌었어요');
  Object.assign(m, { title: title.slice(0, 40), starts_at: at, place, descr: String(c.b.descr ?? m.descr).trim() });
  if (notes.length) { m.changed = notes.join(' · ') + ' · ' + S.user.name + '님이 방금 수정'; for (const k of Object.keys(m.parts)) if (+k !== S.user.id && m.parts[k] !== 'invited') m.parts[k] = 'invited'; }
  save(); return ok();
});
R('POST', '/api/meetups/(\\d+)/rsvp', c => { const m = mget(c.m[1]); if (!m || !mine(m)) return MISS(); if (!['yes', 'maybe', 'no'].includes(c.b.rsvp)) return fail('응답을 선택해 주세요.'); m.parts[S.user.id] = c.b.rsvp; save(); return ok(); });
R('POST', '/api/meetups/(\\d+)/cancel', c => { const m = mget(c.m[1]); if (!m || m.organizer_id !== S.user.id) return MISS(); m.status = 'cancelled'; save(); return ok(); });
R('POST', '/api/meetups/(\\d+)/invite', c => { const m = mget(c.m[1]); if (!m || m.organizer_id !== S.user.id) return MISS(); for (const i of (c.b.user_ids || []).map(Number)) if (S.friends.includes(i) && !m.parts[i]) m.parts[i] = 'invited'; save(); return ok(); });
R('POST', '/api/meetups/(\\d+)/attended', () => ok());
R('GET', '/api/blocks', () => ok({ blocks: [] }));
R('GET', '/api/hides', () => ok({ posts: [], users: [] }));
R('GET', '/api/reports', () => ok({ reports: [] }));
R('GET', '/api/privacy', () => ok({ requests: [] }));

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const raw = typeof input === 'string' ? input : input.url, u = new URL(raw, location.origin);
  if (u.origin !== location.origin || !u.pathname.startsWith('/api/')) return realFetch(input, init);
  const method = (init.method || (typeof input === 'object' && input.method) || 'GET').toUpperCase();
  let b = init.body; if (typeof b === 'string') { try { b = JSON.parse(b); } catch { b = {}; } } else if (!(b instanceof Blob)) b = {};
  await new Promise(r => setTimeout(r, 120)); // 네트워크 지연을 흉내낸다
  const h = H.find(x => x.method === method && x.re.test(u.pathname));
  let res;
  if (!h) res = method === 'GET' ? fail('찾을 수 없어요.', 404) : fail('이 기능은 이번 테스트 범위에 없어요.', 501);
  else { const m = h.re.exec(u.pathname); res = (!h.pub && needLogin()) || h.fn({ m, q: u.searchParams, b }); }
  return new Response(JSON.stringify(res.body), { status: res.status, headers: { 'content-type': 'application/json' } });
};

// <img src="/media/:id"> 를 가상 사진으로 바꿔 준다.
const fixImgs = root => root.querySelectorAll?.('img[src^="/media/"]').forEach(i => { const m = /^\/media\/(\d+)/.exec(i.getAttribute('src')); if (m) i.src = mediaUrl(m[1]); });
new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => n.nodeType === 1 && (n.tagName === 'IMG' ? fixImgs(n.parentNode) : fixImgs(n))))).observe(document.documentElement, { childList: true, subtree: true });
