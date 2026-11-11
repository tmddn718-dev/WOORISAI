# 우리사이 WOORISAI Design System v1.1

A private, collaborative memory-archive app ("사진과 글이 주인공이 되는 조용한 공동 추억 기록 시스템"): shared memories, recall ("1년 전 오늘"), group meetings, invitations, settlement with privacy, and access scopes (나만 보기 · 모임 멤버 · 링크 공개).

Sources: Figma file "우리사이 WOORISAI — Design System v1.0.fig" (pages: Cover, Foundations, Icons, Core Components, Inputs & Selection, Navigation & Feedback, Product Components, Patterns & Examples).
 + v1.1 spec `uploads/WOORISAI_DESIGN_SYSTEM_V1.1_FINAL.md` (contrast, selection-control alignment, state contracts, Access Scope rules). Where they differ, v1.1 wins.

## v1.1 token contract
- `tokens/ws-tokens.css` — `--ws-color-*` semantic tokens (Light `:root`, Dark `[data-theme="dark"]` / `.dark`), `--ws-badge-<tone>-bg/fg/border` status pairs, `--ws-elevation-0…3`, `--ws-icon-xs…lg` (16/20/24/32), `--ws-duration-*`, `--ws-easing-standard/enter/exit`, radii. v1.0 `--color-*` aliases are re-pointed to the v1.1 values.
- `components/components.css` — state styles for every interactive component (hover / active / focus-visible / disabled / loading / selected); `prefers-reduced-motion` removes knob/indicator motion.
- Component tokens added for 3:1 non-text contrast (deviation from spec values, flagged): `--ws-control-border` #8C887F for Checkbox/Radio outlines and the Switch OFF track (spec's border-default ≈1.6:1); `--ws-control-disabled-fg` #8C887F for disabled button labels so they stay legible.

## Foundations
- **Color:** Archive Green (brand, `--archive-green-600` #566B5C), Warm Neutral, Soft Sage, plus info/success/warning/danger. Product UI uses semantic tokens (`--color-bg-*`, `--color-fg-*`, `--color-border-*`), with light (`:root`) and dark (`[data-theme="dark"]`, `.dark`) modes.
- **Type:** Pretendard for all product UI; NanumSquareRound ExtraBold for the wordmark only. The 16-step scale (Display/1–Caption/2) is in `tokens/semantic.css` as `--type-*`.
- **Radius:** micro 4 · small 8 · control 12 · card 16 · sheet 20 · full 9999. Spacing uses a 4pt grid.
- **Motion:** 100/150/200/280ms + switch 180ms; `cubic-bezier(.2,0,0,1)` standard. No bounce/overshoot.
- **Elevation:** cards have none; Toast/Dropdown = 2, Modal/Sheet = 3.

## Brand
The source file has no logo; the wordmark renders as "우리사이" set in NanumSquareRound ExtraBold.

## Components
- core: Avatar, Badge, Button, Card, IconButton, IconPlus, ParticipantGroup
- inputs: Checkbox, Radio, Switch, FilterChip, TextField, SegmentedControl
- navigation: Tab, SidebarItem, BottomNavigation, BottomNavigationItem, Toast, InlineMessage, Dialog, BottomSheet, EmptyState
- product: MemoryCard, RecallCard, InvitationCard, MeetingCard, SettlementPrivacyCard, AccessScopePanel
- icons: Icon (Calendar, Check, ChevronRight, Close, Heart, Home, Lock, MapPin, Memory, More, People, Plus, Profile, Search)

Note: the Figma "Style" variant axis is exposed as the `style2` prop (`style` is reserved for CSS).

## Known gaps
- Text fields keep the spec's `border-default` outline (below 3:1); the label and surface identify them.
- Bottom navigation uses colour + aria-current for the selected tab; the icon set has no filled/outline pairs.
- No warning/alert glyph in the icon set — Toast and InlineMessage use an 8px tone dot.
- "Pretendard Variable" (first in the v1.1 stack) is not shipped; static Pretendard 400–700 renders.

## Index
- `styles.css` — global entry (fonts + tokens)
- `fonts/` — Pretendard, NanumSquareRound EB woff2
- `tokens/` — fig-tokens.css (Figma Variables), semantic.css (type scale, motion, aliases)
- `components/` — React components + cards (`inputs/selection-states.card.html` = all Checkbox/Radio/Switch states, light & dark)
- `qa/` — before screenshots + `CHANGELOG-v1.1.md`
- `thumbnail.html` — project tile
