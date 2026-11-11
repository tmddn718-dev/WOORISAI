import { NavLink } from 'react-router-dom';
import { HomeIcon, SearchIcon, BellIcon, UserIcon } from './Icons.jsx';

const TABS = [
  { to: '/', label: '홈', Icon: HomeIcon, end: true },
  { to: '/explore', label: '탐색', Icon: SearchIcon },
  { to: '/alerts', label: '알림', Icon: BellIcon },
  { to: '/me', label: '내 정보', Icon: UserIcon },
];

/** 하단 고정 탭. 홈 인디케이터 영역(safe-area-inset-bottom)만큼 아래를 비운다. */
export default function TabBar() {
  return (
    <nav aria-label="주요 메뉴" className="tabbar chrome shrink-0 border-t border-gray-100 bg-white pb-safe px-safe">
      <ul className="grid grid-cols-4">
        {TABS.map(({ to, label, Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              replace
              className={({ isActive }) =>
                `flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-transform active:scale-95 ${isActive ? 'text-brand' : 'text-gray-400'}`
              }
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
