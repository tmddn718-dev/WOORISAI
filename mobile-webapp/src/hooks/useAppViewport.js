import { useEffect } from 'react';

const KEYBOARD_MIN = 120; // 이만큼 이상 줄면 키보드가 열린 것으로 본다(px)
const isEditable = el => !!el && (/^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) || el.isContentEditable);

/**
 * 앱 높이를 실제로 보이는 영역(visualViewport)에 맞춘다.
 * - iOS Safari: 키보드가 떠도 100dvh 는 그대로라 입력창이 가려진다 → visualViewport 높이·offsetTop 으로 앱 영역을 직접 맞춘다.
 * - Android Chrome: interactive-widget=resizes-content 로 레이아웃이 줄고, visualViewport 도 같은 값이라 결과가 같다.
 * - 카카오톡 인앱: 구형 WebView 에서 dvh 가 어긋날 수 있어 JS 값이 우선한다. visualViewport 가 없으면 innerHeight 를 쓴다.
 * CSS 변수 --app-height / --app-top 과 <html data-kb="open|closed"> 를 갱신한다.
 */
export function useAppViewport() {
  useEffect(() => {
    const root = document.documentElement;
    const vv = window.visualViewport;
    let base = vv ? vv.height : window.innerHeight; // 키보드 없는 기준 높이
    let raf = 0;

    const apply = () => {
      raf = 0;
      const h = vv ? vv.height : window.innerHeight;
      const top = vv ? vv.offsetTop : 0;
      const typing = isEditable(document.activeElement);
      if (!typing) base = Math.max(h, 1); // 입력 중이 아닐 때의 높이를 기준으로 갱신(회전·주소창 변화 반영)
      const keyboard = typing && base - h > KEYBOARD_MIN;
      root.style.setProperty('--app-height', `${Math.round(h)}px`);
      root.style.setProperty('--app-top', `${Math.round(top)}px`);
      root.dataset.kb = keyboard ? 'open' : 'closed';
    };
    const schedule = () => { if (!raf) raf = requestAnimationFrame(apply); };

    // iOS 는 입력 포커스 때 문서를 위로 밀어 올린다 → 되돌린다.
    const resetScroll = () => { if (window.scrollY || document.documentElement.scrollTop) window.scrollTo(0, 0); };
    const onFocusIn = e => {
      schedule();
      if (!isEditable(e.target)) return;
      // 키보드 애니메이션이 끝난 뒤 입력창이 보이도록 본문 안에서 스크롤한다.
      setTimeout(() => { schedule(); e.target.scrollIntoView?.({ block: 'center', behavior: 'smooth' }); }, 320);
    };
    const onFocusOut = () => setTimeout(schedule, 80);

    apply();
    vv?.addEventListener('resize', schedule);
    vv?.addEventListener('scroll', schedule);
    window.addEventListener('resize', schedule);
    window.addEventListener('orientationchange', schedule);
    window.addEventListener('scroll', resetScroll, { passive: true });
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      vv?.removeEventListener('resize', schedule);
      vv?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.removeEventListener('orientationchange', schedule);
      window.removeEventListener('scroll', resetScroll);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
}
