// 의존성 없이 쓰는 24px 선형 아이콘(stroke=currentColor).
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
const make = d => function Icon(props) { return <svg {...base} {...props}>{d}</svg>; };

export const HomeIcon = make(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20h5v-6h4v6h5V9.5" /></>);
export const SearchIcon = make(<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>);
export const BellIcon = make(<><path d="M6 9a6 6 0 1 1 12 0c0 6 2 7.5 2 7.5H4S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>);
export const UserIcon = make(<><circle cx="12" cy="8" r="4" /><path d="M4 20c1.2-3.6 4-5.5 8-5.5s6.8 1.9 8 5.5" /></>);
export const BackIcon = make(<path d="m15 5-7 7 7 7" />);
export const PlusIcon = make(<path d="M12 5v14M5 12h14" />);
export const ChevronIcon = make(<path d="m9 5 7 7-7 7" />);
