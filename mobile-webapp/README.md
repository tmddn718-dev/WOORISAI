# mobile-webapp

링크만 열면 네이티브 앱처럼 쓰는 모바일 웹앱 (React + Vite + Tailwind CSS v4). 설치를 요구하지 않고, 주소창을 숨기려 하지 않는다.

```bash
npm install
npm run dev       # 개발 서버 (--host: 같은 와이파이의 휴대폰에서 접속)
npm run build     # dist/
npm run preview   # 빌드 결과 확인 (SPA 폴백 포함)
```

## 배포 (Vercel)
`vercel.json` 에 SPA rewrite 가 들어 있다(`/assets/`·확장자가 있는 파일 제외, 나머지는 `/index.html`). Vercel 에서 이 폴더를 루트로 가져오면 프레임워크(Vite)를 자동 인식한다.

## 구조와 핵심 구현
| 요구 | 구현 위치 |
|---|---|
| 100dvh 앱 레이아웃, 본문만 스크롤 | `src/index.css` `.app`(고정, `100vh`→`100dvh`→`--app-height`), `.scroll-area`(`overscroll-behavior: contain`), html/body `overflow:hidden` |
| Safe Area | `viewport-fit=cover` + `pt-safe` / `pb-safe` / `px-safe` 유틸리티(`env(safe-area-inset-*)`), 헤더·탭바·작성 화면 하단 바에 적용 |
| 하단 고정 탭 | `src/components/TabBar.jsx` (flex 하단 고정, 탭 이동은 `replace` 라 탭끼리 뒤로 가기에 쌓이지 않는다) |
| 화면 이동·뒤로 가기 | `src/App.jsx` — `createBrowserRouter`. 모든 화면이 URL 이라 브라우저/스마트폰 뒤로 가기·새로고침·공유가 동작. 직접 진입했을 때 뒤로 가기 버튼은 홈으로 보낸다(`Header.jsx`) |
| 전환·터치 | PUSH 는 오른쪽에서, POP 은 왼쪽에서, 탭 전환은 페이드(`Layouts.jsx`, `index.css`). 눌림 상태 `active:scale`, 탭 하이라이트·더블탭 확대 제거. 뒤로 가기 때 스크롤 위치 복원(`useScrollMemory.js`) |
| 키보드 | `src/hooks/useAppViewport.js` — `visualViewport` 로 `--app-height`/`--app-top` 을 맞추고, 키보드가 열리면 `html[data-kb=open]` 로 하단 탭을 숨긴다. 입력칸 16px(iOS 확대 방지), 포커스 시 본문 안에서 중앙으로 스크롤 |
| 호환성 | 빌드 타깃 `safari14`/`chrome87`, `dvh` 미지원·`visualViewport` 없는 WebView 는 `100vh`/`innerHeight` 로 폴백. 내 정보 탭의 "환경 정보"에서 브라우저(카카오톡 포함)·안전 영역·뷰포트·키보드 상태 확인 |

## 확인한 것 / 못 한 것
- 확인: 375×812 에서 레이아웃·본문 단독 스크롤·탭 전환·상세 이동·뒤로 가기(버튼/브라우저)·스크롤 복원·직접 진입·키보드 열림/닫힘 시뮬레이션(`visualViewport` 높이 조작).
- 못 함: 실제 iOS Safari / Android Chrome / 카카오톡 인앱 브라우저 기기 테스트와 실제 노치 기기의 안전 영역 값. 배포 후 휴대폰에서 링크로 열어 확인해야 한다.
