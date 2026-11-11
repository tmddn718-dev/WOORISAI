/* UX 테스트 진입점. index.html 에서 app.js 보다 먼저 불러와 fetch 를 가로챈 뒤,
 * 스플래시 → 온보딩, 테스트 완료 화면, 화면 이벤트(GA4 준비)를 앱 위에 얹는다. 기존 앱 코드는 고치지 않는다. */
import { resetAll, state, markCompleted, startDemo } from './mock-api.js';
import { track, askConsent } from './analytics.js';

const SEEN = 'wsux_seen';
const q = new URLSearchParams(location.search);
const MODE = q.get('mode'); // 진행자용: ?mode=demo 는 샘플 계정으로 바로 시작, ?mode=new 는 처음 사용자 흐름(체험 선택 화면 생략)
if (q.has('reset')) { resetAll(); try { sessionStorage.removeItem(SEEN); } catch { } history.replaceState(null, '', location.pathname + location.hash); }
if (MODE === 'demo') { startDemo(); try { sessionStorage.setItem(SEEN, '1'); } catch { } }

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
  const r = render(`<button type="button" class="uxt-center" data-a="skip" aria-label="시작하기" style="background:none;border:0;font:inherit;color:inherit;cursor:pointer"><img class="uxt-mark" src="/logo.svg" alt=""><span class="wordmark" style="font-size:2rem;line-height:36px;color:var(--green)">우리사이</span><span class="sub">함께한 순간을, 우리만의 이야기로</span><span class="uxt-cap">사용성 테스트용 프로토타입</span></button>`);
  const t = setTimeout(() => onboarding(0), 1800);
  r.addEventListener('click', e => { if (e.target.closest('[data-a="skip"]')) { clearTimeout(t); onboarding(0); } }, { once: true });
}
function onboarding(i) {
  const s = SLIDES[i], last = i === SLIDES.length - 1;
  const r = render(`<button type="button" class="uxt-skip" data-a="done">건너뛰기</button>
    <div class="uxt-center"><span class="uxt-icon">${ICON[s.icon]}</span><h1>${s.title}</h1><p class="sub">${s.body}</p>${s.note ? `<p class="uxt-note">${s.note}</p>` : ''}</div>
    <div class="uxt-dots" role="group" aria-label="소개 ${i + 1} / ${SLIDES.length}">${SLIDES.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
    <div class="uxt-actions"><button type="button" class="btn block" data-a="${last ? 'done' : 'next'}">${last ? '시작하기' : '다음'}</button></div>`);
  r.addEventListener('click', e => { const a = e.target.closest('[data-a]')?.dataset.a; if (a === 'next') onboarding(i + 1); else if (a === 'done') finishIntro(e.target.closest('.uxt-skip') ? 'skip' : 'finish'); }, { once: true });
}
function finishIntro(method) {
  try { sessionStorage.setItem(SEEN, '1'); } catch { }
  track('onboarding_complete', { method });
  if (MODE === 'new' || state().loggedIn) { close(); return; }
  choice();
}
// 체험 방식 선택: 처음 사용자(가입부터) 또는 기존 사용자(샘플 데이터)
function choice() {
  const r = render(`<div class="uxt-center"><h1>어떻게 체험해 볼까요?</h1><p class="sub">둘 중 하나를 골라 주세요. 나중에 다시 선택할 수도 있어요.</p></div>
    <div class="uxt-actions"><button type="button" class="btn block" data-a="new">처음 사용자로 시작하기</button><p class="uxt-cap" style="text-align:center;margin:-2px 0 8px">가입부터 친구 추가, 첫 추억 만들기까지 직접 해 봐요.</p>
    <button type="button" class="btn line block" data-a="demo">기존 사용자로 둘러보기</button><p class="uxt-cap" style="text-align:center;margin-top:-2px">샘플 추억이 있는 계정으로 바로 들어가요. 로그아웃해도 이름 demo 로 다시 로그인할 수 있어요.</p></div>`);
  r.addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
    track('experience_start', { mode: a === 'demo' ? 'demo' : 'new' });
    if (a === 'demo') { startDemo(); location.hash = '#/'; window.dispatchEvent(new HashChangeEvent('hashchange')); }
    close();
  }, { once: true });
}

function complete() {
  if (document.getElementById('uxt') || state().mode === 'demo') return; // 샘플 계정 체험에는 완료 화면이 없다
  markCompleted(); track('test_complete');
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
  track('page_view', { page_path: '/' + screen, page_location: location.origin + '/' + screen, page_title: screen });
}
window.addEventListener('hashchange', onRoute);
window.addEventListener('ux:event', e => {
  const { name, params } = e.detail; track(name, params);
  if (name === 'post_create_complete') setTimeout(complete, 900); // 앱이 새 추억 화면으로 이동한 뒤에 띄운다
});

// 사진 로딩에 실패하면 깨진 이미지 아이콘 대신 카드의 배경색이 보이게 숨긴다
document.addEventListener('error', e => { const t = e.target; if (t && t.tagName === 'IMG' && /^(\/media\/|\/ux-test\/images\/|blob:)/.test(t.getAttribute('src') || '')) t.style.visibility = 'hidden'; }, true);

// 시작 행동 감지: 화면이 실제로 나타났을 때(가입 폼, 새 추억 폼)와 친구 이름 입력을 시작할 때
function watchStarts() {
  new MutationObserver(() => {
    if (document.querySelector('form[data-form="signup"]')) track('sign_up_start');
    if (document.querySelector('form[data-form="newpost"]')) track('post_create_start');
  }).observe(document.body, { childList: true, subtree: true });
  const friendStart = e => { if (e.target.matches?.('form[data-form="request"] input[name="username"]')) track('friend_add_start'); };
  document.addEventListener('focusin', friendStart); document.addEventListener('input', friendStart);
}
function start() {
  askConsent(); watchStarts(); onRoute();
  let seen = false; try { seen = !!sessionStorage.getItem(SEEN); } catch { }
  if (!seen && !state().loggedIn) splash();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
