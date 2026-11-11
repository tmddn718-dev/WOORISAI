// 원본 '인터랙티브 프로토타입' → 테스트 빌드. 화면(마크업·CSS·아이콘·이미지)은 건드리지 않고, 맨 아래 <script> 의 데이터·상태 로직만 고친다.
// 모든 치환은 '원본에 정확히 1번 있는 문자열'만 대상으로 하고, 아니면 빌드를 실패시킨다(원본이 바뀌면 바로 알 수 있다).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const SEEDS = fs.readFileSync(path.join(here, 'proto-seeds.js'), 'utf8');
const METHODS = fs.readFileSync(path.join(here, 'proto-methods.js'), 'utf8');

const R = [];
const rep = (a, b) => R.push([a, b]);

// 설정과 이벤트(바깥의 GA/가이드가 듣는다)
rep("const LI = (name, size = 20, sw = '1.75') => React.createElement('lucide-icon', { name, size: String(size), 'stroke-width': sw });",
`const LI = (name, size = 20, sw = '1.75') => React.createElement('lucide-icon', { name, size: String(size), 'stroke-width': sw });
const CFG = (() => { try { return JSON.parse(sessionStorage.getItem('wsux_cfg') || '{}'); } catch (e) { return {}; } })();
const ev = (name, params) => { // 화면 동작 기록: 가이드 진행 표시용 저장 + GA 용 이벤트(개인정보·입력한 글은 싣지 않는다)
  try { const k = 'wsux_ev:' + (CFG.flow === 'demo' ? CFG.sc : 'new'), s = JSON.parse(sessionStorage.getItem(k) || '{}'); s[name] = 1; if (name === 'create_save' && params && params.plan) s.plan_memory_saved = 1; sessionStorage.setItem(k, JSON.stringify(s)); } catch (e) {}
  try { window.dispatchEvent(new CustomEvent('ws:event', { detail: { name, params: params || {} } })); } catch (e) {}
};`);
rep("const ME = '서연';", "const ME = (CFG.flow === 'new' && CFG.name) ? CFG.name : '서연';");
rep("const key = (y, m, d) => y + '. ' + String(m).padStart(2, '0') + '. ' + String(d).padStart(2, '0');\n", "const key = (y, m, d) => y + '. ' + String(m).padStart(2, '0') + '. ' + String(d).padStart(2, '0');\n" + SEEDS);

// 초기 상태: 시나리오 데이터 + 친구 목록(state)
rep("    auth: this.props.startAs === 'guest' ? 'guest' : 'user', tab: 'home', stack: [],\n    mems: this.props.startAs === 'newUser' ? [] : SEED.map(materialize), invite: true, gIdx: {}, viewer: null,\n    plans: this.props.startAs === 'newUser' ? [] : PLANS.map(p => ({ ...p, inv: { ...p.inv } })), planAs: null,",
    "    auth: (this.props.startAs === 'guest' || CFG.flow === 'guest') ? 'guest' : 'user', tab: 'home', stack: [],\n    mems: SEEDS.mems, invite: SEEDS.invite, friends: SEEDS.friends, gIdx: {}, viewer: null,\n    plans: SEEDS.plans, planAs: null,");

// 새로고침 뒤에도 유지(탭 단위 sessionStorage = 참가자별 격리)
rep("const sm = /shot=([\\w-]+)/.exec(location.hash); if (sm) this.applyShot(sm[1]);",
    "try { const sv = CFG.flow && sessionStorage.getItem(SKEY); if (sv) this.setState(JSON.parse(sv)); } catch (e) {}\n    const sm = /shot=([\\w-]+)/.exec(location.hash); if (sm) this.applyShot(sm[1]);");
rep("this._restore = null; }\n  }\n  scrollGal(el, idx) {", "this._restore = null; }\n    this.persist();\n  }\n" + METHODS + "  scrollGal(el, idx) {");

