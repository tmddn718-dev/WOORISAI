# 우리사이(WOORISAI) 디자인 시스템

> WOORISAI Design System  
> Version 1.1 · 2026.11.10  
> Status: 최종 개선 명세 확정 · Figma/코드 반영 및 QA는 별도 수행  
> Brand principle: Content First · Quiet Archive  
> UX writing: Warm but Clear

---

## 0. 문서 사용법

이 문서는 우리사이 제품의 브랜드, 토큰, 컴포넌트, 접근성, 반응형 동작을 정의하는 단일 기준 문서다.

- `MUST`: 출시 전에 반드시 충족한다.
- `SHOULD`: 특별한 제품 근거가 없다면 따른다.
- `MAY`: 맥락에 따라 선택할 수 있다.
- Atomic token은 팔레트 정의에만 사용한다.
- 제품 화면과 컴포넌트는 Semantic 또는 Component token만 사용한다.
- 문서의 규격 확정과 실제 Figma/코드 구현 완료는 구분한다.
- 권한·정산·삭제 문구는 실제 서버 정책과 일치할 때만 사용한다.

### 0.1 Version 1.1 핵심 개선

| Priority | 개선 내용 | 명세 상태 |
|---|---|---|
| P0 | Badge 및 아이콘 대비 강화 | 확정 |
| P0 | Checkbox 체크 SVG 중앙 정렬 | 확정 |
| P0 | Radio 내부 indicator 중앙 정렬 | 확정 |
| P0 | Switch를 44×26, knob 20px로 통일 | 확정 |
| P0 | Button/IconButton 상태 계약 보완 | 확정 |
| P0 | Access Scope Panel의 선택·설명 규칙 강화 | 확정 |
| P1 | Chip/SegmentedControl 상태 구분 강화 | 확정 |
| P1 | Avatar/ParticipantGroup 대비·겹침 규격 통일 | 확정 |
| P1 | Card/Product Card의 정보 위계 통일 | 확정 |
| P1 | Figma Variables와 코드 토큰 매핑 규칙 추가 | 확정 |
| P1 | 반응형·키보드·Reduced Motion QA 매트릭스 추가 | 확정 |

---

## 1. 시스템의 성격

우리사이는 사람과 사람이 함께한 사진과 글을 조용히 보관하는 공동 추억 기록 서비스다. 인터페이스는 소셜 피드처럼 경쟁적이지 않고, 사용자의 콘텐츠가 브랜드 장식보다 먼저 보여야 한다.

### 1.1 계승하는 구조

- Atomic → Semantic → Component의 토큰 계층
- 4px 기반 spacing 체계
- Pretendard 기반의 명확한 정보 위계
- Auto Layout과 Variant 중심의 컴포넌트 구조
- Light/Dark mode 분리
- 접근성과 상태 명세를 포함한 운영 방식

### 1.2 우리사이만의 방향

- Wanted Blue 대신 Archive Green을 사용한다.
- 차가운 흰색 단일 배경 대신 Warm White 캔버스를 사용한다.
- 사진과 글이 가장 강한 시각 요소가 된다.
- 그룹 소속, 실제 참석, 추억 열람 권한을 서로 다른 개념으로 표현한다.
- 정산 금액과 위치 정보는 필요한 사람에게만 필요한 범위로 보여준다.
- 따뜻한 문장을 쓰되 권한·삭제·오류는 정확한 사실을 우선한다.

### 1.3 브랜드 키워드

| Keyword | UI 해석 |
|---|---|
| Private | 권한과 결과를 행동 전에 명확히 설명 |
| Collaborative | 참여자를 드러내되 관계를 임의로 추정하지 않음 |
| Timeless | 유행성 장식보다 오래 읽히는 구조 |
| Quiet | 색과 모션을 절제하고 콘텐츠에 집중 |
| Warm | 차갑지 않은 중성색과 자연스러운 문장 |
| Trustworthy | 실제 데이터·권한 동작과 UI 설명 일치 |

---

## 2. 브랜드 아이덴티티

### 2.1 브랜드 기준

| 항목 | 기준 |
|---|---|
| 브랜드 | 우리사이 / WOORISAI |
| 로고 개념 | 연결의 매듭(Connection Knot) |
| Primary | Archive Green `#566B5C` |
| Text Primary | Deep Ink `#242622` |
| App Canvas | Warm White `#FAF9F6` |
| Surface | White `#FFFFFF` |
| Secondary Surface | Soft Sage `#E9EDE7` |
| 제품 서체 | Pretendard |
| 한글 워드마크 | NanumSquareRound ExtraBold 기반 |

### 2.2 로고

- 한글 워드마크는 `우리사이`를 우선한다.
- 영문 `WOORISAI`는 작은 보조 표기에 사용한다.
- 워드마크는 제품 본문 서체로 재조판하지 않는다.
- 최소 clear space는 워드마크 높이의 0.5배다.
- 앱 아이콘은 Connection Knot 심볼을 사용하되 작은 크기에서 형태가 뭉개지지 않아야 한다.
- 로고를 카드 장식, 상태 아이콘, 로딩 표시로 반복 사용하지 않는다.

### 2.3 사진과 브랜드의 관계

- 사진에 상시 브랜드 tint를 적용하지 않는다.
- 사진 위 텍스트가 불가피하면 하단 중성 scrim만 사용한다.
- 사진이 없을 때만 Soft Sage placeholder를 사용한다.
- 얼굴·관계를 자동으로 추정하는 강조 표현을 금지한다.
- 위치 정확도가 낮은 기록을 정밀 좌표처럼 표현하지 않는다.

---

## 3. 토큰 아키텍처

### 3.1 계층

```text
Primitive
  └─ Semantic (Light / Dark)
       └─ Component
            └─ Pattern / Screen
```

- Primitive 값 변경은 모든 모드와 상태에 미치는 영향을 검토한다.
- Semantic token의 의미는 버전 내에서 변경하지 않는다.
- 새 의미에는 새 token을 만든다.
- 화면 코드에서 Primitive token 직접 사용을 금지한다.

### 3.2 Naming

```text
Figma Variable   color/bg/brand
CSS Variable     --ws-color-bg-brand
Android          ws_color_bg_brand
iOS              WSColor.bgBrand
Component token  --ws-button-primary-bg
```

