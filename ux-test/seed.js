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
