import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

function Switch({ checked, onChange, label }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-gray-300'}`}>
      <span className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : ''}`} />
    </button>
  );
}

/** 환경 정보: 브라우저 종류와 안전 영역·뷰포트 값을 보여준다(호환성 확인용). */
function useEnv() {
  const probe = useRef(null);
  const [env, setEnv] = useState(null);
  useEffect(() => {
    const read = () => {
      const cs = getComputedStyle(probe.current);
      const ua = navigator.userAgent;
      setEnv({
        browser: /KAKAOTALK/i.test(ua) ? '카카오톡 인앱 브라우저' : /iPhone|iPad|iPod/.test(ua) ? 'iOS Safari/WebView' : /Android/.test(ua) ? 'Android Chrome/WebView' : '데스크톱 브라우저',
        safe: `상 ${cs.paddingTop} · 하 ${cs.paddingBottom}`,
        viewport: `${window.innerWidth}×${window.innerHeight} (visual ${Math.round(window.visualViewport?.height ?? window.innerHeight)})`,
        kb: document.documentElement.dataset.kb,
      });
    };
    read();
    window.addEventListener('resize', read);
    window.visualViewport?.addEventListener('resize', read);
    return () => { window.removeEventListener('resize', read); window.visualViewport?.removeEventListener('resize', read); };
  }, []);
  return [probe, env];
}

export default function Me() {
  const [push, setPush] = useState(true);
  const [dark, setDark] = useState(false);
  const [probe, env] = useEnv();
  return (
    <div className="space-y-6 px-4 py-4">
      <div className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-soft text-2xl font-bold text-brand">나</span>
        <div><p className="text-lg font-semibold">게스트</p><p className="text-sm text-gray-500">로그인 없이 사용 중이에요</p></div>
      </div>
      <section className="overflow-hidden rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-4 py-3.5"><span>푸시 알림</span><Switch checked={push} onChange={setPush} label="푸시 알림" /></div>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3.5"><span>다크 모드(데모)</span><Switch checked={dark} onChange={setDark} label="다크 모드" /></div>
        <Link to="/compose" className="flex items-center justify-between border-t border-gray-100 px-4 py-3.5 active:bg-gray-50"><span>글쓰기 화면(키보드 테스트)</span><span className="text-gray-300">›</span></Link>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold text-gray-500">환경 정보</h2>
        <dl className="space-y-1.5 rounded-2xl bg-gray-50 p-4 text-sm">
          {env && [['브라우저', env.browser], ['안전 영역', env.safe], ['뷰포트', env.viewport], ['키보드', env.kb]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4"><dt className="text-gray-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>
          ))}
        </dl>
        {/* 안전 영역 값을 읽기 위한 보이지 않는 요소 */}
        <div ref={probe} aria-hidden="true" className="pt-safe pb-safe h-0 overflow-hidden" />
      </section>
    </div>
  );
}
