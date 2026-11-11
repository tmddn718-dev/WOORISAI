import { Outlet, useLocation, useMatches, useNavigationType } from 'react-router-dom';
import Header from './Header.jsx';
import TabBar from './TabBar.jsx';
import { useScrollMemory } from '../hooks/useScrollMemory.js';

/** 화면 전환: 새로 이동(PUSH)은 오른쪽에서, 뒤로(POP)는 왼쪽에서, 탭 전환(REPLACE)은 페이드. */
function useTransitionClass() {
  const type = useNavigationType();
  return type === 'POP' ? 'anim-pop' : type === 'PUSH' ? 'anim-push' : 'anim-fade';
}

function Body() {
  const { pathname } = useLocation();
  const ref = useScrollMemory();
  const anim = useTransitionClass();
  return (
    <main ref={ref} className="scroll-area px-safe">
      <div key={pathname} className={anim}><Outlet /></div>
    </main>
  );
}

const useTitle = () => useMatches().at(-1)?.handle?.title ?? '';

/** 하단 탭이 있는 최상위 화면(홈·탐색·알림·내 정보) */
export function TabLayout() {
  const title = useTitle();
  return (
    <>
      <Header title={title} />
      <Body />
      <TabBar />
    </>
  );
}

/** 탭 없이 쌓이는 화면(상세·작성). 상단에 뒤로 가기 버튼 */
export function StackLayout() {
  const title = useTitle();
  return (
    <>
      <Header title={title} back />
      <Body />
    </>
  );
}
