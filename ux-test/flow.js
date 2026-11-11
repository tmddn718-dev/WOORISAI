/* UX 테스트 진입점. index.html 에서 app.js 보다 먼저 불러와 fetch 를 가로챈 뒤,
 * 스플래시 → 온보딩, 테스트 완료 화면, 화면 이벤트(GA4 준비)를 앱 위에 얹는다. 기존 앱 코드는 고치지 않는다. */
import { resetAll, state, markCompleted } from './mock-api.js';
import { track, askConsent } from './analytics.js';

const SEEN = 'wsux_seen';
const q = new URLSearchParams(location.search);
if (q.has('reset')) { resetAll(); try { sessionStorage.removeItem(SEEN); } catch { } history.replaceState(null, '', location.pathname + location.hash); }

const ICON = {
  images: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="M21 16l-5-5-8 8"/></svg>',
  lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  flask: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>'
};
const SLIDES = [
  { icon: 'images', title: '함께한 순간을 하나의 추억으로', body: '각자 찍은 사진과 이야기를 한곳에 모아 같이 완성해요.' },
  { icon: 'lock', title: '초대한 사람만 볼 수 있어요', body: '추억마다 볼 수 있는 사람을 직접 정해요.' },
  { icon: 'flask', title: '지금은 테스트 중이에요', body: '가입부터 친구 추가, 첫 추억 만들기까지 차례로 해 보세요.', note: '이 화면은 사용성 테스트용 가상 데이터예요. 실제 비밀번호, 개인정보, 사진은 입력하지 마세요. 입력한 내용은 이 브라우저 밖으로 나가지 않고, 창을 닫으면 사라져요. 열람 권한 같은 실제 서비스의 보안 정책은 이 테스트에 적용되지 않아요.' }
];

const root = () => { let r = document.getElementById('uxt'); if (!r) { r = document.createElement('div'); r.id = 'uxt'; document.body.append(r); } return r; };
const close = () => document.getElementById('uxt')?.remove();
const render = html => { const r = root(); r.innerHTML = `<div class="uxt-in" role="dialog" aria-modal="true">${html}</div>`; r.querySelector('button')?.focus(); return r; };

function splash() {
  track('ux_splash_view');
  const r = render(`<button type="button" class="uxt-center" data-a="skip" aria-label="시작하기" style="background:none;border:0;font:inherit;color:inherit;cursor:pointer"><img class="uxt-mark" src="/logo.svg" alt=""><span class="wordmark" style="font-size:2rem;line-height:36px;color:var(--green)">우리사이</span><span class="sub">함께한 순간을, 우리만의 이야기로</span><span class="uxt-cap">사용성 테스트용 프로토타입</span></button>`);
  const t = setTimeout(() => onboarding(0), 1800);
  r.addEventListener('click', e => { if (e.target.closest('[data-a="skip"]')) { clearTimeout(t); onboarding(0); } }, { once: true });
}
function onboarding(i) {
  track('ux_onboarding_step', { step: i + 1 });
  const s = SLIDES[i], last = i === SLIDES.length - 1;
  const r = render(`<button type="button" class="uxt-skip" data-a="done">건너뛰기</button>
    <div class="uxt-center"><span class="uxt-icon">${ICON[s.icon]}</span><h1>${s.title}</h1><p class="sub">${s.body}</p>${s.note ? `<p class="uxt-note">${s.note}</p>` : ''}</div>
    <div class="uxt-dots" role="group" aria-label="소개 ${i + 1} / ${SLIDES.length}">${SLIDES.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="uxt-actions"><button type="button" class="btn block" data-a="${last ? 'done' : 'next'}">${last ? '시작하기' : '다음'}</button></div>`);
  r.addEventListener('click', e => { const a = e.target.closest('[data-a]')?.dataset.a; if (a === 'next') onboarding(i + 1); else if (a === 'done') finishIntro(); }, { once: true });
}
function finishIntro() { try { sessionStorage.setItem(SEEN, '1'); } catch { } close(); askConsent(); }

function complete() {
  if (document.getElementById('uxt')) return;
  markCompleted(); track('ux_test_complete');
  const r = render(`<div class="uxt-center"><span class="uxt-icon">${ICON.check}</span><h1>테스트가 끝났어요</h1><p class="sub">참여해 주셔서 고마워요. 가입, 친구 추가, 첫 추억 만들기까지 마쳤어요.</p><p class="uxt-note">입력한 내용은 이 브라우저 안의 가상 데이터예요. 아래에서 지우면 완전히 사라져요.</p></div>
    <div class="uxt-actions"><button type="button" class="btn block" data-a="keep">내가 만든 추억 둘러보기</button><button type="button" class="btn line block" data-a="again">처음부터 다시 해 보기</button><button type="button" class="btn line block" data-a="wipe">데이터 지우고 끝내기</button></div>`);
  r.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    if (a === 'keep') close();
    else { resetAll(); try { sessionStorage.removeItem(SEEN); } catch { } location.hash = '#/'; location.reload(); }
  });
}

// 화면 이벤트: 화면 이름만 보낸다 (경로의 id, 입력값은 보내지 않는다)
const NAMES = [[/^\/$/, 'home'], [/^\/people/, 'people'], [/^\/new-post/, 'new_post'], [/^\/post\//, 'post'], [/^\/memories/, 'memories'], [/^\/me/, 'me'], [/^\/meetups/, 'meetups']];
let lastScreen = '';
function onRoute() {
  const path = (location.hash.slice(1) || '/').split('?')[0];
  const hit = NAMES.find(n => n[0].test(path)), screen = state().loggedIn ? (hit ? hit[1] : 'other') : 'auth';
  if (screen === lastScreen) return; lastScreen = screen;
  track('ux_screen_view', { screen });
  if (screen === 'new_post') track('ux_post_create_start');
}
window.addEventListener('hashchange', onRoute);
window.addEventListener('ux:event', e => {
  const { name, params } = e.detail; track('ux_' + name, params);
  if (name === 'post_create_complete') setTimeout(complete, 900); // 앱이 새 추억 화면으로 이동한 뒤에 띄운다
});

function start() {
  onRoute();
  let seen = false; try { seen = !!sessionStorage.getItem(SEEN); } catch { }
  if (!seen && !state().loggedIn) splash(); else askConsent();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