- Prefix는 `ws`다.
- 이름은 역할을 표현하고 시각값을 이름에 넣지 않는다.
- 상태 suffix는 `hover`, `active`, `focus`, `disabled`, `loading` 순서를 사용한다.
- `gray-500-button`처럼 값과 사용처가 뒤섞인 이름을 금지한다.

---

## 4. Color

### 4.1 Core palette

| Role | Primitive | Value |
|---|---|---:|
| Primary | `archive-green-600` | `#566B5C` |
| Deep Ink | `warm-neutral-950` | `#242622` |
| Canvas | `warm-neutral-50` | `#FAF9F6` |
| Surface | `warm-neutral-0` | `#FFFFFF` |
| Soft Sage | `sage-100` | `#E9EDE7` |

Archive Green은 White 텍스트와 약 5.75:1, Warm White 배경과 약 5.46:1의 대비를 가진다. 더 밝은 Green 단계는 작은 본문에 사용하지 않는다.

### 4.2 Primitive palette

#### Archive Green

| Token | Hex | Use |
|---|---:|---|
| `archive-green-50` | `#F7F9F6` | 약한 hover |
| `archive-green-100` | `#EEF2ED` | brand subtle |
| `archive-green-200` | `#DCE5DE` | 선택 보조 면 |
| `archive-green-300` | `#C3D1C6` | dark brand foreground |
| `archive-green-400` | `#9FB2A3` | dark brand action |
| `archive-green-500` | `#758A7A` | 큰 아이콘·비텍스트 강조 |
| `archive-green-600` | `#566B5C` | primary |
| `archive-green-700` | `#45584A` | hover·brand text |
| `archive-green-800` | `#35443A` | active |
| `archive-green-900` | `#27322B` | dark subtle surface |
| `archive-green-950` | `#181F1B` | dark deep surface |

#### Warm Neutral

| Token | Hex |
|---|---:|
| `warm-neutral-0` | `#FFFFFF` |
| `warm-neutral-50` | `#FAF9F6` |
| `warm-neutral-75` | `#F6F4EF` |
| `warm-neutral-100` | `#EFEEE9` |
| `warm-neutral-150` | `#E9E7E1` |
| `warm-neutral-200` | `#DDDBD4` |
| `warm-neutral-300` | `#C7C4BC` |
| `warm-neutral-400` | `#AAA69D` |
| `warm-neutral-500` | `#8C887F` |
| `warm-neutral-600` | `#716E67` |
| `warm-neutral-700` | `#58564F` |
| `warm-neutral-800` | `#41413C` |
| `warm-neutral-850` | `#343530` |
| `warm-neutral-900` | `#2B2D29` |
| `warm-neutral-950` | `#242622` |
| `warm-neutral-975` | `#171815` |
| `warm-neutral-1000` | `#0F100E` |

#### Sage

| Token | Hex |
|---|---:|
| `sage-50` | `#F4F6F3` |
| `sage-100` | `#E9EDE7` |
| `sage-200` | `#D8DED5` |
| `sage-300` | `#C1CBC0` |
| `sage-400` | `#A3B1A3` |
| `sage-500` | `#829382` |
| `sage-600` | `#687A69` |
| `sage-700` | `#526054` |
| `sage-800` | `#3F4A41` |
| `sage-900` | `#303833` |

### 4.3 Status palette

성공색과 브랜드색을 분리해 “선택됨”과 “완료됨”을 혼동하지 않게 한다.

| Tone | Background | Foreground | Border |
|---|---:|---:|---:|
| Neutral | `#EFEEE9` | `#555750` | `#DDDBD4` |
| Brand | `#E9EDE7` | `#435648` | `#9FB2A3` |
| Info | `#EDF4FA` | `#355F8A` | `#B8D2E8` |
| Success | `#EDF7F0` | `#2F6B45` | `#B7D9C2` |
| Warning | `#FFF6E5` | `#7A4E00` | `#E8C98A` |
| Danger | `#FEF0EE` | `#B42318` | `#F1B9B3` |

### 4.4 Semantic tokens — Light

```yaml
color:
  bg:
    canvas: "#FAF9F6"
    surface: "#FFFFFF"
    surface-subtle: "#F6F4EF"
    surface-muted: "#EFEEE9"
    elevated: "#FFFFFF"
    inverse: "#242622"
    brand: "#566B5C"
    brand-hover: "#45584A"
    brand-active: "#35443A"
    brand-subtle: "#EEF2ED"
    recall-subtle: "#E9EDE7"
  fg:
    strong: "#242622"
    default: "#343530"
    secondary: "#58564F"
    tertiary: "#716E67"
    disabled: "#AAA69D"
    inverse: "#FFFFFF"
    on-brand: "#FFFFFF"
    brand: "#435648"
    link: "#45584A"
    info: "#355F8A"
    success: "#2F6B45"
    warning: "#7A4E00"
    danger: "#B42318"
  border:
    subtle: "rgba(88,86,79,.12)"
    default: "rgba(88,86,79,.26)"
    strong: "rgba(88,86,79,.42)"
    brand: "#566B5C"
    focus: "#566B5C"
    info: "#B8D2E8"
    success: "#B7D9C2"
    warning: "#E8C98A"
    danger: "#B42318"
  status:
    bg:
      info: "#EDF4FA"
      success: "#EDF7F0"
      warning: "#FFF6E5"
      danger: "#FEF0EE"
  overlay:
    hover: "rgba(36,38,34,.06)"
    active: "rgba(36,38,34,.14)"
    scrim: "rgba(15,16,14,.52)"
```

### 4.5 Semantic tokens — Dark

```yaml
color-dark:
  bg:
    canvas: "#171815"
    surface: "#242622"
    surface-subtle: "#2B2D29"
    surface-muted: "#343530"
    elevated: "#41413C"
    inverse: "#FAF9F6"
    brand: "#9FB2A3"
    brand-hover: "#C3D1C6"
    brand-active: "#DCE5DE"
    brand-subtle: "#27322B"
    recall-subtle: "#303833"
  fg:
    strong: "#FFFFFF"
    default: "rgba(255,255,255,.88)"
    secondary: "rgba(255,255,255,.64)"
    tertiary: "rgba(255,255,255,.46)"
    disabled: "rgba(255,255,255,.30)"
    inverse: "#242622"
    on-brand: "#242622"
    brand: "#C3D1C6"
    link: "#C3D1C6"
    info: "#9EC7E8"
    success: "#9ED0AE"
    warning: "#F0CB7A"
    danger: "#F3A59C"
  border:
    subtle: "rgba(255,255,255,.10)"
    default: "rgba(255,255,255,.22)"
    strong: "rgba(255,255,255,.36)"
    brand: "#9FB2A3"
    focus: "#C3D1C6"
    info: "#41627F"
    success: "#426B50"
    warning: "#80652C"
    danger: "#874A45"
  status:
    bg:
      info: "#1D3142"
      success: "#1E3527"
      warning: "#3A2E16"
      danger: "#3D2220"
```

