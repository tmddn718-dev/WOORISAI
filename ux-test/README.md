# UX 테스트용 정적 프로토타입 (브랜치 `ux-test-vercel`)

사용성 테스트 참가자가 **서버 없이** 가입 → 친구 추가 → 첫 추억 만들기를 체험하게 하는 정적 배포본이다.
운영 서비스(`main`, `server.js`, `public/`)는 **수정하지 않았다**. 테스트용 코드는 전부 이 폴더(`ux-test/`)에 있다.

## 구조
| 파일 | 역할 |
|---|---|
| `mock-api.js` | `fetch`를 가로채 `/api/*`에 가상 데이터로 응답. 데이터는 탭의 `sessionStorage`에만 저장 |
| `seed.js` | 검색 가능한 가상 친구(`minsu`, `jia`, `haeun`), 사용 불가 이름 목록 |
| `flow.js` | 스플래시·온보딩·테스트 완료 화면, 화면 이벤트 |
| `analytics.js` | GA4 준비. 측정 ID가 없으면 아무것도 전송하지 않음 |
| `build.mjs` | `public/` → `dist-ux-test/` 복사, 테스트 스크립트 삽입, 산출물 검사 |
| `media/` | 직접 만든 시드 이미지(SVG) |

## 테스트 흐름
스플래시 → 온보딩 → 가입(이름·닉네임·비밀번호·동의) → 친구 0명 홈 → 사람 화면에서 `minsu`·`jia`·`haeun` 중 하나를 이름으로 연결 요청(3초 뒤 상대가 자동 수락) → 새 추억 만들기 → 테스트 완료 화면.
- 친구가 0명이면 추억을 만들 수 없다(기존 앱 규칙 그대로). 먼저 친구를 추가해야 한다.
- 로그인은 이 브라우저에서 가입한 이름만 된다. **비밀번호는 저장도 확인도 하지 않는다.**

## 데이터와 개인정보
- 가상 데이터는 참가자 브라우저 탭 안에만 있다. 외부 서버로 보내지 않는다. 탭을 닫으면 사라진다.
- 업로드한 사진은 브라우저 메모리(Blob)에만 있고 새로고침하면 사라진다.
- 초기화: 주소 뒤에 `?reset=1`, 또는 테스트 완료 화면의 「데이터 지우고 끝내기」. 진행자는 매 참가자마다 새 탭(또는 시크릿 창)을 쓰면 데이터가 섞이지 않는다.
- 앱이 쓰는 `localStorage` 초안(`ws_draft`)도 초기화 때 지운다.

## 실제 서비스와 다른 점 (오인 금지)
- **서버 권한 검증이 없다.** "초대된 사람만 볼 수 있어요" 같은 문구는 화면 그대로지만 이 배포본은 권한을 강제하지 않는다.
- 간편가입(카카오·네이버·Google), 모임, 그룹, 정산, 신고는 테스트 범위 밖이다(빈 목록이거나 "이번 테스트 범위에 없어요").
- 초대한 친구는 수락 전(`초대 중`) 상태로 남는다.

## GA4 (준비만 됨)
- 측정 ID가 비어 있으면 스크립트도 배너도 없다. ID를 받으면 빌드 환경변수 `UX_GA_ID=G-XXXXXXXXXX`로 넣는다.
- 동의를 받기 전에는 GA 스크립트를 불러오지 않는다(동의 문구는 임시, 법률 검토 필요: 국외 이전 고지 등).
- 보내는 이벤트는 `analytics.js`의 허용 목록만: `ux_splash_view`, `ux_onboarding_step`, `ux_screen_view`, `ux_signup_complete`, `ux_empty_home_view`, `ux_friend_search`, `ux_friend_add_complete`, `ux_post_create_start`, `ux_post_create_complete`, `ux_test_complete`, `ux_error_view`.
- 이름·닉네임·제목·본문·사진 등 자유 입력과 식별 정보는 보내지 않는다. 광고 신호·광고 개인화는 끈다.

## 배포 (Vercel Hobby)
- Framework Preset: **Other**. `vercel.json`이 빌드 명령(`node ux-test/build.mjs`)과 출력 폴더(`dist-ux-test`)를 지정한다. Production Branch를 `ux-test-vercel`로 두거나 Preview로 쓴다.
- 로컬 확인: `node ux-test/build.mjs` 후 `dist-ux-test/`를 정적 서버로 연다(`/media/:id`는 `vercel.json`의 rewrite 필요).
- 검색 노출 방지: `noindex` 메타와 `X-Robots-Tag` 헤더.