// 친구 목록은 state 로
const PEOPLE_USES = [
  "optChips = PEOPLE.map(p => ({ label: nm(p), selected: s.fPeople.includes(p)",
  "n !== ME && PEOPLE.includes(n));",
  "footPeople: PEOPLE.map(",
  "{ label: '함께한 사람', value: PEOPLE.length }",
  "peopleRows: PEOPLE.map(",
  "cPeople: PEOPLE.map(",
  "pfPeople: PEOPLE.map("
];
for (const a of PEOPLE_USES) rep(a, a.replace('PEOPLE', 's.friends'));

// 이벤트·시뮬레이션 연결
rep("openCreate(date, pre) { this.setState(", "openCreate(date, pre) { ev('create_start', { entry: pre && pre.fromPlan ? 'plan' : date ? 'calendar' : 'tab', first: this.state.mems.length === 0 }); this.setState(");
rep("back: () => this.setState(st => ({ stack: st.stack.slice(0, -1), overlay: null, planAs: null })),", "back: () => { if (top && top.t === 'create') ev('create_abandon'); this.setState(st => ({ stack: st.stack.slice(0, -1), overlay: null, planAs: null })); },");
rep("this.setState({ tab: t, stack: [], overlay: null })", "this.goTab(t, top)");
rep("this.setState({ tab: k, stack: [], overlay: null })", "this.goTab(k, top)");
rep("toFoot: () => this.setState({ tab: 'foot' })", "toFoot: () => { ev('foot_view'); this.setState({ tab: 'foot' }); }");
rep("const pics = c.pics;\n        const isNew", "const pics = c.pics;\n        ev('create_save', { first: this.state.mems.length === 0, photos: pics.length, story: !!c.story.trim(), people: c.with.length, plan: !!c.fromPlan });\n        const isNew");
rep("const add = { ph: s.kPics.length, text: s.kText.trim() };", "const add = { ph: s.kPics.length, text: s.kText.trim() };\n      ev('contrib_add', { photos: add.ph, story: !!add.text });");
rep("invitePeople: () => { this.setState({ overlay: null }); this.say('초대 링크를 복사했어요. 수락 전에는 제목만 보여요.', 'success'); },",
    "invitePeople: () => { this.setState({ overlay: null }); this.say('초대 링크를 복사했어요. 수락 전에는 제목만 보여요.', 'success'); ev('invite_start'); if (curRaw) this.simInvite(curRaw); },");
rep("acceptInvite: () => { this.setState(", "acceptInvite: () => { ev('invite_complete', { via: 'card' }); this.setState(");
rep("openPlanForm(id, date) {\n", "openPlanForm(id, date) {\n    if (!id) ev('plan_create_start');\n");
rep("const id = 'pl' + Date.now(), inv = {}; pf.inv.forEach(n => { inv[n] = 'pending'; });", "const id = 'pl' + Date.now(), inv = {}; pf.inv.forEach(n => { inv[n] = 'pending'; });\n        ev('plan_create', { invited: pf.inv.length, past: d < TODAY }); this.simPlan(id, pf.inv.slice());");
rep("const setR = v => {\n", "const setR = v => {\n        ev('plan_rsvp', { answer: v });\n");
rep("const toMemory = () => {\n", "const toMemory = () => {\n      ev('plan_to_memory');\n");
rep("open: () => this.push({ t: 'detail', id: m.id })\n", "open: () => { ev('memory_view', { year: st.y }); this.push({ t: 'detail', id: m.id }); }\n");
rep("action: () => this.push({ t: 'detail', id: pRaw.memId })", "action: () => { ev('plan_memory_view'); this.push({ t: 'detail', id: pRaw.memId }); }");
rep("open: () => this.setState(st => ({ stack: [...st.stack, { t: 'plan', id: p.id }], overlay: null, planAs: null })) };", "open: () => { ev('plan_view'); this.setState(st => ({ stack: [...st.stack, { t: 'plan', id: p.id }], overlay: null, planAs: null })); } };");
rep("setView: v => this.setState({ mView: v })", "setView: v => { if (v === 'cal') ev('cal_view'); this.setState({ mView: v }); }");
rep("pick: () => this.push({ t: 'region', id: r }) }", "pick: () => { ev('region_view'); this.push({ t: 'region', id: r }); } }");
rep("openRegion: () => this.push({ t: 'region', id: curRaw.r })", "openRegion: () => { ev('region_view'); this.push({ t: 'region', id: curRaw.r }); }");
rep("openViewer(mid, key, idx) { this._vInit = true;", "openViewer(mid, key, idx) { ev('photo_view'); this._vInit = true;");
rep("logout: () => { this.setState({ auth: 'guest', tab: 'home', stack: [], footMode: 'mine', fPeople: [], fMonth: null, fRegion: null, fDim: 'all' }); this.say('둘러보기 모드로 바뀌었어요.'); },",
    "logout: () => { ev('logout'); location.href = '/#/login'; },");
