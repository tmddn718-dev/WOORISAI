/* 테스트 빌드 화면(app.html)의 GA4 연결. 화면 코드가 내보내는 'ws:event' 를 허용 목록 이벤트로 전달한다(입력한 글·이름·사진은 실리지 않는다). */
import { track, askConsent } from '/ux-test/analytics.js';
askConsent();
const cfg = (() => { try { return JSON.parse(sessionStorage.getItem('wsux_cfg') || '{}'); } catch { return {}; } })();
track('page_view', { page_path: '/app/' + (cfg.flow === 'demo' ? 'demo' + (cfg.sc || '') : cfg.flow || 'orig'), page_location: location.origin + '/app', page_title: 'app' });

let creating = false; // 추억 만들기 화면이 열려 있는 동안 true → 저장 없이 떠나면 이탈로 센다
window.addEventListener('ws:event', e => {
  const { name, params } = e.detail || {};
  if (name === 'create_start') creating = true;
  if (name === 'create_save' || name === 'create_abandon') creating = false;
  track(name, params || {});
});
const leave = () => { if (creating) { creating = false; track('create_abandon'); } };
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') leave(); });
window.addEventListener('pagehide', leave);
