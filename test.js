// 권한·삭제 불변식 스모크 테스트 (PRD 18장). 실행: npm test
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';

process.env.DATA_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-'));
const { server } = await import('./server.js');
await new Promise(r => server.listen(0, r));
const base = `http://localhost:${server.address().port}`;

const client = () => {
  let cookie = '';
  const call = async (method, url, body, raw) => {
    const r = await fetch(base + url, { method, headers: { 'x-ww': '1', cookie, ...(raw ? {} : { 'content-type': 'application/json' }) }, body: raw || (body ? JSON.stringify(body) : undefined) });
    const sc = r.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
    const ct = r.headers.get('content-type') || '';
    return { status: r.status, data: ct.includes('json') ? await r.json() : Buffer.from(await r.arrayBuffer()) };
  };
  return { patch: (u, b) => call('PATCH', u, b || {}), get: u => call('GET', u), post: (u, b) => call('POST', u, b || {}), del: (u, b) => call('DELETE', u, b || {}), put: (u, raw) => call('POST', u, null, raw) };
};
const signup = async n => { const c = client(); const r = await c.post('/api/signup', { username: n, name: n, password: 'password123' }); c.id = r.data.id; return c; };
const friend = async (a, b, uname) => { await a.post("/api/people/request", { username: uname }); await b.post(`/api/people/${a.id}/accept`); };

// 가짜 JPEG: SOI + APP1(GPS 문자열 포함) + SOS
const app1 = Buffer.from('Exif\0\0GPSLATITUDE-SECRET');
const jpeg = Buffer.concat([Buffer.from([0xFF, 0xD8]), Buffer.from([0xFF, 0xE1, (app1.length + 2) >> 8, (app1.length + 2) & 255]), app1, Buffer.from([0xFF, 0xDA, 0, 2, 1, 2, 3])]);

const a = await signup('alice'), b = await signup('bob'), c = await signup('carol');
await friend(a, b, "bob"); await friend(a, c, "carol");
const g = (await a.post("/api/groups", { name: "모두", member_ids: [b.id, c.id] })).data;
assert.ok(g.id);

// 그룹 멤버라도 초대하지 않으면 접근 불가
const post = (await a.post('/api/posts', { title: '성수동', occurred_on: '2025-11-09', member_ids: [b.id], group_id: g.id, place: { name: '비밀카페', area: '성수동', city: '서울', country: '대한민국', precision: 'city' }, text: '안녕' })).data;
assert.equal((await c.get(`/api/posts/${post.id}`)).status, 403, '미초대 그룹 멤버는 접근 불가');
assert.equal((await c.get('/api/home')).data.posts.length, 0);

// 수락 전 미리보기엔 사진·장소·명단 없음
const pv = (await b.get(`/api/posts/${post.id}`)).data;
assert.equal(pv.preview, true); assert.equal(pv.members, undefined); assert.equal(pv.place, undefined);
assert.equal((await b.post(`/api/posts/${post.id}/media`)).status, 403, '수락 전 업로드 불가');
await b.post(`/api/posts/${post.id}/respond`, { accept: true });

// 업로드: EXIF 제거, 비멤버는 미디어 접근 불가
const up = await b.put(`/api/posts/${post.id}/media`, jpeg);
assert.equal(up.status, 200);
const stored = fs.readdirSync(path.join(process.env.DATA_DIR, 'media'));
assert.ok(!fs.readFileSync(path.join(process.env.DATA_DIR, 'media', stored[0])).includes('GPSLATITUDE'), 'EXIF GPS 제거');
assert.equal((await a.get(`/media/${up.data.id}`)).status, 200);
assert.equal((await c.get(`/media/${up.data.id}`)).status, 403);
assert.equal((await b.put(`/api/posts/${post.id}/media`, Buffer.from('not a jpeg'))).status, 415);

// 낮은 정밀도: 응답에 장소명/동네 없음
const detail = JSON.stringify((await b.get(`/api/posts/${post.id}`)).data);
assert.ok(!detail.includes('비밀카페') && !detail.includes('성수동 ') , '정밀도 city면 정확한 장소 비노출');

assert.equal((await a.get('/api/map')).data.total, 1);
assert.equal((await a.get('/api/map')).data.total, 1);
assert.equal((await c.get('/api/map')).data.total, 0);
assert.equal((await a.get(`/api/posts?people=${b.id}`)).data.posts.length, 1);
assert.equal((await a.get(`/api/posts?people=${c.id}`)).data.posts.length, 0, '그룹 소속≠함께한 사람');

