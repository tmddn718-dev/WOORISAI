import { useNavigate } from 'react-router-dom';
import { BackIcon } from './Icons.jsx';

/** 상단 바. 노치/상태바 영역(safe-area-inset-top)만큼 위를 비운다. */
export default function Header({ title, back = false, right = null }) {
  const navigate = useNavigate();
  // 앱 안에서 들어온 이력이 없으면(링크로 바로 진입) 뒤로 가기 대신 홈으로 보낸다.
  const goBack = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate('/', { replace: true }));
  return (
    <header className="chrome shrink-0 border-b border-gray-100 bg-white/95 pt-safe px-safe">
      <div className="flex h-12 items-center gap-1 px-2">
        {back ? (
          <button type="button" onClick={goBack} aria-label="뒤로 가기" className="grid h-11 w-11 place-items-center rounded-full text-gray-900 active:bg-gray-100">
            <BackIcon />
          </button>
        ) : <span className="w-2" />}
        <h1 className="flex-1 truncate text-[17px] font-semibold">{title}</h1>
        {right}
      </div>
    </header>
  );
}