// 기기 사진 가져오기: 새로고침 뒤에도 남도록 작게 줄여 data URL 로 저장
rep("onFiles: e => { const fs = Array.from(e.target.files || []).map(f => URL.createObjectURL(f)); e.target.value = ''; if (!fs.length) return; this.setState(",
    "onFiles: e => { const files = Array.from(e.target.files || []); e.target.value = ''; if (!files.length) return; Promise.all(files.map(shrink)).then(fs => { this.setState(");
rep("this.say(fs.length + '장을 가져왔어요. 위치 정보(EXIF)는 저장하지 않아요.'); },", "this.say(fs.length + '장을 가져왔어요. 위치 정보(EXIF)는 저장하지 않아요.'); }); },");


// 친구가 0명인 혼자 쓴 추억: 원본은 항상 1명 이상이라 ' 와 함께' 처럼 비어 보이는 문구가 나온다 → 혼자 남긴 추억으로 안내
rep("withShort: people.length === 1 ? wa(people[0]) + ' 함께' : people[0] + ' 외 ' + (people.length - 1) + '명',", "withShort: people.length === 0 ? '혼자 남긴 추억' : people.length === 1 ? wa(people[0]) + ' 함께' : people[0] + ' 외 ' + (people.length - 1) + '명',");
rep("withFull: wa(people.join(', ')) + ' 함께',", "withFull: people.length === 0 ? '혼자 남긴 추억' : wa(people.join(', ')) + ' 함께',");


// CTA 버튼은 텍스트 문구만(아이콘 없음): 버튼(Button)에 넘기는 아이콘만 비운다. 칩·배지·아이콘 버튼(뒤로·닫기·더보기)·탭바 아이콘은 그대로.
rep("create: LI('square-pen', 20), planAdd: LI('calendar-plus', 20), edit: LI('pencil', 20), cancelPlan: LI('calendar-x', 20),", "create: undefined, planAdd: undefined, edit: undefined, cancelPlan: undefined,");
rep("invite: LI('user-round-plus', 20), users: LI('users-round', 20), reset: LI('rotate-ccw', 20), login: LI('log-in', 20) },", "invite: undefined, users: undefined, reset: undefined, login: undefined },");
rep("barIcon: bar && bar.icon,", "barIcon: undefined,");

/** @returns {string} 패치한 .dc.html 전체. markup(스크립트 앞)은 원본과 바이트 단위로 같다. */
export function patchProto(src) {
  const marker = '<script type="text/x-dc" data-dc-script';
  const at = src.indexOf(marker);
  if (at < 0) throw new Error('원본에서 로직 <script> 를 찾지 못했어요.');
  const head = src.slice(0, at);
  let body = src.slice(at);
  for (const [a, b] of R) {
    const n = body.split(a).length - 1;
    if (n !== 1) throw new Error(`패치 대상이 원본에 ${n}개 있어요(1개여야 함): ${a.slice(0, 80)}`);
    body = body.replace(a, () => b);
  }
  return head + body;
}
