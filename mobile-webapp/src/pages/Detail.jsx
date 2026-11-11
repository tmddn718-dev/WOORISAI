import { Link, useParams } from 'react-router-dom';
import { ITEMS } from '../data.js';

export default function Detail() {
  const { id } = useParams();
  const item = ITEMS.find(i => i.id === id);
  if (!item) return <div className="px-4 py-20 text-center text-gray-500">존재하지 않는 항목이에요.<br /><Link to="/" replace className="mt-4 inline-block text-brand">홈으로 가기</Link></div>;
  return (
    <article className="pb-8">
      <div className="aspect-[4/3] w-full" style={{ background: item.color }} aria-hidden="true" />
      <div className="px-4 pt-4">
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand">{item.tag}</span>
        <h2 className="mt-3 text-2xl font-bold">{item.title}</h2>
        <p className="mt-2 leading-relaxed text-gray-600">{item.desc}</p>
        {/* 본문이 화면보다 길 때 본문만 스크롤되는지 확인하기 위한 반복 문단 */}
        {Array.from({ length: 6 }, (_, i) => <p key={i} className="mt-4 leading-relaxed text-gray-500">상단 바와 하단 영역은 고정되고 이 본문만 스크롤돼요. 끝까지 스크롤해도 주소창이나 body 로 스크롤이 번지지 않아요.</p>)}
        <div className="mt-6 flex gap-2">
          {[Number(id) - 1, Number(id) + 1].filter(n => n >= 1 && n <= ITEMS.length).map(n => (
            <Link key={n} to={`/item/${n}`} className="flex-1 rounded-xl border border-gray-200 py-3 text-center text-sm font-medium active:bg-gray-50">{n < Number(id) ? '이전 항목' : '다음 항목'}</Link>
          ))}
        </div>
      </div>
    </article>
  );
}
