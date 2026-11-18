import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { TabLayout, StackLayout } from './components/Layouts.jsx';
import { useAppViewport } from './hooks/useAppViewport.js';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import Alerts from './pages/Alerts.jsx';
import Me from './pages/Me.jsx';
import Detail from './pages/Detail.jsx';
import Compose from './pages/Compose.jsx';

// 모든 화면이 URL 을 가지므로 브라우저/스마트폰 뒤로 가기, 새로고침, 링크 공유가 그대로 동작한다.
const router = createBrowserRouter([
  { element: <TabLayout />, children: [
    { path: '/', element: <Home />, handle: { title: '홈' } },
    { path: '/explore', element: <Explore />, handle: { title: '탐색' } },
    { path: '/alerts', element: <Alerts />, handle: { title: '알림' } },
    { path: '/me', element: <Me />, handle: { title: '내 정보' } },
  ] },
  { element: <StackLayout />, children: [
    { path: '/item/:id', element: <Detail />, handle: { title: '상세' } },
    { path: '/compose', element: <Compose />, handle: { title: '글쓰기' } },
    { path: '*', element: <div className="px-4 py-20 text-center text-gray-500">페이지를 찾을 수 없어요.</div>, handle: { title: '' } },
  ] },
]);

export default function App() {
  useAppViewport();
  return <div className="app"><RouterProvider router={router} /></div>;
}
