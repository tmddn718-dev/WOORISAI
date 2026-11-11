// UX 테스트 전용 가상 데이터. 실제 서버 데이터가 아니며, 실제 권한 정책을 구현한 것도 아니다.
export const FRIEND_POOL = [
  { id: 101, name: '민수', username: 'minsu' },
  { id: 102, name: '지아', username: 'jia' },
  { id: 103, name: '하은', username: 'haeun' }
];
// 가입에 쓸 수 없는 이름(서버의 예약어·사용 중 이름을 흉내낸 것)
export const TAKEN = ['admin', 'woooyaa', 'woorisai', 'test', ...FRIEND_POOL.map(f => f.username)];
export const ME_ID = 1;
// 시드 사진 (저작권 문제가 없도록 직접 만든 단색 그라데이션 SVG)
export const SEED_PHOTOS = ['seed-1.svg', 'seed-2.svg', 'seed-3.svg'];

// 체험용 "기존 사용자" 샘플 계정(username: demo). 브라우저 안의 가상 데이터이며 실제 사용자 데이터와 무관하다.
export const DEMO_USER = { id: ME_ID, name: '서연', username: 'demo', mem_enabled: true };
export const DEMO_FRIENDS = [101, 102, 103];
export const DEMO_POSTS = [
  { id: 301, title: '성수동 브런치', occurred_on: '2026-10-25', place: { name: '', area: '성수동', city: '서울', country: '대한민국', precision: 'area' }, members: [101, 102], accepted: [101, 102], media: [11, 12, 13],
    notes: [{ id: 401, kind: 'story', by: null, text: '늦잠 자고 일어나서 느지막이 만난 날. 커피가 제일 맛있었다.' }, { id: 402, kind: 'story', by: '민수', text: '다음엔 저 골목 안쪽 빵집도 가 보자.' }] },
  { id: 302, title: '한강 노을 산책', occurred_on: '2026-10-12', place: { name: '', area: '', city: '서울', country: '대한민국', precision: 'city' }, members: [102, 103], accepted: [102, 103], media: [14, 15],
    notes: [{ id: 403, kind: 'story', by: '지아', text: '해 지는 시간에 맞춰 도착하느라 뛰었다.' }] },
  { id: 303, title: '제주 2박 3일', occurred_on: '2026-09-20', place: { name: '', area: '', city: '제주', country: '대한민국', precision: 'city' }, members: [101, 102, 103], accepted: [101, 103], media: [16, 17, 18],
    notes: [{ id: 404, kind: 'story', by: null, text: '비가 그친 뒤의 오름이 제일 기억에 남아요.' }] }
];