Dark status pair는 각각 7.6:1 이상의 텍스트 대비를 확보하도록 확정했다.

### 4.6 Color rules

- 한 화면의 Primary CTA는 원칙적으로 하나다.
- Archive Green은 핵심 행동, 현재 선택, focus ring, 링크에 제한적으로 사용한다.
- 사진 카드 전체나 긴 본문 배경을 브랜드색으로 채우지 않는다.
- Soft Sage는 성공 상태가 아니다.
- 중요한 상태는 색상만으로 전달하지 않는다.
- Disabled는 낮은 대비만으로 표현하지 않고 상호작용 불가 상태를 함께 전달한다.
- 활성 텍스트는 WCAG AA를 충족해야 한다. Disabled 텍스트는 예외가 될 수 있지만 의미 전달 수단으로 사용하지 않는다.

---

## 5. Typography

### 5.1 Font policy

```css
--ws-font-product: "Pretendard Variable", Pretendard, -apple-system,
  BlinkMacSystemFont, system-ui, "Apple SD Gothic Neo", "Noto Sans KR",
  "Malgun Gothic", sans-serif;
--ws-font-wordmark: "NanumSquareRound", "Pretendard Variable", sans-serif;
--ws-font-mono: "SF Mono", ui-monospace, "JetBrains Mono", Menlo, monospace;
```

- 제품 UI는 Pretendard를 사용한다.
- NanumSquareRound ExtraBold는 공식 한글 워드마크에만 사용한다.
- 날짜·금액·통계에는 `font-variant-numeric: tabular-nums`를 사용한다.
- 본문은 400/500, 버튼·라벨은 600, 제목은 700을 기본으로 한다.

### 5.2 Type scale

| Token | Size / Line | Weight | Letter spacing | Use |
|---|---:|---:|---:|---|
| `display-1` | 56 / 72 | 700 | -0.032em | 회고 커버 |
| `display-2` | 40 / 52 | 700 | -0.028em | 웹 헤드라인 |
| `display-3` | 36 / 48 | 700 | -0.027em | 대형 타이틀 |
| `title-1` | 32 / 44 | 700 | -0.025em | 페이지 타이틀 |
| `title-2` | 28 / 38 | 700 | -0.024em | 상세 타이틀 |
| `title-3` | 24 / 32 | 700 | -0.023em | 시트 타이틀 |
| `heading-1` | 22 / 30 | 700 | -0.019em | 섹션 헤딩 |
| `heading-2` | 20 / 28 | 700 | -0.012em | 그룹 헤딩 |
| `headline-1` | 18 / 26 | 600 | -0.002em | 카드 타이틀 |
| `headline-2` | 17 / 24 | 600 | 0 | 리스트 타이틀 |
| `body-1` | 16 / 24 | 500 | 0.006em | 기본 본문 |
| `body-1-read` | 16 / 26 | 400 | 0.006em | 긴 글 |
| `body-2` | 15 / 22 | 500 | 0.010em | 카드 본문 |
| `body-2-read` | 15 / 24 | 400 | 0.010em | 보조 산문 |
| `label-1` | 14 / 20 | 600 | 0.014em | 버튼·필드 |
| `label-1-read` | 14 / 22 | 500 | 0.014em | 도움말 |
| `label-2` | 13 / 18 | 600 | 0.019em | 칩·메타 |
| `caption-1` | 12 / 16 | 500 | 0.025em | 날짜·상태 |
| `caption-2` | 11 / 14 | 500 | 0.031em | 보조 표기 |

### 5.3 Typography rules

- 사진·글 읽기 영역은 `*-read` line height를 사용한다.
- 본문 줄 길이는 모바일 30~40자, 데스크톱 45~70자를 권장한다.
- 권한·오류·삭제 설명은 ellipsis로 자르지 않는다.
- 같은 화면의 날짜 형식을 통일한다.
- 200% text zoom에서 핵심 행동과 권한 문구가 잘리지 않아야 한다.

---

## 6. Spacing, layout, shape

### 6.1 Spacing

```yaml
spacing:
  0: 0px
  1: 1px
  2: 2px
  4: 4px
  6: 6px
  8: 8px
  10: 10px
  12: 12px
  14: 14px
  16: 16px
  20: 20px
  24: 24px
  32: 32px
  40: 40px
  48: 48px
  56: 56px
  64: 64px
  72: 72px
  80: 80px
  96: 96px
```

4px 리듬을 기본으로 하며 1, 2, 6, 10, 14는 보더와 시각 보정에만 사용한다.

### 6.2 Responsive layout

| Surface | Breakpoint | Navigation | Content | Grid |
|---|---:|---|---|---|
| Mobile | `<768px` | 하단 탭 | 좌우 20px | 4 col / 16 gutter |
| Tablet | `≥768px` | 탭 또는 compact rail | max 720px | 8 col / 20 gutter |
| Desktop | `≥1024px` | 240px sidebar | 720~960px | 12 col / 24 gutter |
| Wide | `≥1440px` | 240px sidebar | max 1120px | 12 col / 24 gutter |

- 필수 검증 폭은 375, 768, 1024, 1280px이다.
- 하단 컨트롤은 safe area를 포함한다.
- 긴 추억 글은 데스크톱에서도 720px을 넘지 않는다.

### 6.3 Radius and elevation

```yaml
radius:
  micro: 4px
  small: 8px
  control: 12px
  card: 16px
  sheet: 20px
  media: 12px
  full: 9999px
elevation:
  0: none
  1: "0 1px 2px rgba(15,16,14,.05), 0 2px 6px rgba(15,16,14,.04)"
  2: "0 6px 18px rgba(15,16,14,.08), 0 2px 6px rgba(15,16,14,.05)"
  3: "0 14px 40px rgba(15,16,14,.14), 0 4px 12px rgba(15,16,14,.08)"
```

