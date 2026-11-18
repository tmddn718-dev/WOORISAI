import { Link } from 'react-router-dom';
import { ITEMS } from '../data.js';
import { PlusIcon, ChevronIcon } from '../components/Icons.jsx';

export default function Home() {
  return (
    <div className="pb-4">
      <section className="px-4 pt-4">
        <p className="text-sm text-gray-500">안녕하세요 👋</p>
        <h2 className="mt-1 text-2xl font-bold leading-tight">링크만 열면<br />바로 앱처럼 써요</h2>
      </section>
      <ul className="mt-4 space-y-3 px-4">
        {ITEMS.map(it => (
          <li key={it.id}>
            <Link to={`/item/${it.id}`} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition active:scale-[.98] active:bg-gray-50">
              <span className="h-14 w-14 shrink-0 rounded-xl" style={{ background: it.color }} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[15px] font-semibold">{it.title}</span>
                <span className="mt-0.5 block text-xs text-gray-500">{it.tag}</span>
              </span>
              <ChevronIcon className="text-gray-300" />
            </Link>
          </li>
        ))}
      </ul>
      {/* 본문 끝에 붙는 작성 버튼: 스크롤해도 오른쪽 아래에 떠 있다 */}
      <div className="pointer-events-none sticky bottom-4 mt-4 flex justify-end px-4">
        <Link to="/compose" aria-label="새 글 작성" className="pointer-events-auto grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-lg transition active:scale-95">
          <PlusIcon />
        </Link>
      </div>
    </div>
  );
}
