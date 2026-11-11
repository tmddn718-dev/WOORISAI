/* GA4 연동. 측정 ID(window.__UX_GA_ID, build.mjs 가 주입)가 비어 있으면 아무것도 하지 않는다.
 * - 동의 전에는 GA 스크립트를 불러오지 않고 이벤트는 대기열에만 둔다. 거부하면 대기열을 버린다.
 * - 허용 목록의 이벤트 이름과 숫자·불리언·짧은 열거값만 보낸다. 닉네임·이름·비밀번호·글·사진·제목 등 자유 입력은 보내지 않는다.
 * - 단계 이벤트는 세션당 한 번만 보낸다(sessionStorage). 데이터 초기화 때 함께 지워진다.
 * - localhost 에서는 GA 로 보내지 않고 window.__uxGaLog 배열에만 기록한다(로컬 검증용).
 */
const ID = (window.__UX_GA_ID || '').trim();
const PROD_HOST = 'woorisai-ux-test.vercel.app';
const ALLOW = {
  page_view: ['page_path', 'page_location', 'page_title'],
  onboarding_complete: ['method'],
  sign_up_start: [], sign_up: ['method'],
  friend_add_start: [], friend_add_complete: ['friend_count'],
  post_create_start: [], post_create_complete: ['member_count', 'has_text', 'has_place'],
  test_complete: []
};
const CKEY = 'wsux_consent', SENT = 'wsux_sent', RUN = 'wsux_run', DEV = 'wsux_dev';
const ls = { get: k => { try { return localStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch { } }, del: k => { try { localStorage.removeItem(k); } catch { } } };
const ss = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { } } };

// ?dev=1 → 진행자(내부 트래픽)로 표시, ?dev=0 → 해제
const dq = new URLSearchParams(location.search).get('dev');
if (dq === '1') ls.set(DEV, '1'); else if (dq === '0') ls.del(DEV);
const isDev = () => ls.get(DEV) === '1';

const host = location.hostname;
const environment = /^(localhost|127\.|\[::1\]|0\.0\.0\.0)/.test(host) ? 'local' : host === PROD_HOST ? 'production' : host.endsWith('.vercel.app') ? 'preview' : 'other';
const runId = () => { let r = ss.get(RUN); if (!r) { r = Math.random().toString(36).slice(2, 10); ss.set(RUN, r); } return r; }; // 개인정보와 무관한 임의 값
const safe = v => typeof v === 'boolean' || (typeof v === 'number' && isFinite(v)) || (typeof v === 'string' && v.length <= 100 && /^[A-Za-z0-9_\-\/:.]+$/.test(v));

const consent = () => ls.get(CKEY);
const queue = [];
let booted = false;
window.__uxGaLog = window.__uxGaLog || [];

function boot() {
  if (booted) return; booted = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  gtag('js', new Date());
  gtag('consent', 'update', { analytics_storage: 'granted' }); // 동의한 뒤에만 이 코드에 도달한다
  gtag('config', ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false, ...(isDev() ? { debug_mode: true } : {}) });
  const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID); document.head.append(s);
}

function send(name, params) {
  const out = { environment, test_run: runId(), ...(isDev() ? { traffic_type: 'internal' } : {}) };
  for (const k of ALLOW[name]) if (k in params && safe(params[k])) out[k] = params[k];
  if (environment === 'local') { window.__uxGaLog.push({ name, params: out }); return; }
  boot(); gtag('event', name, out);
}

export function track(name, params = {}) {
  if (!ID || !(name in ALLOW)) return;
  if (name !== 'page_view') { // 단계 이벤트는 세션당 한 번
    let sent = []; try { sent = JSON.parse(ss.get(SENT) || '[]'); } catch { }
    if (sent.includes(name)) return; sent.push(name); ss.set(SENT, JSON.stringify(sent));
  }
  const c = consent();
  if (c === 'granted') send(name, params);
  else if (c !== 'denied' && queue.length < 30) queue.push([name, params]); // 선택 전에는 보내지 않고 기다린다
}

// 동의 배너: 측정 ID가 있고 아직 선택하지 않았을 때만 보인다. 동의 전에는 GA 스크립트도 불러오지 않는다.
export function askConsent() {
  if (!ID || consent() || document.getElementById('uxt-consent')) return;
  const el = document.createElement('div'); el.id = 'uxt-consent'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', '사용 통계 수집 동의');
  el.innerHTML = '<div class="uxt-box"><p><b>사용 통계를 수집해도 될까요?</b><br>화면 이동과 버튼 사용 여부 같은 익명 통계만 Google Analytics(미국 등 해외 서버)로 보내요. 이름, 입력한 글, 사진은 보내지 않아요. 동의하지 않아도 테스트에 참여할 수 있어요. (안내 문구는 임시예요)</p><div class="row"><button class="btn line" data-v="denied">동의하지 않아요</button><button class="btn" data-v="granted">동의해요</button></div></div>';
  el.addEventListener('click', e => {
    const v = e.target.closest('[data-v]')?.dataset.v; if (!v) return;
    ls.set(CKEY, v); el.remove();
    const q = queue.splice(0); if (v === 'granted') q.forEach(([n, p]) => send(n, p));
  });
  document.body.append(el);
}