- 기본 카드에는 그림자를 사용하지 않는다.
- Dropdown/Toast는 Elevation 2, Modal/Sheet는 Elevation 3을 사용한다.
- Hover 시 사진 카드를 떠오르게 하지 않는다.

---

## 7. Motion

```yaml
motion:
  duration-instant: 100ms
  duration-fast: 150ms
  duration-base: 200ms
  duration-slow: 280ms
  easing-standard: "cubic-bezier(.2,0,0,1)"
  easing-enter: "cubic-bezier(0,0,0,1)"
  easing-exit: "cubic-bezier(.3,0,1,1)"
```

- Hover와 색상 변화: 100~150ms
- Switch knob: 180ms standard
- Tab/SegmentedControl: 150~200ms
- Modal/Sheet: 200~280ms
- Overshoot, bounce, 과한 parallax를 사용하지 않는다.
- `prefers-reduced-motion: reduce`에서는 위치 이동과 shimmer를 제거한다.

---

## 8. Iconography

| Token | Size | Use |
|---|---:|---|
| `icon-xs` | 16px | 작은 메타·Badge |
| `icon-sm` | 20px | Input·Button·Selection |
| `icon-md` | 24px | Navigation·IconButton |
| `icon-lg` | 32px | Empty state 보조 |

- 단색 SVG는 `currentColor`를 상속한다.
- 기본 stroke는 1.75~2px, round cap/join이다.
- IconButton은 `aria-label`과 최소 44×44px hit area를 제공한다.
- 상태 아이콘으로 이모지를 사용하지 않는다.
- 자물쇠 아이콘은 실제 권한 상태에만 사용한다.

---

## 9. 공통 컴포넌트 계약

### 9.1 Required states

상호작용 컴포넌트는 적용 가능한 상태를 모두 정의한다.

```text
Default → Hover → Active → Focus-visible
                         ↘ Disabled
                         ↘ Loading
                         ↘ Error
```

- Hover와 Focus는 동일한 상태가 아니다.
- Disabled와 Loading은 이벤트를 중복 실행하지 않는다.
- 상태 전환으로 외부 크기와 레이아웃이 변하지 않는다.
- Focus ring은 레이아웃을 밀지 않는 외곽 ring으로 표현한다.

### 9.2 Auto Layout

- Root component는 Auto Layout을 사용한다.
- 텍스트 길이에 대응하는 Hug/Fill 규칙을 명시한다.
- 내부 정렬은 baseline에 의존하지 않는다.
- 200% text zoom에서 고정 높이가 텍스트를 자르지 않아야 한다.
- Variant 변경 시 component bounds가 불필요하게 바뀌지 않아야 한다.

### 9.3 Focus

```css
:focus-visible {
  outline: 2px solid var(--ws-color-border-focus);
  outline-offset: 2px;
}
```

브랜드 면 위에서는 대비가 부족하면 2중 ring 또는 밝은 외곽 gap을 사용한다.

---

## 10. Core components

### 10.1 Button

| Size | Min height | Radius | Text | Padding inline |
|---|---:|---:|---|---:|
| Small | 36px | 12px | label-2 | 14px |
| Medium | 44px | 12px | label-1 | 18px |
| Large | 52px | 12px | body-1 / 600 | 24px |

| Variant | Background | Foreground / Border |
|---|---|---|
| Primary | `bg-brand` | `fg-on-brand` |
| Secondary | `bg-surface` | `fg-strong` / `border-default` |
| Tertiary | `bg-surface-subtle` | `fg-default` |
| Ghost | transparent | `fg-brand` |
| Neutral ghost | transparent | `fg-secondary` |
| Danger | `fg-danger` | White |

#### Button state contract

| State | Rule |
|---|---|
| Default | Variant 기본 token |
| Hover | 색상 또는 border 변화, 크기 변화 없음 |
| Active | `overlay-active` 또는 active token |
| Focus-visible | 2px ring + 2px offset |
| Disabled | 상호작용 제거, foreground/background 모두 disabled token 사용 |
| Loading | 너비 유지, spinner와 `aria-busy=true`, 중복 실행 방지 |

- 텍스트와 아이콘은 수평·수직 중앙에 배치한다.
- 아이콘은 `icon-sm` 20px, label과 8px 간격이다.
- Loading 중 기존 라벨 영역을 유지해 버튼 폭이 변하지 않게 한다.
- 파괴 행동은 구체적인 동사를 사용한다.

### 10.2 IconButton

| Item | Value |
|---|---|
| Visual size | 40px 또는 44px |
| Hit area | 최소 44×44px |
| Icon | 20px 또는 24px |
| Radius | 12px 또는 full |
| Default | transparent + `fg-default` |
| Hover | `bg-surface-subtle` |
| Selected | `bg-brand-subtle` + `fg-brand` |
| Disabled | `fg-disabled`, 이벤트 없음 |

- SVG는 `currentColor`를 사용한다.
- 배경과 아이콘의 비텍스트 대비는 3:1 이상이어야 한다.
- 아이콘만으로 의미가 불명확하면 visible label 또는 tooltip을 제공한다.

### 10.3 Text field

```yaml
text-field:
  min-height: 48px
  radius: 12px
  padding-inline: 16px
  background: bg-surface
  border: 1px border-default
  text: body-1 / fg-strong
  placeholder: fg-tertiary
  label: label-1 / fg-default
  helper: label-2 / fg-secondary
  textarea-min-height: 112px
```

- Hover: `border-strong`
- Focus: `border-brand` + focus ring
- Error: `border-danger` + 필드 바로 아래 오류 문구
- Disabled: `bg-surface-muted` + `fg-disabled`
- 오류를 Toast만으로 알리지 않는다.
- Label, helper, error는 input과 programmatically 연결한다.

### 10.4 Checkbox

| Item | Value |
|---|---|
| Visual box | 20×20px |
| Radius | 6px |
| Hit area | 최소 44×44px |
| Unchecked | `bg-surface` + `border-default` |
| Checked | `bg-brand` + White check |
| Check icon | 14px SVG, 2px stroke |
| Focus | 2px ring + 2px offset |

```text
44×44 Hit area
└─ 20×20 Box (center)
   └─ 14×14 SVG Check (center)
```

- Check는 문자 `✓`가 아니라 SVG를 사용한다.
- Box와 SVG는 Grid/Flex의 중앙 정렬을 사용한다.
- SVG viewBox와 path의 optical center를 확인한다.
- `line-height`와 text baseline에 의존하지 않는다.
- Indeterminate는 `—` SVG와 `aria-checked="mixed"`를 사용한다.