// 정산 금액은 참여자만
const mt = (await a.post('/api/meetups', { title: '저녁', starts_at: new Date(Date.now() - 36e5).toISOString(), user_ids: [b.id, c.id] })).data;
await a.post(`/api/meetups/${mt.id}/settlements`, { title: '식비', total: 100, payer_id: a.id, member_ids: [a.id, b.id] });
assert.equal((await b.get(`/api/meetups/${mt.id}`)).data.settlements.length, 1);
assert.equal((await c.get(`/api/meetups/${mt.id}`)).data.settlements.length, 0, '정산 비참여자는 금액 비노출');
assert.equal((await a.post(`/api/meetups/${mt.id}/settlements`, { title: 'x', total: 100, payer_id: a.id, member_ids: [a.id, b.id], method: 'custom', amounts: { [a.id]: 10, [b.id]: 10 } })).status, 400, '합계 불일치 차단');

// 일정 변경 시 재응답
await b.post(`/api/meetups/${mt.id}/rsvp`, { rsvp: 'yes' });
await a.post(`/api/meetups/${mt.id}`.replace('/api/meetups/', '/api/meetups/') + '/invite', { user_ids: [] });
// 차단: 신규 초대 중단 + 서로 연결 해제
await b.post('/api/blocks', { user_id: a.id, hideShared: true });
assert.equal((await a.post(`/api/posts/${post.id}/invite`, { user_ids: [b.id] })).status, 400, '차단 후 초대 불가');
assert.equal((await b.get('/api/home')).data.posts.length, 0, '차단 시 공유 추억 숨김');

// 내 기여물 삭제 → 파일 제거
assert.equal((await b.del(`/api/media/${up.data.id}`)).status, 200);
assert.equal(fs.readdirSync(path.join(process.env.DATA_DIR, 'media')).length, 0, '삭제 시 원본 파일 제거');
assert.equal((await a.get(`/media/${up.data.id}`)).status, 404);

// 관리자는 나가기 전에 넘기거나 종료해야 함
await a.post(`/api/posts/${post.id}/invite`, { user_ids: [c.id] });
await c.post(`/api/posts/${post.id}/respond`, { accept: true });
assert.equal((await a.post(`/api/posts/${post.id}/leave`)).data.code, 'ADMIN_TRANSFER_REQUIRED');
await a.post(`/api/posts/${post.id}/admin`, { user_id: c.id });
assert.equal((await a.post(`/api/posts/${post.id}/leave`)).status, 200);
assert.equal((await a.get(`/api/posts/${post.id}`)).status, 403, '나간 뒤 딥링크 접근 불가');
assert.equal((await a.get('/api/map')).data.total, 0, '나간 뒤 지도 집계에서 제거');

// 1회용 초대 링크
const link = (await c.post('/api/invites')).data.code;
const d = await signup('dave');
assert.equal((await d.post(`/api/invites/${link}/accept`)).status, 200);
assert.equal((await (await signup('erin')).post(`/api/invites/${link}/accept`)).status, 410);

// 탈퇴
assert.equal((await d.del('/api/me', { password: 'password123' })).status, 200);
assert.equal((await d.get('/api/me')).status, 401);


// 차별화 PRD: 대표 사진 마커, 활동 기록, 개인 저장, 개인정보 요청
{
  const x = await signup('xena'), y = await signup('yuri'), z = await signup('zed');
  await friend(x, y, 'yuri'); await friend(x, z, 'zed');
  const p = (await x.post('/api/posts', { title: '마커', occurred_on: '2025-05-01', member_ids: [y.id], place: { city: '부산', country: '대한민국', precision: 'city' } })).data;
  await y.post(`/api/posts/${p.id}/respond`, { accept: true });
  const ph = (await y.put(`/api/posts/${p.id}/media`, jpeg)).data;
  const mk = (await x.get('/api/map')).data.countries[0].cities[0].items[0];
  assert.equal(mk.cover, ph.id, '지도 마커는 대표 사진과 함께한 사람 수를 가진다'); assert.equal(mk.count, 2);
  assert.equal((await z.get('/api/map')).data.total, 0, '권한 없는 사람의 마커·집계 없음');
  assert.equal((await z.get(`/api/posts/${p.id}/log`)).status, 403);
  assert.ok((await x.get(`/api/posts/${p.id}/log`)).data.log.length >= 1, '활동 기록');
  assert.equal((await z.post('/api/saves', { post_id: p.id })).status, 403, '권한 없으면 저장 불가');
  await y.post('/api/saves', { post_id: p.id });
  assert.equal((await y.get('/api/saves')).data.posts.length, 1);
  await y.post(`/api/posts/${p.id}/leave`);
  assert.equal((await y.get('/api/saves')).data.posts.length, 0, '나간 뒤 저장 목록에서도 제거');
  assert.equal((await x.post('/api/privacy', { kind: 'delete', detail: '요청' })).status, 200);
  assert.equal((await x.get('/api/privacy')).data.requests[0].status, 'RECEIVED');
  const mt2 = (await x.post('/api/meetups', { title: 't', starts_at: new Date().toISOString(), user_ids: [y.id] })).data;
  const bad = await x.post(`/api/meetups/${mt2.id}/settlements`, { title: 's', total: 1000, payer_id: x.id, member_ids: [x.id, y.id], method: 'custom', amounts: { [x.id]: 400, [y.id]: 500 } });
  assert.match(bad.data.error, /100원 적어요/, '합계 차이를 숫자로 안내');
}


