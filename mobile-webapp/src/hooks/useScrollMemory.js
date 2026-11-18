import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const KEY = 'scroll:';
const read = k => { try { return Number(sessionStorage.getItem(KEY + k)) || 0; } catch { return 0; } };
const write = (k, v) => { try { sessionStorage.setItem(KEY + k, String(v)); } catch { /* 저장 불가여도 동작에는 문제 없음 */ } };

/** 화면별 스크롤 위치를 기억한다. 뒤로 가기(POP)로 돌아오면 이전 위치를 복원하고, 새로 이동(PUSH)하면 맨 위에서 시작한다. */
export function useScrollMemory() {
  const ref = useRef(null);
  const { pathname } = useLocation();
  const type = useNavigationType();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    el.scrollTop = type === 'POP' ? read(pathname) : 0;
    let raf = 0;
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; write(pathname, el.scrollTop); }); };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [pathname, type]);

  return ref;
}