### 10.5 Radio

| Item | Value |
|---|---|
| Outer circle | 20×20px |
| Inner indicator | 10×10px |
| Hit area | 최소 44×44px |
| Selected | `border-brand` + centered brand indicator |
| Focus | 2px ring + 2px offset |

```text
44×44 Hit area
└─ 20×20 Outer circle (center)
   └─ 10×10 Inner circle (center)
```

- Border 두께를 늘려 내부 원처럼 보이게 만드는 방식을 사용하지 않는다.
- 실제 10px indicator를 중앙에 배치한다.
- Radio group은 방향키 탐색과 하나의 tab stop을 지원한다.
- Label 클릭으로 선택할 수 있어야 한다.

### 10.6 Switch

| Item | Value |
|---|---|
| Track | 44×26px |
| Knob | 20×20px |
| Vertical inset | 3px |
| OFF X | 3px |
| ON X | 21px |
| Animation | 180ms standard |
| Hit area | 최소 44×44px |

- ON/OFF에서 Knob의 Y 위치는 변하지 않는다.
- OFF는 중성 Track, ON은 Archive Green을 사용한다.
- 상태는 색상과 Knob 위치로 함께 표현한다.
- `prefers-reduced-motion`에서는 위치 애니메이션을 제거한다.
- 즉시 적용되는 설정에 사용하며 저장이 필요한 선택에는 Checkbox를 사용한다.

```css
.ws-switch {
  position: relative;
  inline-size: 44px;
  block-size: 26px;
  padding: 0;
  border: 0;
  border-radius: 9999px;
  box-sizing: border-box;
  background: var(--ws-color-border-strong);
}
.ws-switch[data-checked="true"] {
  background: var(--ws-color-bg-brand);
}
.ws-switch__knob {
  position: absolute;
  inset-block-start: 3px;
  inset-inline-start: 3px;
  inline-size: 20px;
  block-size: 20px;
  border-radius: 50%;
  background: var(--ws-color-bg-surface);
  transition: inset-inline-start 180ms var(--ws-easing-standard);
}
.ws-switch[data-checked="true"] .ws-switch__knob {
  inset-inline-start: 21px;
}
@media (prefers-reduced-motion: reduce) {
  .ws-switch__knob { transition: none; }
}
```

### 10.7 Badge

| Item | Value |
|---|---|
| Height | 24px |
| Radius | full |
| Padding | 5px 10px |
| Text | caption-1 / 600 |
| Optional icon | 16px |

Badge는 4.3 Status palette의 Background/Foreground 쌍만 사용한다. 낮은 대비의 임의 색 조합을 금지한다.

- Neutral, Brand, Info, Success, Warning, Danger를 지원한다.
- Status는 아이콘 또는 명확한 텍스트를 함께 사용한다.
- 상호작용이 필요하면 Badge가 아니라 Chip/Button을 사용한다.

### 10.8 Chip

| Kind | Height | Default | Selected |
|---|---:|---|---|
| Filter | 36px | Surface + border-default | brand-subtle + fg-brand + check |
| Person | 40px | Avatar + name | brand-subtle + check |
| Tag | 28px | surface-subtle | non-interactive |

- Default, Hover, Selected, Focus-visible, Disabled를 정의한다.
- Selected는 색상뿐 아니라 Check 또는 선택 indicator를 사용한다.
- 상태 변경으로 높이와 padding이 변하지 않는다.
- 긴 텍스트는 최소 375px 화면에서 검증한다.

### 10.9 Tabs and SegmentedControl

- Tab 최소 높이: 44px
- Tab active indicator: 하단 2px
- Segmented track: `bg-surface-muted`, 4px inset
- Selected segment: `bg-surface` + `fg-strong` + 필요 시 Elevation 1
- 키보드 방향키 탐색을 제공한다.
- Selected와 Hover는 구별되어야 한다.
- 선택 여부 때문에 전체 컴포넌트 폭이 변하지 않는다.

### 10.10 Avatar

| Size | Initial text |
|---|---:|
| 24px | 10px / 600 |
| 32px | 12px / 600 |
| 40px | 14px / 600 |
| 48px | 16px / 600 |

- 이니셜은 수평·수직 중앙에 배치한다.
- Fallback은 `bg-brand-subtle` + `fg-brand`를 기본으로 한다.
- 이미지가 없을 때 이름 첫 글자 또는 중립 아이콘을 사용한다.
- 이미지 로딩 실패 상태를 투명 이미지로 남기지 않는다.

### 10.11 ParticipantGroup

- Avatar 32px, overlap -8px, 각 Avatar에 2px Surface ring을 사용한다.
- 최대 4명까지 표시하고 나머지는 `+N`으로 표시한다.
- `+N`은 최소 32px 원과 4.5:1 텍스트 대비를 갖는다.
- 전체 그룹에 접근 가능한 이름을 제공한다. 예: `정우, 서연 외 3명`.
- 참여자와 열람 가능자를 같은 의미로 사용하지 않는다.

### 10.12 Card

```yaml
card:
  background: bg-surface
  border: 1px border-subtle
  radius: 16px
  padding: 20px
  shadow: none
```

- Hover는 `border-default` 또는 `bg-surface-subtle`을 사용한다.
- Selected는 1px `border-brand`와 subtle background를 사용한다.
- Selected에서 border가 두꺼워져 레이아웃이 흔들리지 않게 한다.
- 제목 → 날짜/상태 → 설명의 정보 위계를 유지한다.
- 사진이 있는 카드는 사진을 시각적 중심으로 둔다.

### 10.13 List Cell

- 최소 높이 56px, padding 14px 16px
- Leading avatar/icon은 40px 영역을 사용한다.
- Title은 body-2/600, Description은 label-2를 사용한다.
- Trailing에는 상태, 값, Chevron 중 하나만 우선 배치한다.
- 전체 행이 Action이면 내부에 중첩 Button을 두지 않는다.
- 파괴적 항목은 Danger text와 별도 확인 단계를 제공한다.

### 10.14 Modal and Bottom Sheet

- Modal max width 400px, radius 20px, padding 24px
- Bottom Sheet max width 520px, 상단 radius 20px
- Grip 40×4px
- Modal/Sheet는 focus trap과 trigger focus return을 제공한다.
- Destructive action은 마지막에 배치하고 결과를 구체적으로 설명한다.

