# 사용자 테스트 프로토타입 (브랜치 `ux-test-vercel-scenarios`)

Claude Design 원본 디자인(`mobile-prototype-review-checklist/project`)을 그대로 쓰면서, 처음부터 사용해 보기와 주요 기능 체험을 테스트할 수 있게 만든 정적 프로토타입. 서버가 없고, 상태는 탭의 `sessionStorage`에만 있다.

## 구조
| 경로 | 내용 |
|---|---|
| `/` (`index.html`) | **테스트 진입 영역**: 스플래시 → 온보딩 → 모드 선택(처음부터 사용해 보기 / 주요 기능 체험하기) → 가입·로그인 또는 가이드. 실제 서비스 화면이 아님 |
| `/app.html` | **테스트 빌드**: 원본 인터랙티브 프로토타입. 화면(마크업)은 원본과 바이트 단위로 같고, 맨 아래 로직 `<script>` 만 `ux-test/proto-patch.mjs` 로 고친다 |
| 원본 파일명 그대로 | 원본 프로토타입·시안 모음 등. 수정 없이 복사하고 빌드 때 sha256 검사 |

빌드: `node ux-test/build.mjs` → `dist-ux-test/` (Vercel 이 같은 명령으로 빌드).

## 테스트 빌드가 원본과 다른 점(로직만)
- 시작 데이터: 설정(`wsux_cfg`)에 따라 신규(친구·추억·약속·발자국 0개) / 체험 시나리오 1·2·3 / 설정 없음(원본 기본). 설정이 없으면 원본과 같게 동작하며, 시안 모음 31개 상태의 렌더링이 원본과 같은 것을 확인한다.
- 친구 목록을 상태로 관리(원본은 6명 고정). 새로고침해도 유지(탭 단위 `sessionStorage`). 기기에서 고른 사진은 EXIF 가 사라지게 다시 그려 저장.
- 시뮬레이션: ①참여자 화면에서 초대 링크를 복사하면 잠시 뒤 친구가 수락하고 사진 2장·이야기를 더한다 ②새 약속을 만들면 초대한 친구들이 차례로 참석/미정/불참으로 답한다. 실제 초대·알림은 가지 않는다.
- 혼자 남긴 추억(친구 0명)의 문구 보정.

## 시나리오 (가이드 `#/guide`)
1. 친구와 함께 기록하기 — 친구 3명, 공동 추억(제주·한강), 초대 카드
2. 함께할 약속 만들기 — 다가오는·지난·연결된 약속, 약속에서 추억 만들기
3. 쌓인 추억 다시 발견하기 — 추억 24개, 달력·발자국·지역 스탬프
각 시나리오는 시작 데이터 다시 불러오기(시나리오 초기화), 전체 초기화, 다음 시나리오 이동을 제공한다. 단계는 화면에서 실제로 동작하면 자동 체크된다.

## 실제 구현 vs 시뮬레이션
- 실제 동작(탭 안에서): 가입/로그인 폼 검증, 만든 추억·약속·사진의 이후 화면 반영(피드·달력·발자국·나), 새로고침 유지, 시나리오별 데이터 분리·초기화, 참가자(탭)별 격리
- 시뮬레이션: 비밀번호(저장·확인 안 함), 친구 초대 수락, 약속 응답, 서버 권한 검증(없음)

## GA4
동의 배너에서 동의해야 GA 를 불러온다(거부해도 체험은 동일). 모든 이벤트에 `event_source=ux_test`, `flow`(new=처음부터, demo=기능 체험), `scenario`(1~3)가 붙어 두 테스트를 구분한다. 이름·입력한 글·사진은 허용 목록에 없어 보내지 않는다.
- 신규: `first_visit_test`, `sign_up_start`, `sign_up`, `create_start`, `create_save`(first), `create_abandon`
- 체험: `test_start`, `scenario_start/complete/reset`, `invite_start/complete`, `contrib_add`, `photo_view`, `plan_create_start/plan_create/plan_rsvp/plan_to_memory/plan_memory_view`, `cal_view`, `foot_view`, `region_view`, `memory_view`
- 단계 이벤트는 세션당 한 번, 탐색 이벤트는 반복 전송. localhost 에서는 전송하지 않고 `window.__uxGaLog` 에만 기록.
- 이전 앱 단계(`ux-test-vercel-app-backup` 브랜치)의 `experience_start`, `friend_add_*`, `post_create_*` 는 이번 빌드에 없다.
