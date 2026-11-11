// ── 테스트 빌드 전용 코드(원본에는 없음). build.mjs 가 원본 <script> 안, class Component 바로 앞에 끼워 넣는다. ──
// 시나리오별 시작 데이터. 사진·친구·추억·약속은 모두 원본(SEED/PLANS/INVITED/POOL)의 것을 그대로 쓴다.
const SC_FRIEND_NOTE = {
  민지: '초대 고마워. 협재 노을 사진도 같이 올려 둘게.', 지호: '나도 이제야 합류! 그날 아침 바다가 제일 좋았어.', 하은: '사진 정리하다가 생각나서 몇 장 더했어.',
  도윤: '늦게 들어왔지만 같이 남기고 싶어서 올려.', 유나: '이런 건 같이 모아 두는 게 좋네.', 준서: '뒤늦게 합류했어요. 몇 장 보탭니다.'
};
const makeSeeds = cfg => {
  const flow = cfg.flow, sc = +cfg.sc || 0;
  const cl = p => ({ ...p, inv: { ...p.inv } });
  const ids = list => SEED.filter(m => list.includes(m.id)).map(materialize);
  const link = (list, id, spaceId) => list.map(m => m.id === id ? { ...m, space: spaceId } : m);
  if (flow === 'new') return { mems: [], plans: [], invite: false, friends: [], spaces: [] };
  if (flow === 'demo' && sc === 1) return { mems: link(ids(['han', 'jeju']), 'jeju', 'sp1'), plans: [], invite: true, friends: ['민지', '지호', '하은'], spaces: [{ id: 'sp1', name: '제주 친구들', members: ['민지', '지호', '하은'] }] };
  if (flow === 'demo' && sc === 2) return { mems: link(ids(['han', 'cafe', 'first']), 'han', 'sp1'), plans: PLANS.filter(p => ['pl-move', 'pl-kimjang', 'pl-party', 'pl-board', 'pl-han'].includes(p.id)).map(cl), invite: false, friends: [...PEOPLE], spaces: [{ id: 'sp1', name: '망원 모임', members: ['민지', '지호', '하은'] }] };
  if (flow === 'demo' && sc === 3) return { mems: link(link(SEED.map(materialize), 'jeju', 'sp1'), 'cafe', 'sp2'), plans: PLANS.map(cl), invite: false, friends: [...PEOPLE], spaces: [{ id: 'sp1', name: '제주 친구들', members: ['민지', '지호', '하은'] }, { id: 'sp2', name: '성수 사람들', members: ['유나', '하은'] }] };
  return { mems: SEED.map(materialize), plans: PLANS.map(cl), invite: true, friends: [...PEOPLE], spaces: [] }; // 설정이 없으면 원본 기본 상태
};
const SEEDS = makeSeeds(CFG);
const SKEY = 'wsux_state:' + [CFG.flow || 'orig', CFG.sc || 0, CFG.name || ''].join(':');
const shrink = f => new Promise(res => { // 기기 사진: EXIF(위치 포함)가 사라지도록 다시 그리고, 새로고침 뒤에도 남도록 작게 저장
  const r = new FileReader();
  r.onload = () => { const im = new Image(); im.onload = () => { const k = Math.min(1, 720 / Math.max(im.width, im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); res(c.toDataURL('image/jpeg', .72)); }; im.onerror = () => res(URL.createObjectURL(f)); im.src = r.result; };
  r.onerror = () => res(URL.createObjectURL(f)); r.readAsDataURL(f);
});