### 10.15 Toast and Inline Message

- Toast: inverse surface, inverse foreground, radius 12px, Elevation 2, 기본 4초
- 되돌릴 수 있는 행동은 `되돌리기`를 제공한다.
- 입력 오류·권한 설명·정산 경고는 Inline Message를 사용한다.
- 지속적으로 필요한 정보는 자동 dismiss하지 않는다.

### 10.16 Empty, Loading, Error

- Empty: 48px icon, headline-2 title, label-1-read body
- Skeleton: warm-neutral-100/75, Reduced Motion에서는 정적
- Spinner: 24px, 3px track
- 기존 콘텐츠가 있으면 전체 화면 spinner 대신 해당 영역만 갱신한다.
- 빈 상태는 사용자의 잘못을 암시하지 않는다.

---

## 11. Product components

### 11.1 공통 정보 위계

```text
1. Title / 핵심 날짜
2. 상태·공개 범위
3. 장소·참여자
4. 설명
5. Action
```

- Card padding은 16px 또는 20px 중 하나를 사용한다.
- 내부 gap은 8/12/16px 토큰을 사용한다.
- 상태 Badge는 Core Badge의 동일한 token pair를 사용한다.
- 모바일 375px에서 문구가 잘리거나 Action이 화면 밖으로 나가면 안 된다.

### 11.2 Memory Card

```yaml
memory-card:
  radius: 16px
  background: bg-surface
  border: 1px border-subtle
  cover:
    aspect-ratio: 4/3
    radius: 12px
    fallback: bg-recall-subtle
  body:
    padding: 16px
    gap: 8px
  title: headline-2 / max-2-lines
  meta: label-2 / fg-secondary
```

- 대표 사진을 우선한다.
- 날짜를 1차 메타, 장소·사람을 2차 메타로 둔다.
- 공개 범위는 아이콘과 텍스트를 함께 표시한다.
- 접근 권한이 사라진 카드는 검색·지도·저장·회상에서도 제거한다.

### 11.3 Memory Detail Header

- 대표 사진과 제목을 분리해 사진 위 긴 텍스트를 피한다.
- 제목은 title-2, 날짜는 label-1, 장소·공개 범위는 label-2를 사용한다.
- 열람 가능 대상 문구와 ParticipantGroup을 함께 제공한다.
- 관리자·기여자 역할은 설정 맥락에서만 표시한다.

### 11.4 Photo Grid

| Count | Layout |
|---|---|
| 1 | 원본 비율, 4:5~16:9 범위 |
| 2 | 동일 폭 2열 |
| 3 | 큰 이미지 1 + 작은 이미지 2 |
| 4+ | 2×2 preview + 남은 개수 |

- Cell gap은 2px 또는 4px이다.
- 외곽 Cell에만 media radius를 적용한다.
- 업로드 진행·실패·재시도 상태를 이미지별로 표시한다.
- 사용자 설명이 없으면 파일명 대신 `추억 사진 1`처럼 맥락 있는 기본 label을 사용한다.

### 11.5 Access Scope Panel

개인정보와 직접 연결되는 P0 컴포넌트다.

| Item | Rule |
|---|---|
| Option hit area | 전체 행 클릭 가능, 최소 48px |
| Selection | 20px Radio + brand subtle row + explicit indicator |
| Title | label-1 / fg-strong |
| Description | caption-1 또는 label-1-read / fg-secondary |
| Layout | Radio, Title, Description의 정렬 일관성 유지 |

권장 문구:

- **나만 보기** — 내 보관함에서만 볼 수 있어요.
- **모임 멤버** — 현재 모임의 멤버가 볼 수 있어요.
- **링크가 있는 사람** — 링크를 받은 사람이 볼 수 있어요.

위 문구는 실제 권한 로직과 일치할 때만 사용한다. 그룹 소속·RSVP·실제 참석을 자동 열람 권한처럼 표현하지 않는다.

### 11.6 Invitation Card

- 수락 전에는 초대한 사람과 기록/모임 제목만 보여준다.
- 수락 전 사진·상세 위치·다른 참여자·댓글을 노출하지 않는다.
- Pending, Accepted, Expired, Revoked 상태를 텍스트로 구분한다.
- Primary `초대 수락`, Secondary `나중에` 또는 `거절`을 제공한다.

### 11.7 Recall Card

- Background는 `recall-subtle`을 사용한다.
- 날짜 → 대표 사진/제목 → 참여자의 순서로 보여준다.
- `1년 전 오늘`은 섹션 제목으로 사용한다.
- 숨기기, 특정 사람 제외, 다시 추천하지 않기, 저장을 구분한다.
- 죄책감이나 후회를 유도하는 문구를 사용하지 않는다.

### 11.8 Map Memory Marker

- Marker는 44px 대표 사진 또는 rounded square를 사용한다.
- 3px Surface ring과 Elevation 1을 적용한다.
- 겹치는 기록은 숫자 Cluster로 표현한다.
- `동네`·`도시` 정확도는 정밀 지점처럼 보이지 않는 넓은 영역으로 표현한다.
- 지도와 목록에는 현재 접근 가능한 기록의 교집합만 보여준다.

### 11.9 Meeting Card

- 날짜·시간을 가장 강하게 표시한다.
- 장소와 참석 상태를 다음 위계로 둔다.
- RSVP와 실제 참석 여부를 분리한다.
- 모임 완료 후 기억 생성을 제안할 수 있지만 자동 초대하지 않는다.

### 11.10 Settlement Privacy Card

- 금액은 정산 참여자에게만 표시한다.
- `정산 참여자만 금액을 볼 수 있어요.`를 명시한다.
- 금액은 neutral tone, 미확인 상태만 Warning을 사용한다.
- 일반 추억 카드·검색·지도·회상에 금액을 표시하지 않는다.

### 11.11 Privacy actions

| Action | Tone | 설명해야 할 결과 |
|---|---|---|
| 숨기기 | Neutral | 나에게만 보이지 않음 |
| 나가기 | Warning | 이후 열람·기여 불가와 내 기여물 처리 |
| 종료 | Warning | 신규 기여 중단 여부 |
| 내 기여물 삭제 | Danger | 내 사진·글만 삭제 |
| 추억 삭제 | Danger | 전체 기록과 파생 데이터 삭제 |
| 차단 | Danger | 신규 초대·댓글·알림 중단 |
| 신고 | Neutral/Danger | 운영 검토 요청 |

