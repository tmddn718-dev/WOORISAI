/* GA4 연동 준비. 측정 ID(window.__UX_GA_ID)가 비어 있으면 아무것도 보내지 않고 배너도 띄우지 않는다.
 * 보내는 것은 아래 허용 목록의 이벤트 이름과 숫자·불리언·짧은 열거값뿐이다.
 * 이름·닉네임·비밀번호·제목·본문 같은 자유 입력과 사용자 식별 정보는 절대 보내지 않는다.
 */
const ALLOW = {
  ux_splash_view: [], ux_onboarding_step: ['step'], ux_screen_view: ['screen'],
  ux_signup_complete: ['marketing_consent'], ux_empty_home_view: [],
  ux_friend_search: ['found'], ux_friend_add_complete: ['friend_count'],
  ux_post_create_start: [], ux_post_create_complete: ['member_count', 'has_text', 'has_place'],
  ux_test_complete: [], ux_error_view: ['status']
};
const ID = (window.__UX_GA_ID || '').trim(), CKEY = 'wsux_consent';
let ready = false;
const consent = () => { try { return localStorage.getItem(CKEY); } catch { return null; } };
const safe = v => typeof v === 'boolean' || (typeof v === 'number' && isFinite(v)) || (typeof v === 'string' && /^[a-z0-9_]{1,24}$/.test(v));

function boot() {
  if (ready || !ID) return;
  ready = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  gtag('js', new Date());
  gtag('config', ID, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  const s = document.createElement('script'); s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID); document.head.append(s);
}

export function track(name, params = {}) {
  if (!ID || consent() !== 'granted' || !(name in ALLOW)) return;
  boot();
  const out = {}; for (const k of ALLOW[name]) if (k in params && safe(params[k])) out[k] = params[k];
  gtag('event', name, out);
}

// 동의 배너: 측정 ID가 있고 아직 선택하지 않았을 때만 보인다. 동의 전에는 GA 스크립트도 불러오지 않는다.
export function askConsent() {
  if (!ID || consent()) return;
  const el = document.createElement('div'); el.id = 'uxt-consent'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', '사용 통계 수집 동의');
  el.innerHTML = '<div class="uxt-box"><p><b>사용 통계를 수집해도 될까요?</b><br>화면 이동과 버튼 사용 여부 같은 익명 통계만 Google Analytics(미국 등 해외 서버)로 보내요. 이름, 입력한 글, 사진은 보내지 않아요. 동의하지 않아도 테스트에 참여할 수 있어요. (안내 문구는 임시예요)</p><div class="row"><button class="btn line" data-v="denied">동의하지 않아요</button><button class="btn" data-v="granted">동의해요</button></div></div>';
  el.addEventListener('click', e => { const v = e.target.closest('[data-v]')?.dataset.v; if (!v) return; try { localStorage.setItem(CKEY, v); } catch { } el.remove(); });
  document.body.append(el);
}
