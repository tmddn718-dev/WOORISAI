import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ITEMS } from '../data.js';

const TAGS = ['전체', '일상', '취미', '학습'];

export default function Explore() {
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('전체');
  const list = useMemo(() => ITEMS.filter(i => (tag === '전체' || i.tag === tag) && i.title.includes(q.trim())), [q, tag]);
  return (
    <div className="pb-4">
      {/* 검색창은 본문 위쪽에 고정(sticky). 키보드가 떠도 입력창이 가려지지 않는지 확인하는 대표 화면 */}
      <div className="sticky top-0 z-10 bg-white px-4 pb-2 pt-3">
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="검색어를 입력하세요"
          enterKeyHint="search"
          autoComplete="off"
          className="h-11 w-full rounded-xl bg-gray-100 px-4 outline-none focus:ring-2 focus:ring-brand/40"
        />
        <div className="chrome mt-2 flex gap-2 overflow-x-auto pb-1">
          {TAGS.map(t => (
            <button key={t} type="button" onClick={() => setTag(t)} aria-pressed={tag === t}
              className={`h-9 shrink-0 rounded-full px-4 text-sm font-medium transition active:scale-95 ${tag === t ? 'bg-brand text-white' : 'bg-gray-100 text-gray-600'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
      {list.length ? (
        <ul className="mt-2 grid grid-cols-2 gap-3 px-4">
          {list.map(it => (
            <li key={it.id}>
              <Link to={`/item/${it.id}`} className="block overflow-hidden rounded-2xl border border-gray-100 transition active:scale-[.97]">
                <span className="block aspect-[4/3]" style={{ background: it.color }} aria-hidden="true" />
                <span className="block truncate px-3 py-2 text-sm font-medium">{it.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="px-4 py-16 text-center text-sm text-gray-400">검색 결과가 없어요</p>}
    </div>
  );
}