---

## 12. Navigation

### 12.1 Mobile bottom navigation

- 홈 / 약속 / 만들기 / 추억 / 나의 5개 탭
- 높이 56px + safe area
- 선택 탭: filled icon + `fg-brand`
- 미선택: outline icon + `fg-tertiary`
- 탭마다 접근 가능한 이름을 제공한다.

### 12.2 Desktop sidebar

- 너비 240px
- Nav item 최소 높이 44px, radius 12px
- Selected: `bg-brand-subtle` + `fg-brand`
- 만들기 Action은 중복 노출하지 않는다.

### 12.3 Header

- Mobile 56px, Desktop 64px
- 한 화면에 IconButton은 원칙적으로 최대 2개
- Header 전체를 브랜드색으로 채우지 않는다.

---

## 13. Content design

### 13.1 Voice

따뜻하지만 명확한 해요체를 사용한다. 느낌표는 기본적으로 사용하지 않는다.

| Situation | Recommended | Avoid |
|---|---|---|
| 권한 | 이 추억에 초대된 사람만 볼 수 있어요. | 우리끼리만 볼 수 있어요. |
| 빈 상태 | 아직 함께 남긴 추억이 없어요. | 첫 추억을 지금 당장 만들어 보세요! |
| 저장 | 변경 내용을 저장했어요. | 성공적으로 처리되었습니다. |
| 오류 | 사진을 올리지 못했어요. 다시 시도해 주세요. | 알 수 없는 오류가 발생했습니다. |
| 삭제 | 이 추억과 사진, 댓글이 모두 삭제돼요. | 정말 삭제할까요? |

### 13.2 Labels

- 버튼은 결과가 명확한 동사로 끝낸다.
- `확인`은 단순 고지에만 사용한다.
- 파괴 행동은 `추억 삭제`, `내 사진 삭제`처럼 구체적으로 쓴다.
- 구현 용어와 내부 상태값을 노출하지 않는다.

---

## 14. Accessibility

### 14.1 기준

| Target | Minimum |
|---|---:|
| 일반 텍스트 | 4.5:1 |
| 큰 텍스트 | 3:1 |
| 핵심 비텍스트 UI | 3:1 |
| Touch target | 44×44px |
| Focus indicator | 2px 이상 |
| Text zoom | 200% |

### 14.2 Interaction

- Keyboard focus 순서는 시각 순서와 일치한다.
- IconButton에는 접근 가능한 이름을 제공한다.
- 상태는 색상만으로 구분하지 않는다.
- 오류 발생 시 첫 오류 필드로 focus를 이동하고 입력값을 보존한다.
- Modal/Sheet는 focus trap과 focus return을 제공한다.
- Screen reader label에는 결과와 상태를 포함한다.
- 자동 재생 애니메이션과 음악을 기본으로 하지 않는다.

### 14.3 Control semantics

| Component | Required semantics |
|---|---|
| Checkbox | native input 우선, mixed 지원 시 `aria-checked="mixed"` |
| Radio | `radiogroup`, 방향키 이동, 하나의 tab stop |
| Switch | native checkbox 또는 `role="switch"` + checked state |
| Tabs | `tablist`, `tab`, `tabpanel`, 방향키 이동 |
| Dialog | accessible name, modal semantics, Escape 동작 |
| Toast | 중요도에 맞는 live region, focus 강제 이동 금지 |

---

## 15. Figma implementation contract

### 15.1 Variable collections

| Collection | Modes | Scope |
|---|---|---|
| Primitives | Value | palette source |
| Semantic Colors | Light / Dark | product colors |
| Dimensions | Value | spacing, radius, size |
| Typography | Value | font, size, line, weight |
| Motion | Value | duration, easing |

### 15.2 Component construction

- Component root는 Auto Layout을 사용한다.
- Color, spacing, radius, size는 가능한 경우 Variable에 bind한다.
- 상태는 Variant property로 관리한다.
- Label은 Text property를 제공한다.
- Icon 교체가 필요한 경우 Instance Swap property를 제공한다.
- Boolean property는 optional icon/helper/leading item에 사용한다.
- 한 Variant Set은 의미가 명확한 축만 포함한다.

### 15.3 Required Figma variants

| Component | Variant axes |
|---|---|
| Button | Style × Size × State |
| IconButton | Style × State × Size |
| TextField | State × Leading/Trailing optional |
| Checkbox | Selected × State |
| Radio | Selected × State |
| Switch | Selected × State |
| Badge | Tone |
| Chip | Selected × State |
| Card | Style × State |
| MemoryCard | Scope × State |
| InvitationCard | Status |

### 15.4 Figma QA

- Variant 변경 전후 root bounds 비교
- 내부 alignment overlay 비교
- Light/Dark mode 전환 확인
- Variable alias가 끊기지 않았는지 확인
- Instance가 detached되지 않았는지 확인
- 375px frame에서 긴 한국어 label 확인

---

## 16. Code token contract

```css
:root {
  color-scheme: light;
  --ws-color-bg-canvas: #faf9f6;
  --ws-color-bg-surface: #ffffff;
  --ws-color-bg-subtle: #f6f4ef;
  --ws-color-bg-muted: #efeee9;
  --ws-color-bg-brand: #566b5c;
  --ws-color-bg-brand-hover: #45584a;
  --ws-color-bg-brand-active: #35443a;
  --ws-color-bg-brand-subtle: #eef2ed;
  --ws-color-bg-recall-subtle: #e9ede7;

  --ws-color-fg-strong: #242622;
  --ws-color-fg-default: #343530;
  --ws-color-fg-secondary: #58564f;
  --ws-color-fg-tertiary: #716e67;
  --ws-color-fg-disabled: #aaa69d;
  --ws-color-fg-brand: #435648;
  --ws-color-fg-on-brand: #ffffff;
  --ws-color-fg-danger: #b42318;

  --ws-color-border-subtle: rgba(88,86,79,.12);
  --ws-color-border-default: rgba(88,86,79,.26);
  --ws-color-border-strong: rgba(88,86,79,.42);
  --ws-color-border-brand: #566b5c;
  --ws-color-border-focus: #566b5c;

  --ws-radius-control: 12px;
  --ws-radius-card: 16px;
  --ws-radius-sheet: 20px;
  --ws-radius-full: 9999px;

  --ws-icon-xs: 16px;
  --ws-icon-sm: 20px;
  --ws-icon-md: 24px;
  --ws-icon-lg: 32px;

  --ws-duration-fast: 150ms;
  --ws-duration-base: 200ms;
  --ws-easing-standard: cubic-bezier(.2,0,0,1);
}
```