// 회원가입 규칙: 사용자명 상태, 예약어, 약한 비밀번호
{
  const g = client();
  assert.equal((await g.get('/api/username-check?u=zzz_new1')).data.state, 'available');
  assert.equal((await g.get('/api/username-check?u=alice')).data.state, 'unavailable');
  assert.equal((await g.get('/api/username-check?u=admin')).data.state, 'unavailable', '예약어');
  assert.equal((await g.get('/api/username-check?u=A!')).data.state, 'invalid');
  assert.equal((await g.get('/api/username-check?u=deleted_9')).data.state, 'unavailable', '탈퇴 계정 접두어');
  assert.match((await g.post('/api/signup', { username: 'weakpw1', name: 'wendy', password: 'abcdefghij' })).data.error, /숫자/, '숫자 없는 비밀번호 거절');
  assert.match((await g.post('/api/signup', { username: 'weakpw2', name: 'wendy', password: '1234567890' })).data.error, /영문/, '영문 없는 비밀번호 거절');
  assert.equal((await g.post('/api/signup', { username: 'admin', name: 'wendy', password: 'abc12345' })).status, 409);
}


// 닉네임 v1.1: 글자·길이·정규화·제한 표현, 중복 허용, 추천 사전
{
  const { validateNickname, graphemes, ADJECTIVES, NOUNS, suggest } = await import('./public/nickname.js');
  const g = client(); let n = 0;
  const su = async nickname => g.post('/api/signup', { username: 'nick' + (++n) + 'x', nickname, password: 'abc12345' });
  const code = async nickname => (await su(nickname)).data.error_code;
  assert.equal(await code('가'), 'NICKNAME_TOO_SHORT');
  assert.equal(await code('가'.repeat(17)), 'NICKNAME_TOO_LONG', '17자 거절');
  assert.equal((await su('가'.repeat(16))).status, 200, '한글 16자 허용');
  assert.equal(graphemes('👨‍👩‍👧'), 1, '조합 이모지는 한 글자로 센다');
  assert.equal(await code('좋아요😀'), 'NICKNAME_INVALID_CHAR', '이모지 불허');
  assert.equal(await code('가나\u200b다'), 'NICKNAME_INVALID_CHAR', '제로폭 문자');
  assert.equal(await code('가나\u202e다'), 'NICKNAME_INVALID_CHAR', '방향 제어 문자');
  assert.equal(await code('가나\n다'), 'NICKNAME_INVALID_CHAR', '줄바꿈');
  assert.equal(await code('<b>안녕</b>'), 'NICKNAME_INVALID_CHAR', 'HTML 태그 문자');
  assert.equal(await code('우리사이 운영자'), 'NICKNAME_RESTRICTED', '운영자 사칭');
  assert.equal(await code('Admin'), 'NICKNAME_RESTRICTED');
  assert.equal(await code('010 1234 5678'), 'NICKNAME_RESTRICTED', '전화번호 형태');
  assert.equal(validateNickname('  가   나  ').value, '가 나', '공백 정규화');
  assert.equal(validateNickname('\u1112\u1161\u11ab글').value, '한글', 'NFC 정규화');
  assert.equal(validateNickname('별빛_하늘.~!?♡☆').ok, true, '허용 특수문자');
  // 같은 닉네임을 여러 계정이 써도 되고, user_id로 구분된다
  const a1 = (await su('소통하는간짜장')).data, a2 = (await su('소통하는간짜장')).data;
  assert.equal(a1.name, a2.name); assert.notEqual(a1.id, a2.id, '중복 닉네임은 서로 다른 user_id');
  // 닉네임 변경: 같은 user_id, 구조화된 오류
  assert.equal((await g.post('/api/logout')).status, 200);
  const h = await signup('rename_me');
  const bad = await h.patch('/api/me', { nickname: '가' });
  assert.equal(bad.data.error_code, 'NICKNAME_TOO_SHORT');
  const okr = await h.patch('/api/me', { nickname: '춤추는고구마' });
  assert.equal(okr.data.id, h.id); assert.equal(okr.data.name, '춤추는고구마'); assert.ok(okr.data.nickname_updated_at);
  // 추천 사전: 모든 조합이 규칙을 통과하고, 직전 추천은 피한다
  for (const a of ADJECTIVES) for (const nn of NOUNS) assert.equal(validateNickname(a + nn).ok, true, a + nn);
  const recent = []; for (let i = 0; i < 5; i++) recent.push(suggest(recent));
  assert.equal(new Set(recent).size, 5, '직전 5개 재노출 방지');
}

console.log('✓ 모든 권한·삭제 시나리오 통과');
server.close();