### 16.1 Mapping requirements

- Figma `color/bg/brand`와 코드 `--ws-color-bg-brand`는 같은 값과 의미를 가진다.
- Token export에서 수동으로 이름을 재해석하지 않는다.
- Hard-coded color는 사진 scrim처럼 별도 근거가 있는 경우만 허용한다.
- Dark mode는 semantic alias 변경으로 구현하고 component별 색상을 복제하지 않는다.
- 변경 시 token snapshot 또는 generated artifact diff를 검토한다.

---

## 17. QA matrix

### 17.1 P0 release gate

- [ ] 활성 텍스트 대비 4.5:1 이상
- [ ] 아이콘·컨트롤 대비 3:1 이상
- [ ] Badge 6개 tone의 Background/Foreground pair 확인
- [ ] Checkbox SVG가 20px box 중앙에 위치
- [ ] Radio 10px indicator가 20px outer circle 중앙에 위치
- [ ] Switch ON/OFF knob의 상하 3px inset 유지
- [ ] Button/IconButton Default/Hover/Active/Focus/Disabled/Loading 확인
- [ ] Access Scope 전체 행 클릭 및 실제 권한 문구 대조
- [ ] Light/Dark token 전환 확인
- [ ] Figma Variable과 코드 token 값 비교

### 17.2 P1 quality gate

- [ ] Chip Selected와 Hover 구분
- [ ] SegmentedControl 선택 시 크기 변화 없음
- [ ] Avatar 이니셜 중앙 정렬과 대비 확인
- [ ] ParticipantGroup overlap/ring/+N 가독성 확인
- [ ] Card Hover/Selected 구분과 layout shift 없음
- [ ] Product Card의 제목·날짜·설명 위계 통일
- [ ] 375px에서 긴 문구와 Action 잘림 없음

### 17.3 Environment matrix

| Environment | Required checks |
|---|---|
| Mobile 375px | Touch target, safe area, text wrapping |
| Tablet 768px | Content max width, two-pane 조건 |
| Desktop 1280px | Sidebar, hover, keyboard |
| Light | 모든 semantic pair |
| Dark | 모든 semantic pair |
| Keyboard | Tab order, Enter/Space, arrow keys, Escape |
| Screen reader | Name, role, value/state |
| Reduced Motion | Switch, modal, skeleton, page transition |
| 200% zoom | Text clipping, horizontal overflow, action reachability |

### 17.4 Evidence

QA 완료 시 다음을 기록한다.

1. Figma component preview
2. 수정 전/후 screenshot
3. Contrast 측정 결과
4. Keyboard test 결과
5. Screen reader 확인 결과
6. Token diff
7. 미해결 이슈와 owner

---

## 18. Do / Don't

### Do

- 사진과 글이 시각적 주인공이 되게 한다.
- Archive Green을 핵심 행동과 선택에 제한한다.
- 공개 범위와 초대 상태를 행동 전에 설명한다.
- 상태를 색상과 형태·문구로 함께 전달한다.
- 컴포넌트 정렬은 실제 bounds와 optical center를 함께 확인한다.
- 프라이버시 행동의 결과를 구체적으로 설명한다.

### Don't

- Wanted의 파란색, 로고, 서체, 그라디언트를 우리사이 브랜드처럼 사용하지 않는다.
- 추억을 인기 경쟁형 소셜 피드처럼 표현하지 않는다.
- 사진 위에 브랜드 tint를 상시 적용하지 않는다.
- 그룹 멤버를 자동 열람 권한처럼 표현하지 않는다.
- Checkbox check를 텍스트 글리프로 구현하지 않는다.
- Radio border 두께로 내부 indicator를 대체하지 않는다.
- Switch knob를 baseline 또는 transform 보정에 의존해 배치하지 않는다.
- 그림자·그라디언트·Glassmorphism으로 위계를 대신하지 않는다.

---

## 19. Governance

- Major: token 삭제, 이름 변경, Component API breaking change
- Minor: 하위 호환 token/component/variant 추가
- Patch: 시각 오류, 접근성 오류, 문서 오류 수정
- 권한 관련 변경은 디자인 리뷰와 제품·서버 정책 검토를 함께 거친다.
- Color 변경은 Light/Dark, 대비, 사진 인접 상태, Status 충돌을 검증한다.
- Component 변경은 Anatomy, Variant, State, Accessibility, Responsive behavior를 함께 갱신한다.
- Deprecated token은 최소 한 Minor version 동안 alias와 migration note를 유지한다.

### 19.1 Change record

| Version | Date | Summary |
|---|---|---|
| 1.0 | 2026.11.10 | 브랜드·토큰·Core/Product component 체계 수립 |
| 1.1 | 2026.11.10 | 대비, Selection control 정렬, 상태 계약, Access Scope, Figma/Code QA 강화 |

### 19.2 출처와 독립성

이 시스템은 제공된 원티드 디자인 시스템의 구조와 운영 원칙을 참고했으며, 우리사이 PRD의 브랜드·제품·개인정보 요구사항을 우선해 독립적으로 구성했다. 원티드의 상표, 로고, 워드마크, 전용 서체, 채용 도메인 조립물은 우리사이 자산에 포함하지 않는다.

---

## 20. 완료 판정

이 문서는 Version 1.1의 **규격 확정본**이다. 실제 작업 완료는 다음 조건을 모두 충족한 뒤 선언한다.

- [ ] 브랜드 아이덴티티 유지
- [ ] P0 대비와 정렬 오류 해결
- [ ] 모든 필수 상태 구현
- [ ] Access Scope UI와 실제 권한 로직 일치
- [ ] Figma와 코드 token 일치
- [ ] Light/Dark 검증
- [ ] 375px/768px/1280px 검증
- [ ] Keyboard/Screen reader/Reduced Motion 검증
- [ ] 수정 전후 evidence 확보
- [ ] 미해결 문제와 후속 owner 명시

**WOORISAI Design System v1.1 — Content First · Quiet Archive · Warm but Clear**
