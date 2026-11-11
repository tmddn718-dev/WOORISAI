/* @ds-bundle: {"format":4,"namespace":"WOORISAIDesignSystem_e5e56b","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"IconPlus","sourcePath":"components/core/IconPlus.jsx"},{"name":"ParticipantGroup","sourcePath":"components/core/ParticipantGroup.jsx"},{"name":"Icon","sourcePath":"components/icons/Icon.jsx"},{"name":"Checkbox","sourcePath":"components/inputs/Checkbox.jsx"},{"name":"FilterChip","sourcePath":"components/inputs/FilterChip.jsx"},{"name":"Radio","sourcePath":"components/inputs/Radio.jsx"},{"name":"SegmentedControl","sourcePath":"components/inputs/SegmentedControl.jsx"},{"name":"Switch","sourcePath":"components/inputs/Switch.jsx"},{"name":"TextField","sourcePath":"components/inputs/TextField.jsx"},{"name":"BottomNavigation","sourcePath":"components/navigation/BottomNavigation.jsx"},{"name":"BottomNavigationItem","sourcePath":"components/navigation/BottomNavigationItem.jsx"},{"name":"BottomSheet","sourcePath":"components/navigation/BottomSheet.jsx"},{"name":"Dialog","sourcePath":"components/navigation/Dialog.jsx"},{"name":"EmptyState","sourcePath":"components/navigation/EmptyState.jsx"},{"name":"InlineMessage","sourcePath":"components/navigation/InlineMessage.jsx"},{"name":"SidebarItem","sourcePath":"components/navigation/SidebarItem.jsx"},{"name":"Tab","sourcePath":"components/navigation/Tab.jsx"},{"name":"Toast","sourcePath":"components/navigation/Toast.jsx"},{"name":"AccessScopePanel","sourcePath":"components/product/AccessScopePanel.jsx"},{"name":"InvitationCard","sourcePath":"components/product/InvitationCard.jsx"},{"name":"MeetingCard","sourcePath":"components/product/MeetingCard.jsx"},{"name":"MemoryCard","sourcePath":"components/product/MemoryCard.jsx"},{"name":"RecallCard","sourcePath":"components/product/RecallCard.jsx"},{"name":"SettlementPrivacyCard","sourcePath":"components/product/SettlementPrivacyCard.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"703527a27f50","components/core/Badge.jsx":"b1557b6eb3b9","components/core/Button.jsx":"037925d5f284","components/core/Card.jsx":"6a6593b6dca2","components/core/IconButton.jsx":"f33738c0f75b","components/core/IconPlus.jsx":"f07819c1319b","components/core/ParticipantGroup.jsx":"8b1c7882e4a3","components/icons/Icon.jsx":"8e96980d2cc3","components/icons/icon-data.js":"d8851c1a6824","components/inputs/Checkbox.jsx":"069e32234b2b","components/inputs/FilterChip.jsx":"cbeb17fa5aa3","components/inputs/Radio.jsx":"f1a6c9327df5","components/inputs/SegmentedControl.jsx":"b605f3386b5a","components/inputs/Switch.jsx":"a5b5743ffea3","components/inputs/TextField.jsx":"c12e64423c46","components/navigation/BottomNavigation.jsx":"1528a1939c99","components/navigation/BottomNavigationItem.jsx":"01286db0f79b","components/navigation/BottomSheet.jsx":"e1104baf1e5f","components/navigation/Dialog.jsx":"bbf65adac6f2","components/navigation/EmptyState.jsx":"aa637ea88bac","components/navigation/InlineMessage.jsx":"d2649ad65960","components/navigation/SidebarItem.jsx":"737da7c58ddb","components/navigation/Tab.jsx":"185ec569c750","components/navigation/Toast.jsx":"6675d2e08b38","components/product/AccessScopePanel.jsx":"35bbdb6b3537","components/product/InvitationCard.jsx":"2f6fec100454","components/product/MeetingCard.jsx":"8776de2bdb91","components/product/MemoryCard.jsx":"8976fea2ef00","components/product/RecallCard.jsx":"5da008f1583f","components/product/SettlementPrivacyCard.jsx":"7a1a3beef36f"},"inlinedExternals":[],"unexposedExports":[{"name":"accessScopeOptions","sourcePath":"components/product/AccessScopePanel.jsx"}]} */

(() => {

const __ds_ns = (window.WOORISAIDesignSystem_e5e56b = window.WOORISAIDesignSystem_e5e56b || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
const SIZES = {
  24: 10,
  32: 12,
  40: 14,
  48: 16
};
function Avatar({
  size = '40',
  name,
  text1,
  src,
  alt,
  ring,
  className,
  style
}) {
  const px = SIZES[Number(size)] ? Number(size) : 40;
  const [failed, setFailed] = React.useState(false);
  const initial = text1 ?? (name ? Array.from(name)[0] : '우');
  const showImg = src && !failed;
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    role: "img",
    "aria-label": alt ?? name ?? initial,
    style: {
      position: 'relative',
      display: 'inline-grid',
      placeItems: 'center',
      flex: 'none',
      width: px,
      height: px,
      borderRadius: '50%',
      overflow: 'hidden',
      boxSizing: 'border-box',
      background: 'var(--ws-color-bg-brand-subtle)',
      color: 'var(--ws-color-fg-brand)',
      boxShadow: ring ? '0 0 0 2px var(--ws-avatar-ring)' : 'inset 0 0 0 1px var(--ws-color-border-subtle)',
      fontFamily: 'var(--ws-font-product)',
      fontSize: SIZES[px],
      lineHeight: 1,
      fontWeight: 600,
      userSelect: 'none',
      ...style
    }
  }, showImg ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    onError: () => setFailed(true),
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'block',
      lineHeight: 1
    }
  }, initial));
}
Object.assign(__ds_scope, { Avatar, __ds_default_components_core_Avatar_4ed3sh: Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const CHECK = /*#__PURE__*/React.createElement("svg", {
  width: "14",
  height: "14",
  viewBox: "0 0 14 14",
  fill: "none",
  "aria-hidden": "true",
  style: {
    display: 'block'
  }
}, /*#__PURE__*/React.createElement("path", {
  d: "M3 7.2 5.8 10 11 4.5",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round"
}));

/** Base surface: white, 1px subtle border, 16px radius, 20px padding, no shadow. */
function Card({
  style2 = 'default',
  state = 'default',
  selected,
  interactive,
  onClick,
  text1,
  text2,
  children,
  padding = 20,
  className,
  style,
  ...rest
}) {
  const isSel = selected ?? style2 === 'selected';
  const isRecall = style2 === 'recall';
  const clickable = interactive ?? !!onClick;
  const title = text1 ?? (isRecall ? '그날의 우리' : '우리의 기록');
  const meta = text2 ?? '2026. 11. 10 · 함께한 순간';
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: 'ws-card' + (isRecall ? ' ws-card--recall' : '') + (className ? ' ' + className : ''),
    "data-selected": isSel ? 'true' : undefined,
    "data-interactive": clickable ? 'true' : undefined,
    "data-state": forced,
    role: clickable ? 'button' : undefined,
    tabIndex: clickable ? 0 : undefined,
    "aria-pressed": clickable && selected !== undefined ? String(isSel) : undefined,
    onClick: onClick,
    style: {
      width: 300,
      padding,
      ...style
    }
  }, rest), isSel && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      top: 16,
      right: 16,
      display: 'grid',
      placeItems: 'center',
      width: 20,
      height: 20,
      borderRadius: '50%',
      background: 'var(--ws-color-bg-brand)',
      color: 'var(--ws-color-fg-on-brand)'
    }
  }, CHECK), children ?? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      paddingRight: isSel ? 28 : 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-headline-1)',
      letterSpacing: '-.002em',
      color: 'var(--ws-color-fg-strong)'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label-1-read)',
      letterSpacing: '.014em',
      color: 'var(--ws-color-fg-secondary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, meta)));
}
Object.assign(__ds_scope, { Card, __ds_default_components_core_Card_pwdrbg: Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/ParticipantGroup.jsx
try { (() => {
const DEFAULT = ['정우', '서연', '민지', '우영', '하늘', '지안', '도윤'];

/** Overlapping avatars (32px, −8px, 2px surface ring), max 4 + "+N". Participants ≠ viewers. */
function ParticipantGroup({
  names = DEFAULT,
  max = 4,
  size = 32,
  label,
  className,
  style
}) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  const a11y = label ?? (names.length <= 2 ? names.join(', ') : names.slice(0, 2).join(', ') + ' 외 ' + (names.length - 2) + '명');
  return /*#__PURE__*/React.createElement("span", {
    role: "group",
    "aria-label": a11y,
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      paddingLeft: 2,
      ...style
    }
  }, shown.map((n, i) => /*#__PURE__*/React.createElement(__ds_scope.Avatar, {
    key: n + i,
    name: n,
    size: String(size),
    ring: true,
    style: {
      marginLeft: i ? -8 : 0,
      zIndex: shown.length - i + 1
    }
  })), rest > 0 && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'inline-grid',
      placeItems: 'center',
      flex: 'none',
      minWidth: 32,
      height: 32,
      padding: '0 6px',
      boxSizing: 'border-box',
      marginLeft: -8,
      borderRadius: 'var(--ws-radius-full)',
      background: 'var(--ws-color-bg-surface-muted)',
      color: 'var(--ws-color-fg-default)',
      boxShadow: '0 0 0 2px var(--ws-avatar-ring)',
      fontFamily: 'var(--ws-font-product)',
      fontSize: 12,
      lineHeight: 1,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums'
    }
  }, "+", rest));
}
Object.assign(__ds_scope, { ParticipantGroup, __ds_default_components_core_ParticipantGroup_1hat0hq: ParticipantGroup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/ParticipantGroup.jsx", error: String((e && e.message) || e) }); }

// components/icons/icon-data.js
try { (() => {
// Generated by fig_materialize (moduleFormat: 'icon-data') — 14 icon(s)
// Glyphs re-centred in the 24×24 box (outline bbox centre → 12,12).
let __ds_default_components_icons_icon_data_12stud1;
try {
  __ds_default_components_icons_icon_data_12stud1 = {
    "IconCalendar": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M 3 0 L 3 0.9 L 15 0.9 L 15 0 L 15 -0.9 L 3 -0.9 L 3 0 Z M 15 0 L 15 0.9 C 16.16 0.9 17.1 1.84 17.1 3 L 18 3 L 18.9 3 C 18.9 0.846 17.154 -0.9 15 -0.9 L 15 0 Z M 18 3 L 17.1 3 L 17.1 13 L 18 13 L 18.9 13 L 18.9 3 L 18 3 Z M 18 13 L 17.1 13 C 17.1 14.16 16.16 15.1 15 15.1 L 15 16 L 15 16.9 C 17.154 16.9 18.9 15.154 18.9 13 L 18 13 Z M 15 16 L 15 15.1 L 3 15.1 L 3 16 L 3 16.9 L 15 16.9 L 15 16 Z M 3 16 L 3 15.1 C 1.84 15.1 0.9 14.16 0.9 13 L 0 13 L -0.9 13 C -0.9 15.154 0.846 16.9 3 16.9 L 3 16 Z M 0 13 L 0.9 13 L 0.9 3 L 0 3 L -0.9 3 L -0.9 13 L 0 13 Z M 0 3 L 0.9 3 C 0.9 1.84 1.84 0.9 3 0.9 L 3 0 L 3 -0.9 C 0.846 -0.9 -0.9 0.846 -0.9 3 L 0 3 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 3 5)\"/><path d=\"M 5.9 0 C 5.9 -0.497 5.497 -0.9 5 -0.9 C 4.503 -0.9 4.1 -0.497 4.1 0 L 5 0 L 5.9 0 Z M 4.1 4 C 4.1 4.497 4.503 4.9 5 4.9 C 5.497 4.9 5.9 4.497 5.9 4 L 5 4 L 4.1 4 Z M 13.9 0 C 13.9 -0.497 13.497 -0.9 13 -0.9 C 12.503 -0.9 12.1 -0.497 12.1 0 L 13 0 L 13.9 0 Z M 12.1 4 C 12.1 4.497 12.503 4.9 13 4.9 C 13.497 4.9 13.9 4.497 13.9 4 L 13 4 L 12.1 4 Z M 0 6.1 C -0.497 6.1 -0.9 6.503 -0.9 7 C -0.9 7.497 -0.497 7.9 0 7.9 L 0 7 L 0 6.1 Z M 18 7.9 C 18.497 7.9 18.9 7.497 18.9 7 C 18.9 6.503 18.497 6.1 18 6.1 L 18 7 L 18 7.9 Z M 5 0 L 4.1 0 L 4.1 4 L 5 4 L 5.9 4 L 5.9 0 L 5 0 Z M 13 0 L 12.1 0 L 12.1 4 L 13 4 L 13.9 4 L 13.9 0 L 13 0 Z M 0 7 L 0 7.9 L 18 7.9 L 18 7 L 18 6.1 L 0 6.1 L 0 7 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 3 3)\"/>"
    },
    "IconCheck": {
      viewBox: "0 0 24 24",
      body: "<g transform=\"translate(0 1)\"><path d=\"M 0.636 5.364 C 0.285 5.012 -0.285 5.012 -0.636 5.364 C -0.988 5.715 -0.988 6.285 -0.636 6.636 L 0 6 L 0.636 5.364 Z M 4 10 L 3.364 10.636 C 3.715 10.988 4.285 10.988 4.636 10.636 L 4 10 Z M 14.636 0.636 C 14.988 0.285 14.988 -0.285 14.636 -0.636 C 14.285 -0.988 13.715 -0.988 13.364 -0.636 L 14 0 L 14.636 0.636 Z M 0 6 L -0.636 6.636 L 3.364 10.636 L 4 10 L 4.636 9.364 L 0.636 5.364 L 0 6 Z M 4 10 L 4.636 10.636 L 14.636 0.636 L 14 0 L 13.364 -0.636 L 3.364 9.364 L 4 10 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 5 6)\"/></g>"
    },
    "IconChevronRight": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M -0.636 11.364 C -0.988 11.715 -0.988 12.285 -0.636 12.636 C -0.285 12.988 0.285 12.988 0.636 12.636 L 0 12 L -0.636 11.364 Z M 6 6 L 6.636 6.636 C 6.988 6.285 6.988 5.715 6.636 5.364 L 6 6 Z M 0.636 -0.636 C 0.285 -0.988 -0.285 -0.988 -0.636 -0.636 C -0.988 -0.285 -0.988 0.285 -0.636 0.636 L 0 0 L 0.636 -0.636 Z M 0 12 L 0.636 12.636 L 6.636 6.636 L 6 6 L 5.364 5.364 L -0.636 11.364 L 0 12 Z M 6 6 L 6.636 5.364 L 0.636 -0.636 L 0 0 L -0.636 0.636 L 5.364 6.636 L 6 6 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 9 6)\"/>"
    },
    "IconClose": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M 0.636 -0.636 C 0.285 -0.988 -0.285 -0.988 -0.636 -0.636 C -0.988 -0.285 -0.988 0.285 -0.636 0.636 L 0 0 L 0.636 -0.636 Z M 11.364 12.636 C 11.715 12.988 12.285 12.988 12.636 12.636 C 12.988 12.285 12.988 11.715 12.636 11.364 L 12 12 L 11.364 12.636 Z M 12.636 0.636 C 12.988 0.285 12.988 -0.285 12.636 -0.636 C 12.285 -0.988 11.715 -0.988 11.364 -0.636 L 12 0 L 12.636 0.636 Z M -0.636 11.364 C -0.988 11.715 -0.988 12.285 -0.636 12.636 C -0.285 12.988 0.285 12.988 0.636 12.636 L 0 12 L -0.636 11.364 Z M 0 0 L -0.636 0.636 L 11.364 12.636 L 12 12 L 12.636 11.364 L 0.636 -0.636 L 0 0 Z M 12 0 L 11.364 -0.636 L -0.636 11.364 L 0 12 L 0.636 12.636 L 12.636 0.636 L 12 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 6 6)\"/>"
    },
    "IconHeart": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M 19.315 1.622 L 18.677 2.256 L 18.681 2.26 L 19.315 1.622 Z M 15.415 0 L 15.415 -0.9 L 15.415 0 Z M 11.515 1.622 L 10.877 0.987 C 10.868 0.997 10.859 1.007 10.849 1.016 L 11.515 1.622 Z M 10.515 2.722 L 9.879 3.358 C 10.053 3.532 10.291 3.627 10.537 3.622 C 10.783 3.616 11.016 3.509 11.181 3.327 L 10.515 2.722 Z M 9.415 1.622 L 8.779 2.258 L 8.779 2.258 L 9.415 1.622 Z M 5.515 0.006 L 5.515 -0.894 L 5.515 0.006 Z M 0 5.522 L -0.9 5.522 L 0 5.522 Z M 1.615 9.422 L 0.979 10.058 C 0.983 10.062 0.986 10.065 0.99 10.069 L 1.615 9.422 Z M 10.515 18.022 L 9.89 18.669 C 10.24 19.007 10.796 19.006 11.144 18.666 L 10.515 18.022 Z M 19.315 9.422 L 19.944 10.066 L 19.95 10.06 L 19.315 9.422 Z M 20.937 5.522 L 21.837 5.522 L 20.937 5.522 Z M 19.315 1.622 L 19.954 0.987 C 19.359 0.389 18.652 -0.085 17.873 -0.409 L 17.527 0.422 L 17.182 1.253 C 17.742 1.485 18.25 1.827 18.677 2.256 L 19.315 1.622 Z M 17.527 0.422 L 17.873 -0.409 C 17.094 -0.733 16.259 -0.9 15.415 -0.9 L 15.415 0 L 15.415 0.9 C 16.022 0.9 16.622 1.02 17.182 1.253 L 17.527 0.422 Z M 15.415 0 L 15.415 -0.9 C 14.572 -0.9 13.737 -0.733 12.958 -0.409 L 13.304 0.422 L 13.649 1.253 C 14.209 1.02 14.809 0.9 15.415 0.9 L 15.415 0 Z M 13.304 0.422 L 12.958 -0.409 C 12.179 -0.085 11.472 0.389 10.877 0.987 L 11.515 1.622 L 12.154 2.256 C 12.581 1.827 13.089 1.485 13.649 1.253 L 13.304 0.422 Z M 11.515 1.622 L 10.849 1.016 L 9.849 2.116 L 10.515 2.722 L 11.181 3.327 L 12.181 2.227 L 11.515 1.622 Z M 10.515 2.722 L 11.152 2.085 L 10.052 0.985 L 9.415 1.622 L 8.779 2.258 L 9.879 3.358 L 10.515 2.722 Z M 9.415 1.622 L 10.052 0.985 C 8.849 -0.218 7.217 -0.894 5.515 -0.894 L 5.515 0.006 L 5.515 0.906 C 6.74 0.906 7.913 1.393 8.779 2.258 L 9.415 1.622 Z M 5.515 0.006 L 5.515 -0.894 C 3.814 -0.894 2.182 -0.218 0.979 0.985 L 1.615 1.622 L 2.252 2.258 C 3.117 1.393 4.291 0.906 5.515 0.906 L 5.515 0.006 Z M 1.615 1.622 L 0.979 0.985 C -0.224 2.189 -0.9 3.82 -0.9 5.522 L 0 5.522 L 0.9 5.522 C 0.9 4.298 1.386 3.124 2.252 2.258 L 1.615 1.622 Z M 0 5.522 L -0.9 5.522 C -0.9 7.223 -0.224 8.855 0.979 10.058 L 1.615 9.422 L 2.252 8.785 C 1.386 7.92 0.9 6.746 0.9 5.522 L 0 5.522 Z M 1.615 9.422 L 0.99 10.069 L 9.89 18.669 L 10.515 18.022 L 11.141 17.375 L 2.241 8.775 L 1.615 9.422 Z M 10.515 18.022 L 11.144 18.666 L 19.944 10.066 L 19.315 9.422 L 18.686 8.778 L 9.886 17.378 L 10.515 18.022 Z M 19.315 9.422 L 19.95 10.06 C 20.548 9.465 21.023 8.758 21.347 7.979 L 20.516 7.634 L 19.685 7.288 C 19.452 7.848 19.111 8.356 18.681 8.784 L 19.315 9.422 Z M 20.516 7.634 L 21.347 7.979 C 21.671 7.201 21.837 6.365 21.837 5.522 L 20.937 5.522 L 20.037 5.522 C 20.037 6.128 19.917 6.728 19.685 7.288 L 20.516 7.634 Z M 20.937 5.522 L 21.837 5.522 C 21.837 4.678 21.671 3.843 21.347 3.064 L 20.516 3.41 L 19.685 3.756 C 19.917 4.315 20.037 4.916 20.037 5.522 L 20.937 5.522 Z M 20.516 3.41 L 21.347 3.064 C 21.023 2.286 20.548 1.578 19.95 0.984 L 19.315 1.622 L 18.681 2.26 C 19.111 2.688 19.452 3.196 19.685 3.756 L 20.516 3.41 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 1.485 2.978)\"/>"
    },
    "IconHome": {
      viewBox: "0 0 24 24",
      body: "<g transform=\"translate(0 0.54)\"><path d=\"M -0.598 7.327 C -0.969 7.658 -1.003 8.226 -0.673 8.598 C -0.342 8.969 0.226 9.003 0.598 8.673 L 0 8 L -0.598 7.327 Z M 9 0 L 9.598 -0.673 C 9.257 -0.976 8.743 -0.976 8.402 -0.673 L 9 0 Z M 17.402 8.673 C 17.774 9.003 18.342 8.969 18.673 8.598 C 19.003 8.226 18.969 7.658 18.598 7.327 L 18 8 L 17.402 8.673 Z M 0 8 L 0.598 8.673 L 9.598 0.673 L 9 0 L 8.402 -0.673 L -0.598 7.327 L 0 8 Z M 9 0 L 8.402 0.673 L 17.402 8.673 L 18 8 L 18.598 7.327 L 9.598 -0.673 L 9 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 3 3)\"/><path d=\"M 0.9 0 C 0.9 -0.497 0.497 -0.9 0 -0.9 C -0.497 -0.9 -0.9 -0.497 -0.9 0 L 0 0 L 0.9 0 Z M 0 10 L -0.9 10 C -0.9 10.497 -0.497 10.9 0 10.9 L 0 10 Z M 14 10 L 14 10.9 C 14.497 10.9 14.9 10.497 14.9 10 L 14 10 Z M 14.9 0 C 14.9 -0.497 14.497 -0.9 14 -0.9 C 13.503 -0.9 13.1 -0.497 13.1 0 L 14 0 L 14.9 0 Z M 3.1 10 C 3.1 10.497 3.503 10.9 4 10.9 C 4.497 10.9 4.9 10.497 4.9 10 L 4 10 L 3.1 10 Z M 4 4 L 4 3.1 C 3.503 3.1 3.1 3.503 3.1 4 L 4 4 Z M 10 4 L 10.9 4 C 10.9 3.503 10.497 3.1 10 3.1 L 10 4 Z M 9.1 10 C 9.1 10.497 9.503 10.9 10 10.9 C 10.497 10.9 10.9 10.497 10.9 10 L 10 10 L 9.1 10 Z M 0 0 L -0.9 0 L -0.9 10 L 0 10 L 0.9 10 L 0.9 0 L 0 0 Z M 0 10 L 0 10.9 L 14 10.9 L 14 10 L 14 9.1 L 0 9.1 L 0 10 Z M 14 10 L 14.9 10 L 14.9 0 L 14 0 L 13.1 0 L 13.1 10 L 14 10 Z M 4 10 L 4.9 10 L 4.9 4 L 4 4 L 3.1 4 L 3.1 10 L 4 10 Z M 4 4 L 4 4.9 L 10 4.9 L 10 4 L 10 3.1 L 4 3.1 L 4 4 Z M 10 4 L 9.1 4 L 9.1 10 L 10 10 L 10.9 10 L 10.9 4 L 10 4 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 5 10)\"/></g>"
    },
    "IconLock": {
      viewBox: "0 0 24 24",
      body: "<g transform=\"translate(0 0.5)\"><path d=\"M 2 0 L 2 0.9 L 12 0.9 L 12 0 L 12 -0.9 L 2 -0.9 L 2 0 Z M 12 0 L 12 0.9 C 12.608 0.9 13.1 1.392 13.1 2 L 14 2 L 14.9 2 C 14.9 0.398 13.602 -0.9 12 -0.9 L 12 0 Z M 14 2 L 13.1 2 L 13.1 8 L 14 8 L 14.9 8 L 14.9 2 L 14 2 Z M 14 8 L 13.1 8 C 13.1 8.608 12.608 9.1 12 9.1 L 12 10 L 12 10.9 C 13.602 10.9 14.9 9.602 14.9 8 L 14 8 Z M 12 10 L 12 9.1 L 2 9.1 L 2 10 L 2 10.9 L 12 10.9 L 12 10 Z M 2 10 L 2 9.1 C 1.392 9.1 0.9 8.608 0.9 8 L 0 8 L -0.9 8 C -0.9 9.602 0.398 10.9 2 10.9 L 2 10 Z M 0 8 L 0.9 8 L 0.9 2 L 0 2 L -0.9 2 L -0.9 8 L 0 8 Z M 0 2 L 0.9 2 C 0.9 1.392 1.392 0.9 2 0.9 L 2 0 L 2 -0.9 C 0.398 -0.9 -0.9 0.398 -0.9 2 L 0 2 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 5 10)\"/><path d=\"M -0.9 7 C -0.9 7.497 -0.497 7.9 0 7.9 C 0.497 7.9 0.9 7.497 0.9 7 L 0 7 L -0.9 7 Z M 4 0 L 4 -0.9 L 4 0 Z M 8 4 L 8.9 4 L 8 4 Z M 7.1 7 C 7.1 7.497 7.503 7.9 8 7.9 C 8.497 7.9 8.9 7.497 8.9 7 L 8 7 L 7.1 7 Z M 0 7 L 0.9 7 L 0.9 4 L 0 4 L -0.9 4 L -0.9 7 L 0 7 Z M 0 4 L 0.9 4 C 0.9 3.178 1.227 2.389 1.808 1.808 L 1.172 1.172 L 0.535 0.535 C -0.384 1.454 -0.9 2.7 -0.9 4 L 0 4 Z M 1.172 1.172 L 1.808 1.808 C 2.389 1.227 3.178 0.9 4 0.9 L 4 0 L 4 -0.9 C 2.7 -0.9 1.454 -0.384 0.535 0.535 L 1.172 1.172 Z M 4 0 L 4 0.9 C 4.822 0.9 5.611 1.227 6.192 1.808 L 6.828 1.172 L 7.465 0.535 C 6.546 -0.384 5.3 -0.9 4 -0.9 L 4 0 Z M 6.828 1.172 L 6.192 1.808 C 6.773 2.389 7.1 3.178 7.1 4 L 8 4 L 8.9 4 C 8.9 2.7 8.384 1.454 7.465 0.535 L 6.828 1.172 Z M 8 4 L 7.1 4 L 7.1 7 L 8 7 L 8.9 7 L 8.9 4 L 8 4 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 8 3)\"/></g>"
    },
    "IconMapPin": {
      viewBox: "0 0 24 24",
      body: "<g transform=\"translate(0 0.47)\"><path d=\"M 16 8 L 16.9 8 L 16 8 Z M 8 19 L 7.46 19.72 C 7.78 19.96 8.22 19.96 8.54 19.72 L 8 19 Z M 8 0 L 8 -0.9 L 8 0 Z M 16 8 L 15.1 8 C 15.1 9.021 14.686 10.171 13.976 11.369 C 13.271 12.558 12.319 13.723 11.345 14.758 C 10.373 15.79 9.399 16.674 8.665 17.3 C 8.3 17.613 7.995 17.86 7.784 18.028 C 7.678 18.112 7.596 18.176 7.54 18.219 C 7.513 18.24 7.492 18.256 7.478 18.266 C 7.472 18.271 7.467 18.275 7.464 18.277 C 7.462 18.279 7.461 18.279 7.46 18.28 C 7.46 18.28 7.46 18.28 7.46 18.28 C 7.46 18.28 7.46 18.28 7.46 18.28 C 7.46 18.28 7.46 18.28 8 19 C 8.54 19.72 8.54 19.72 8.54 19.72 C 8.54 19.72 8.541 19.719 8.541 19.719 C 8.541 19.719 8.542 19.719 8.543 19.718 C 8.544 19.717 8.546 19.716 8.548 19.714 C 8.553 19.71 8.559 19.706 8.568 19.699 C 8.584 19.686 8.608 19.668 8.639 19.644 C 8.701 19.596 8.791 19.527 8.904 19.437 C 9.13 19.257 9.45 18.997 9.835 18.669 C 10.601 18.014 11.627 17.085 12.655 15.992 C 13.681 14.902 14.729 13.63 15.524 12.287 C 16.314 10.954 16.9 9.479 16.9 8 L 16 8 Z M 8 19 C 8.54 18.28 8.54 18.28 8.54 18.28 C 8.54 18.28 8.54 18.28 8.54 18.28 C 8.54 18.28 8.54 18.28 8.54 18.28 C 8.539 18.279 8.538 18.279 8.536 18.277 C 8.533 18.275 8.528 18.271 8.522 18.266 C 8.508 18.256 8.487 18.24 8.46 18.219 C 8.404 18.176 8.322 18.112 8.216 18.028 C 8.005 17.86 7.7 17.613 7.335 17.3 C 6.601 16.674 5.627 15.79 4.655 14.758 C 3.681 13.723 2.729 12.558 2.024 11.369 C 1.314 10.171 0.9 9.021 0.9 8 L 0 8 L -0.9 8 C -0.9 9.479 -0.314 10.954 0.476 12.287 C 1.271 13.63 2.319 14.902 3.345 15.992 C 4.373 17.085 5.399 18.014 6.165 18.669 C 6.55 18.997 6.87 19.257 7.096 19.437 C 7.209 19.527 7.299 19.596 7.361 19.644 C 7.392 19.668 7.416 19.686 7.432 19.699 C 7.441 19.706 7.447 19.71 7.452 19.714 C 7.454 19.716 7.456 19.717 7.457 19.718 C 7.458 19.719 7.459 19.719 7.459 19.719 C 7.459 19.719 7.46 19.72 7.46 19.72 C 7.46 19.72 7.46 19.72 8 19 Z M 0 8 L 0.9 8 C 0.9 6.117 1.648 4.311 2.98 2.98 L 2.343 2.343 L 1.707 1.707 C 0.038 3.376 -0.9 5.64 -0.9 8 L 0 8 Z M 2.343 2.343 L 2.98 2.98 C 4.311 1.648 6.117 0.9 8 0.9 L 8 0 L 8 -0.9 C 5.64 -0.9 3.376 0.038 1.707 1.707 L 2.343 2.343 Z M 8 0 L 8 0.9 C 9.883 0.9 11.689 1.648 13.02 2.98 L 13.657 2.343 L 14.293 1.707 C 12.624 0.038 10.36 -0.9 8 -0.9 L 8 0 Z M 13.657 2.343 L 13.02 2.98 C 14.352 4.311 15.1 6.117 15.1 8 L 16 8 L 16.9 8 C 16.9 5.64 15.962 3.376 14.293 1.707 L 13.657 2.343 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 4 2)\"/><path d=\"M 5 2.5 L 4.1 2.5 C 4.1 3.384 3.384 4.1 2.5 4.1 L 2.5 5 L 2.5 5.9 C 4.378 5.9 5.9 4.378 5.9 2.5 L 5 2.5 Z M 2.5 5 L 2.5 4.1 C 1.616 4.1 0.9 3.384 0.9 2.5 L 0 2.5 L -0.9 2.5 C -0.9 4.378 0.622 5.9 2.5 5.9 L 2.5 5 Z M 0 2.5 L 0.9 2.5 C 0.9 1.616 1.616 0.9 2.5 0.9 L 2.5 0 L 2.5 -0.9 C 0.622 -0.9 -0.9 0.622 -0.9 2.5 L 0 2.5 Z M 2.5 0 L 2.5 0.9 C 3.384 0.9 4.1 1.616 4.1 2.5 L 5 2.5 L 5.9 2.5 C 5.9 0.622 4.378 -0.9 2.5 -0.9 L 2.5 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 9.500 7.500)\"/></g>"
    },
    "IconMemory": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M 4 0 L 4 0.9 L 14 0.9 L 14 0 L 14 -0.9 L 4 -0.9 L 4 0 Z M 14 0 L 14 0.9 C 15.712 0.9 17.1 2.288 17.1 4 L 18 4 L 18.9 4 C 18.9 1.294 16.706 -0.9 14 -0.9 L 14 0 Z M 18 4 L 17.1 4 L 17.1 14 L 18 14 L 18.9 14 L 18.9 4 L 18 4 Z M 18 14 L 17.1 14 C 17.1 15.712 15.712 17.1 14 17.1 L 14 18 L 14 18.9 C 16.706 18.9 18.9 16.706 18.9 14 L 18 14 Z M 14 18 L 14 17.1 L 4 17.1 L 4 18 L 4 18.9 L 14 18.9 L 14 18 Z M 4 18 L 4 17.1 C 2.288 17.1 0.9 15.712 0.9 14 L 0 14 L -0.9 14 C -0.9 16.706 1.294 18.9 4 18.9 L 4 18 Z M 0 14 L 0.9 14 L 0.9 4 L 0 4 L -0.9 4 L -0.9 14 L 0 14 Z M 0 4 L 0.9 4 C 0.9 2.288 2.288 0.9 4 0.9 L 4 0 L 4 -0.9 C 1.294 -0.9 -0.9 1.294 -0.9 4 L 0 4 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 3 3)\"/><path d=\"M 4 2 L 3.1 2 C 3.1 2.608 2.608 3.1 2 3.1 L 2 4 L 2 4.9 C 3.602 4.9 4.9 3.602 4.9 2 L 4 2 Z M 2 4 L 2 3.1 C 1.392 3.1 0.9 2.608 0.9 2 L 0 2 L -0.9 2 C -0.9 3.602 0.398 4.9 2 4.9 L 2 4 Z M 0 2 L 0.9 2 C 0.9 1.392 1.392 0.9 2 0.9 L 2 0 L 2 -0.9 C 0.398 -0.9 -0.9 0.398 -0.9 2 L 0 2 Z M 2 0 L 2 0.9 C 2.608 0.9 3.1 1.392 3.1 2 L 4 2 L 4.9 2 C 4.9 0.398 3.602 -0.9 2 -0.9 L 2 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 7 7)\"/><path d=\"M 15.364 5.636 C 15.715 5.988 16.285 5.988 16.636 5.636 C 16.988 5.285 16.988 4.715 16.636 4.364 L 16 5 L 15.364 5.636 Z M 11 0 L 11.636 -0.636 C 11.285 -0.988 10.715 -0.988 10.364 -0.636 L 11 0 Z M -0.636 10.364 C -0.988 10.715 -0.988 11.285 -0.636 11.636 C -0.285 11.988 0.285 11.988 0.636 11.636 L 0 11 L -0.636 10.364 Z M 16 5 L 16.636 4.364 L 11.636 -0.636 L 11 0 L 10.364 0.636 L 15.364 5.636 L 16 5 Z M 11 0 L 10.364 -0.636 L -0.636 10.364 L 0 11 L 0.636 11.636 L 11.636 0.636 L 11 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 5 10)\"/>"
    },
    "IconMore": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M 2 1 L 1.1 1 C 1.1 1.055 1.055 1.1 1 1.1 L 1 2 L 1 2.9 C 2.049 2.9 2.9 2.049 2.9 1 L 2 1 Z M 1 2 L 1 1.1 C 0.945 1.1 0.9 1.055 0.9 1 L 0 1 L -0.9 1 C -0.9 2.049 -0.049 2.9 1 2.9 L 1 2 Z M 0 1 L 0.9 1 C 0.9 0.945 0.945 0.9 1 0.9 L 1 0 L 1 -0.9 C -0.049 -0.9 -0.9 -0.049 -0.9 1 L 0 1 Z M 1 0 L 1 0.9 C 1.055 0.9 1.1 0.945 1.1 1 L 2 1 L 2.9 1 C 2.9 -0.049 2.049 -0.9 1 -0.9 L 1 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 4 11)\"/><path d=\"M 2 1 L 1.1 1 C 1.1 1.055 1.055 1.1 1 1.1 L 1 2 L 1 2.9 C 2.049 2.9 2.9 2.049 2.9 1 L 2 1 Z M 1 2 L 1 1.1 C 0.945 1.1 0.9 1.055 0.9 1 L 0 1 L -0.9 1 C -0.9 2.049 -0.049 2.9 1 2.9 L 1 2 Z M 0 1 L 0.9 1 C 0.9 0.945 0.945 0.9 1 0.9 L 1 0 L 1 -0.9 C -0.049 -0.9 -0.9 -0.049 -0.9 1 L 0 1 Z M 1 0 L 1 0.9 C 1.055 0.9 1.1 0.945 1.1 1 L 2 1 L 2.9 1 C 2.9 -0.049 2.049 -0.9 1 -0.9 L 1 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 11 11)\"/><path d=\"M 2 1 L 1.1 1 C 1.1 1.055 1.055 1.1 1 1.1 L 1 2 L 1 2.9 C 2.049 2.9 2.9 2.049 2.9 1 L 2 1 Z M 1 2 L 1 1.1 C 0.945 1.1 0.9 1.055 0.9 1 L 0 1 L -0.9 1 C -0.9 2.049 -0.049 2.9 1 2.9 L 1 2 Z M 0 1 L 0.9 1 C 0.9 0.945 0.945 0.9 1 0.9 L 1 0 L 1 -0.9 C -0.049 -0.9 -0.9 -0.049 -0.9 1 L 0 1 Z M 1 0 L 1 0.9 C 1.055 0.9 1.1 0.945 1.1 1 L 2 1 L 2.9 1 C 2.9 -0.049 2.049 -0.9 1 -0.9 L 1 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 18 11)\"/>"
    },
    "IconPeople": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M 13.1 6 C 13.1 6.497 13.503 6.9 14 6.9 C 14.497 6.9 14.9 6.497 14.9 6 L 14 6 L 13.1 6 Z M 14 4 L 14.9 4 L 14 4 Z M 10 0 L 10 -0.9 L 10 0 Z M 4 0 L 4 -0.9 L 4 0 Z M 0 4 L -0.9 4 L 0 4 Z M -0.9 6 C -0.9 6.497 -0.497 6.9 0 6.9 C 0.497 6.9 0.9 6.497 0.9 6 L 0 6 L -0.9 6 Z M 14 6 L 14.9 6 L 14.9 4 L 14 4 L 13.1 4 L 13.1 6 L 14 6 Z M 14 4 L 14.9 4 C 14.9 2.7 14.384 1.454 13.465 0.535 L 12.828 1.172 L 12.192 1.808 C 12.773 2.389 13.1 3.178 13.1 4 L 14 4 Z M 12.828 1.172 L 13.465 0.535 C 12.546 -0.384 11.3 -0.9 10 -0.9 L 10 0 L 10 0.9 C 10.822 0.9 11.611 1.227 12.192 1.808 L 12.828 1.172 Z M 10 0 L 10 -0.9 L 4 -0.9 L 4 0 L 4 0.9 L 10 0.9 L 10 0 Z M 4 0 L 4 -0.9 C 2.7 -0.9 1.454 -0.384 0.535 0.535 L 1.172 1.172 L 1.808 1.808 C 2.389 1.227 3.178 0.9 4 0.9 L 4 0 Z M 1.172 1.172 L 0.535 0.535 C -0.384 1.454 -0.9 2.7 -0.9 4 L 0 4 L 0.9 4 C 0.9 3.178 1.227 2.389 1.808 1.808 L 1.172 1.172 Z M 0 4 L -0.9 4 L -0.9 6 L 0 6 L 0.9 6 L 0.9 4 L 0 4 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 2 15)\"/><path d=\"M 8 4 L 7.1 4 C 7.1 5.712 5.712 7.1 4 7.1 L 4 8 L 4 8.9 C 6.706 8.9 8.9 6.706 8.9 4 L 8 4 Z M 4 8 L 4 7.1 C 2.288 7.1 0.9 5.712 0.9 4 L 0 4 L -0.9 4 C -0.9 6.706 1.294 8.9 4 8.9 L 4 8 Z M 0 4 L 0.9 4 C 0.9 2.288 2.288 0.9 4 0.9 L 4 0 L 4 -0.9 C 1.294 -0.9 -0.9 1.294 -0.9 4 L 0 4 Z M 4 0 L 4 0.9 C 5.712 0.9 7.1 2.288 7.1 4 L 8 4 L 8.9 4 C 8.9 1.294 6.706 -0.9 4 -0.9 L 4 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 5 3)\"/><path d=\"M 5.1 17.87 C 5.1 18.367 5.503 18.77 6 18.77 C 6.497 18.77 6.9 18.367 6.9 17.87 L 6 17.87 L 5.1 17.87 Z M 6 15.87 L 6.9 15.87 L 6.9 15.869 L 6 15.87 Z M 3.225 11.129 C 2.744 11.004 2.253 11.294 2.129 11.775 C 2.004 12.256 2.294 12.747 2.775 12.871 L 3 12 L 3.225 11.129 Z M 0.223 -0.872 C -0.258 -0.995 -0.749 -0.705 -0.872 -0.223 C -0.995 0.258 -0.705 0.749 -0.223 0.872 L 0 0 L 0.223 -0.872 Z M 3.008 3.875 L 3.908 3.875 L 3.008 3.875 Z M -0.223 6.878 C -0.705 7.001 -0.995 7.492 -0.872 7.973 C -0.749 8.455 -0.258 8.745 0.223 8.622 L 0 7.75 L -0.223 6.878 Z M 6 17.87 L 6.9 17.87 L 6.9 15.87 L 6 15.87 L 5.1 15.87 L 5.1 17.87 L 6 17.87 Z M 6 15.87 L 6.9 15.869 C 6.899 14.784 6.538 13.729 5.873 12.871 L 5.161 13.422 L 4.45 13.974 C 4.871 14.517 5.099 15.184 5.1 15.871 L 6 15.87 Z M 5.161 13.422 L 5.873 12.871 C 5.208 12.013 4.276 11.4 3.225 11.129 L 3 12 L 2.775 12.871 C 3.44 13.043 4.029 13.431 4.45 13.974 L 5.161 13.422 Z M 0 0 L -0.223 0.872 C 0.444 1.043 1.035 1.43 1.457 1.974 L 2.168 1.422 L 2.879 0.87 C 2.211 0.011 1.277 -0.602 0.223 -0.872 L 0 0 Z M 2.168 1.422 L 1.457 1.974 C 1.879 2.518 2.108 3.187 2.108 3.875 L 3.008 3.875 L 3.908 3.875 C 3.908 2.787 3.546 1.73 2.879 0.87 L 2.168 1.422 Z M 3.008 3.875 L 2.108 3.875 C 2.108 4.563 1.879 5.232 1.457 5.776 L 2.168 6.328 L 2.879 6.88 C 3.546 6.02 3.908 4.963 3.908 3.875 L 3.008 3.875 Z M 2.168 6.328 L 1.457 5.776 C 1.035 6.32 0.444 6.707 -0.223 6.878 L 0 7.75 L 0.223 8.622 C 1.277 8.352 2.211 7.739 2.879 6.88 L 2.168 6.328 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 16 3.130)\"/>"
    },
    "IconPlus": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M 7.9 0 C 7.9 -0.497 7.497 -0.9 7 -0.9 C 6.503 -0.9 6.1 -0.497 6.1 0 L 7 0 L 7.9 0 Z M 6.1 14 C 6.1 14.497 6.503 14.9 7 14.9 C 7.497 14.9 7.9 14.497 7.9 14 L 7 14 L 6.1 14 Z M 0 6.1 C -0.497 6.1 -0.9 6.503 -0.9 7 C -0.9 7.497 -0.497 7.9 0 7.9 L 0 7 L 0 6.1 Z M 14 7.9 C 14.497 7.9 14.9 7.497 14.9 7 C 14.9 6.503 14.497 6.1 14 6.1 L 14 7 L 14 7.9 Z M 7 0 L 6.1 0 L 6.1 14 L 7 14 L 7.9 14 L 7.9 0 L 7 0 Z M 0 7 L 0 7.9 L 14 7.9 L 14 7 L 14 6.1 L 0 6.1 L 0 7 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 5 5)\"/>"
    },
    "IconProfile": {
      viewBox: "0 0 24 24",
      body: "<g transform=\"translate(0 -0.5)\"><path d=\"M 8 4 L 7.1 4 C 7.1 5.712 5.712 7.1 4 7.1 L 4 8 L 4 8.9 C 6.706 8.9 8.9 6.706 8.9 4 L 8 4 Z M 4 8 L 4 7.1 C 2.288 7.1 0.9 5.712 0.9 4 L 0 4 L -0.9 4 C -0.9 6.706 1.294 8.9 4 8.9 L 4 8 Z M 0 4 L 0.9 4 C 0.9 2.288 2.288 0.9 4 0.9 L 4 0 L 4 -0.9 C 1.294 -0.9 -0.9 1.294 -0.9 4 L 0 4 Z M 4 0 L 4 0.9 C 5.712 0.9 7.1 2.288 7.1 4 L 8 4 L 8.9 4 C 8.9 1.294 6.706 -0.9 4 -0.9 L 4 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 8 4)\"/><path d=\"M -0.9 8 C -0.9 8.497 -0.497 8.9 0 8.9 C 0.497 8.9 0.9 8.497 0.9 8 L 0 8 L -0.9 8 Z M 8 0 L 8 -0.9 L 8 0 Z M 15.1 8 C 15.1 8.497 15.503 8.9 16 8.9 C 16.497 8.9 16.9 8.497 16.9 8 L 16 8 L 15.1 8 Z M 0 8 L 0.9 8 C 0.9 6.117 1.648 4.311 2.98 2.98 L 2.343 2.343 L 1.707 1.707 C 0.038 3.376 -0.9 5.64 -0.9 8 L 0 8 Z M 2.343 2.343 L 2.98 2.98 C 4.311 1.648 6.117 0.9 8 0.9 L 8 0 L 8 -0.9 C 5.64 -0.9 3.376 0.038 1.707 1.707 L 2.343 2.343 Z M 8 0 L 8 0.9 C 9.883 0.9 11.689 1.648 13.02 2.98 L 13.657 2.343 L 14.293 1.707 C 12.624 0.038 10.36 -0.9 8 -0.9 L 8 0 Z M 13.657 2.343 L 13.02 2.98 C 14.352 4.311 15.1 6.117 15.1 8 L 16 8 L 16.9 8 C 16.9 5.64 15.962 3.376 14.293 1.707 L 13.657 2.343 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 4 13)\"/></g>"
    },
    "IconSearch": {
      viewBox: "0 0 24 24",
      body: "<path d=\"M 14 7 L 13.1 7 C 13.1 10.369 10.369 13.1 7 13.1 L 7 14 L 7 14.9 C 11.363 14.9 14.9 11.363 14.9 7 L 14 7 Z M 7 14 L 7 13.1 C 3.631 13.1 0.9 10.369 0.9 7 L 0 7 L -0.9 7 C -0.9 11.363 2.637 14.9 7 14.9 L 7 14 Z M 0 7 L 0.9 7 C 0.9 3.631 3.631 0.9 7 0.9 L 7 0 L 7 -0.9 C 2.637 -0.9 -0.9 2.637 -0.9 7 L 0 7 Z M 7 0 L 7 0.9 C 10.369 0.9 13.1 3.631 13.1 7 L 14 7 L 14.9 7 C 14.9 2.637 11.363 -0.9 7 -0.9 L 7 0 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 4 4)\"/><path d=\"M 3.364 4.636 C 3.715 4.988 4.285 4.988 4.636 4.636 C 4.988 4.285 4.988 3.715 4.636 3.364 L 4 4 L 3.364 4.636 Z M 0.636 -0.636 C 0.285 -0.988 -0.285 -0.988 -0.636 -0.636 C -0.988 -0.285 -0.988 0.285 -0.636 0.636 L 0 0 L 0.636 -0.636 Z M 4 4 L 4.636 3.364 L 0.636 -0.636 L 0 0 L -0.636 0.636 L 3.364 4.636 L 4 4 Z\" fill=\"currentColor\" fill-rule=\"nonzero\" transform=\"matrix(1 0 0 1 16 16)\"/>"
    }
  };
} catch {}
Object.assign(__ds_scope, { __ds_default_components_icons_icon_data_12stud1 });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/icon-data.js", error: String((e && e.message) || e) }); }

__ds_scope.__ds_default_components_icons_icon_data_12stud1$1nb03e1 = __ds_scope.__ds_default_components_icons_icon_data_12stud1;

// components/icons/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Monochrome SVG icon; inherits currentColor. Sizes: 16 / 20 / 24 / 32 (--ws-icon-xs…lg). */
function Icon({
  name,
  size = 24,
  className,
  style,
  title,
  ...rest
}) {
  const d = __ds_scope.__ds_default_components_icons_icon_data_12stud1$1nb03e1[name] || __ds_scope.__ds_default_components_icons_icon_data_12stud1$1nb03e1['Icon' + name];
  if (!d) return null;
  const a11y = title ? {
    role: 'img',
    'aria-label': title
  } : {
    'aria-hidden': true,
    focusable: 'false'
  };
  return /*#__PURE__*/React.createElement("svg", _extends({
    width: size,
    height: size,
    viewBox: d.viewBox,
    fill: "none",
    className: 'ws-icon' + (className ? ' ' + className : ''),
    style: {
      color: 'currentColor',
      ...style
    }
  }, a11y, {
    dangerouslySetInnerHTML: {
      __html: d.body
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon, __ds_default_components_icons_Icon_fio49a: Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/icons/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
const TONES = ['neutral', 'brand', 'info', 'success', 'warning', 'danger'];

/** Non-interactive status label. Uses only the v1.1 status pairs (--ws-badge-<tone>-bg/fg/border). */
function Badge({
  label = '상태',
  children,
  tone = 'neutral',
  icon,
  className,
  style
}) {
  const t = TONES.includes(tone) ? tone : 'neutral';
  return /*#__PURE__*/React.createElement("span", {
    className: className,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      height: 24,
      boxSizing: 'border-box',
      padding: '0 10px',
      flex: 'none',
      borderRadius: 'var(--ws-radius-full)',
      border: '1px solid var(--ws-badge-' + t + '-border)',
      background: 'var(--ws-badge-' + t + '-bg)',
      color: 'var(--ws-badge-' + t + '-fg)',
      fontFamily: 'var(--ws-font-product)',
      fontSize: 12,
      lineHeight: '16px',
      fontWeight: 600,
      letterSpacing: '.025em',
      whiteSpace: 'nowrap',
      ...style
    }
  }, icon && (typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16,
    style: {
      marginLeft: -2
    }
  }) : icon), children ?? label);
}
Object.assign(__ds_scope, { Badge, __ds_default_components_core_Badge_2ajn45: Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const VARIANTS = {
  primary: 1,
  secondary: 1,
  tertiary: 1,
  ghost: 1,
  'neutral-ghost': 1,
  danger: 1
};
function Button({
  label = '기억 남기기',
  children,
  style2 = 'primary',
  size = 'md',
  state = 'default',
  icon,
  iconPosition = 'leading',
  loading,
  disabled,
  fullWidth,
  type = 'button',
  onClick,
  className,
  style,
  ...rest
}) {
  const v = VARIANTS[style2] ? style2 : 'primary';
  const isDisabled = disabled || state === 'disabled';
  const isLoading = loading || state === 'loading';
  const forced = ['hover', 'active', 'focus'].includes(state) ? state : undefined;
  const ico = icon ? typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  }) : icon : null;
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: 'ws-btn ws-focus ws-btn--' + size + ' ws-btn--' + v + (className ? ' ' + className : ''),
    "data-state": forced,
    disabled: isDisabled,
    "aria-busy": isLoading ? 'true' : undefined,
    onClick: isLoading || isDisabled ? undefined : onClick,
    style: {
      width: fullWidth ? '100%' : undefined,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    className: "ws-btn__label"
  }, iconPosition === 'leading' && ico, children ?? label, iconPosition === 'trailing' && ico), isLoading && /*#__PURE__*/React.createElement("span", {
    className: "ws-btn__spinner",
    "aria-hidden": "true"
  }));
}
Object.assign(__ds_scope, { Button, __ds_default_components_core_Button_51d4zy: Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  icon = 'IconPlus',
  icon1,
  label = '추가',
  style2 = 'ghost',
  state = 'default',
  size = 44,
  shape = 'control',
  selected,
  disabled,
  onClick,
  className,
  style,
  ...rest
}) {
  const v = ['ghost', 'outline', 'filled'].includes(style2) ? style2 : 'ghost';
  const px = String(size) === '40' ? 40 : 44;
  const iconPx = px === 40 ? 20 : 24;
  const isDisabled = disabled || state === 'disabled';
  const isSelected = selected || state === 'selected';
  const forced = ['hover', 'active', 'focus'].includes(state) ? state : undefined;
  const glyph = icon1 ?? (typeof icon === 'string' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: iconPx
  }) : icon);
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label,
    title: label,
    "aria-pressed": selected !== undefined || state === 'selected' ? String(!!isSelected) : undefined,
    disabled: isDisabled,
    "data-state": forced,
    onClick: onClick,
    className: 'ws-iconbtn ws-focus ws-iconbtn--' + px + ' ws-iconbtn--' + v + ' ws-iconbtn--r-' + (shape === 'full' ? 'full' : 'control') + (className ? ' ' + className : ''),
    style: style
  }, rest), glyph);
}
Object.assign(__ds_scope, { IconButton, __ds_default_components_core_IconButton_p7lntj: IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/IconPlus.jsx
try { (() => {
/** Figma "Icon/Plus" glyph — 24px, currentColor. Prefer <Icon name="IconPlus" />. */
function IconPlus({
  className,
  style,
  size = 24
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "IconPlus",
    size: size,
    className: className,
    style: style
  });
}
Object.assign(__ds_scope, { IconPlus, __ds_default_components_core_IconPlus_gxaj7j: IconPlus });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconPlus.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Checkbox.jsx
try { (() => {
/** 20×20 box (radius 6) centred in a 44×44 hit area; 14px SVG check centred by grid. */
function Checkbox({
  checked,
  selected,
  defaultChecked,
  indeterminate,
  onChange,
  state = 'default',
  disabled,
  text1 = '함께 기록하기',
  text2,
  label,
  description,
  name,
  value,
  id,
  className,
  style
}) {
  const [inner, setInner] = React.useState(!!(checked ?? selected ?? defaultChecked));
  const isOn = checked ?? selected ?? inner;
  const isDisabled = disabled || state === 'disabled';
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  const handle = e => {
    if (checked === undefined && selected === undefined) setInner(e.target.checked);
    onChange && onChange(e.target.checked, e);
  };
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = !!indeterminate;
  }, [indeterminate]);
  const txt = label ?? text1;
  const desc = description ?? text2;
  return /*#__PURE__*/React.createElement("label", {
    className: 'ws-sel' + (className ? ' ' + className : ''),
    "data-disabled": isDisabled ? 'true' : undefined,
    "data-state": forced,
    style: {
      alignItems: desc ? 'flex-start' : 'center',
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    ref: ref,
    type: "checkbox",
    className: "ws-sr",
    id: id,
    name: name,
    value: value,
    checked: isOn,
    disabled: isDisabled,
    onChange: handle,
    "aria-checked": indeterminate ? 'mixed' : undefined
  }), /*#__PURE__*/React.createElement("span", {
    className: "ws-cb",
    style: desc ? {
      marginTop: 12
    } : undefined
  }, /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 14 14",
    fill: "none",
    "aria-hidden": "true"
  }, indeterminate ? /*#__PURE__*/React.createElement("path", {
    d: "M3.5 7h7",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  }) : /*#__PURE__*/React.createElement("path", {
    d: "M3 7.2 5.8 10 11 4.5",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))), (txt || desc) && /*#__PURE__*/React.createElement("span", {
    className: "ws-sel__text",
    style: desc ? {
      padding: '12px 0'
    } : undefined
  }, txt && /*#__PURE__*/React.createElement("span", null, txt), desc && /*#__PURE__*/React.createElement("span", {
    className: "ws-sel__desc"
  }, desc)));
}
Object.assign(__ds_scope, { Checkbox, __ds_default_components_inputs_Checkbox_h0zm1f: Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/inputs/FilterChip.jsx
try { (() => {
/** 36px filter chip. Selected = brand-subtle + brand border + leading check (not colour alone). */
function FilterChip({
  label,
  text1,
  selected,
  defaultSelected,
  onChange,
  state = 'default',
  disabled,
  className,
  style
}) {
  const [inner, setInner] = React.useState(!!(selected ?? defaultSelected));
  const isSel = selected ?? inner;
  const isDisabled = disabled || state === 'disabled';
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  const toggle = () => {
    if (selected === undefined) setInner(!isSel);
    onChange && onChange(!isSel);
  };
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'ws-chip ws-focus' + (className ? ' ' + className : ''),
    "aria-pressed": isSel ? 'true' : 'false',
    disabled: isDisabled,
    "data-state": forced,
    onClick: toggle,
    style: style
  }, isSel && /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 16 16",
    fill: "none",
    "aria-hidden": "true",
    style: {
      display: 'block',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M3.5 8.2 6.5 11.2 12.5 5",
    stroke: "currentColor",
    strokeWidth: "1.75",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), label ?? text1 ?? '사진');
}
Object.assign(__ds_scope, { FilterChip, __ds_default_components_inputs_FilterChip_5jh59y: FilterChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/FilterChip.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Radio.jsx
try { (() => {
/** 20px outer circle with a real 10px indicator, both grid-centred; 44×44 hit area. */
function Radio({
  checked,
  selected,
  defaultChecked,
  onChange,
  state = 'default',
  disabled,
  text1 = '선택 항목',
  label,
  description,
  name,
  value,
  id,
  className,
  style
}) {
  const [inner, setInner] = React.useState(!!(checked ?? selected ?? defaultChecked));
  const isOn = checked ?? selected ?? inner;
  const isDisabled = disabled || state === 'disabled';
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  const handle = e => {
    if (checked === undefined && selected === undefined) setInner(e.target.checked);
    onChange && onChange(e.target.checked, e);
  };
  const txt = label ?? text1;
  return /*#__PURE__*/React.createElement("label", {
    className: 'ws-sel' + (className ? ' ' + className : ''),
    "data-disabled": isDisabled ? 'true' : undefined,
    "data-state": forced,
    style: style
  }, /*#__PURE__*/React.createElement("input", {
    type: "radio",
    className: "ws-sr",
    id: id,
    name: name,
    value: value,
    checked: isOn,
    disabled: isDisabled,
    onChange: handle
  }), /*#__PURE__*/React.createElement("span", {
    className: "ws-radio"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ws-radio__dot"
  })), (txt || description) && /*#__PURE__*/React.createElement("span", {
    className: "ws-sel__text"
  }, txt && /*#__PURE__*/React.createElement("span", null, txt), description && /*#__PURE__*/React.createElement("span", {
    className: "ws-sel__desc"
  }, description)));
}
Object.assign(__ds_scope, { Radio, __ds_default_components_inputs_Radio_1xofujf: Radio });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Radio.jsx", error: String((e && e.message) || e) }); }

// components/inputs/SegmentedControl.jsx
try { (() => {
/** Equal-width segments on a surface-muted track (4px inset). Arrow keys move selection; one tab stop. */
function SegmentedControl({
  options,
  text1 = '최신순',
  text2 = '오래된순',
  value,
  defaultValue,
  onChange,
  label = '정렬',
  className,
  style
}) {
  const opts = (options ?? [text1, text2]).map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  const [inner, setInner] = React.useState(defaultValue ?? opts[0]?.value);
  const cur = value ?? inner;
  const refs = React.useRef([]);
  const pick = v => {
    if (value === undefined) setInner(v);
    onChange && onChange(v);
  };
  const onKey = (e, i) => {
    const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const n = (i + d + opts.length) % opts.length;
    pick(opts[n].value);
    refs.current[n] && refs.current[n].focus();
  };
  return /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    "aria-label": label,
    className: 'ws-seg' + (className ? ' ' + className : ''),
    style: style
  }, opts.map((o, i) => {
    const on = o.value === cur;
    return /*#__PURE__*/React.createElement("button", {
      key: o.value,
      ref: el => refs.current[i] = el,
      type: "button",
      role: "radio",
      "aria-checked": on ? 'true' : 'false',
      tabIndex: on ? 0 : -1,
      className: "ws-seg__item ws-focus",
      onClick: () => pick(o.value),
      onKeyDown: e => onKey(e, i)
    }, o.label);
  }));
}
Object.assign(__ds_scope, { SegmentedControl, __ds_default_components_inputs_SegmentedControl_4lddzd: SegmentedControl });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/SegmentedControl.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Switch.jsx
try { (() => {
/** 44×26 track, 20px knob at 3px inset; X 3px (off) → 21px (on), 180ms standard. For instantly-applied settings. */
function Switch({
  checked,
  selected,
  defaultChecked,
  onChange,
  state = 'default',
  disabled,
  text1 = '추억 알림',
  label,
  description,
  labelPosition = 'end',
  id,
  name,
  className,
  style
}) {
  const [inner, setInner] = React.useState(!!(checked ?? selected ?? defaultChecked));
  const isOn = checked ?? selected ?? inner;
  const isDisabled = disabled || state === 'disabled';
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  const handle = e => {
    if (checked === undefined && selected === undefined) setInner(e.target.checked);
    onChange && onChange(e.target.checked, e);
  };
  const txt = label ?? text1;
  const text = (txt || description) && /*#__PURE__*/React.createElement("span", {
    className: "ws-sel__text",
    style: labelPosition === 'start' ? {
      flex: 1
    } : undefined
  }, txt && /*#__PURE__*/React.createElement("span", null, txt), description && /*#__PURE__*/React.createElement("span", {
    className: "ws-sel__desc"
  }, description));
  return /*#__PURE__*/React.createElement("label", {
    className: 'ws-sel' + (className ? ' ' + className : ''),
    "data-disabled": isDisabled ? 'true' : undefined,
    "data-state": forced,
    style: style
  }, labelPosition === 'start' && text, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    role: "switch",
    className: "ws-sr",
    id: id,
    name: name,
    checked: isOn,
    "aria-checked": isOn ? 'true' : 'false',
    disabled: isDisabled,
    onChange: handle
  }), /*#__PURE__*/React.createElement("span", {
    className: "ws-switch",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("span", {
    className: "ws-switch__knob"
  })), labelPosition !== 'start' && text);
}
Object.assign(__ds_scope, { Switch, __ds_default_components_inputs_Switch_rhvcou: Switch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Switch.jsx", error: String((e && e.message) || e) }); }

// components/inputs/TextField.jsx
try { (() => {
/** 48px field, 12px radius. Label, helper and error are programmatically linked to the input. */
function TextField({
  state = 'default',
  text1 = '모임 이름',
  text2 = '예: 가을 소풍',
  text3,
  label,
  placeholder,
  helper,
  error,
  value,
  defaultValue,
  onChange,
  multiline,
  disabled,
  id,
  name,
  className,
  style
}) {
  const autoId = React.useId ? React.useId() : 'tf';
  const fid = id ?? 'ws-tf-' + autoId.replace(/[:]/g, '');
  const isError = state === 'error' || !!error;
  const isDisabled = disabled || state === 'disabled';
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  const msg = error ?? (state === 'error' ? text3 ?? '모임 이름을 입력해 주세요.' : helper ?? text3);
  const Tag = multiline ? 'textarea' : 'input';
  return /*#__PURE__*/React.createElement("div", {
    className: 'ws-field' + (className ? ' ' + className : ''),
    style: {
      width: 280,
      ...style
    }
  }, /*#__PURE__*/React.createElement("label", {
    htmlFor: fid,
    className: "ws-field__label"
  }, label ?? text1), /*#__PURE__*/React.createElement(Tag, {
    id: fid,
    name: name,
    className: "ws-field__input",
    "data-state": forced,
    placeholder: placeholder ?? text2,
    value: value,
    defaultValue: defaultValue,
    onChange: onChange,
    disabled: isDisabled,
    "aria-invalid": isError ? 'true' : undefined,
    "aria-describedby": msg ? fid + '-help' : undefined
  }), msg && /*#__PURE__*/React.createElement("div", {
    id: fid + '-help',
    className: "ws-field__help",
    "data-error": isError ? 'true' : undefined,
    role: isError ? 'alert' : undefined
  }, msg));
}
Object.assign(__ds_scope, { TextField, __ds_default_components_inputs_TextField_1g8jpmd: TextField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/TextField.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNavigationItem.jsx
try { (() => {
/** One mobile tab: 24px icon + 11px label. Selected = fg-brand + aria-current. */
function BottomNavigationItem({
  label = '기억',
  icon = 'IconMemory',
  selected,
  onClick,
  className,
  style
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'ws-bnav__item ws-focus' + (className ? ' ' + className : ''),
    "aria-current": selected ? 'page' : undefined,
    onClick: onClick,
    style: {
      minHeight: 56,
      padding: '0 12px',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "ws-bnav__icon"
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 24
  })), /*#__PURE__*/React.createElement("span", null, label));
}
Object.assign(__ds_scope, { BottomNavigationItem, __ds_default_components_navigation_BottomNavigationItem_1luaw4t: BottomNavigationItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNavigationItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomNavigation.jsx
try { (() => {
const TABS = [{
  key: 'home',
  label: '홈',
  icon: 'IconHome'
}, {
  key: 'meet',
  label: '약속',
  icon: 'IconCalendar'
}, {
  key: 'create',
  label: '만들기',
  icon: 'IconPlus'
}, {
  key: 'memory',
  label: '추억',
  icon: 'IconMemory'
}, {
  key: 'me',
  label: '나의',
  icon: 'IconProfile'
}];

/** Mobile bottom tabs: 56px + safe area, 5 tabs (홈 / 약속 / 만들기 / 추억 / 나의). */
function BottomNavigation({
  items = TABS,
  value,
  defaultValue = 'home',
  onChange,
  className,
  style
}) {
  const [inner, setInner] = React.useState(defaultValue);
  const cur = value ?? inner;
  return /*#__PURE__*/React.createElement("nav", {
    "aria-label": "\uC8FC\uC694 \uBA54\uB274",
    className: 'ws-bnav' + (className ? ' ' + className : ''),
    style: {
      width: 375,
      ...style
    }
  }, items.map(t => /*#__PURE__*/React.createElement(__ds_scope.BottomNavigationItem, {
    key: t.key,
    label: t.label,
    icon: t.icon,
    selected: t.key === cur,
    onClick: () => {
      if (value === undefined) setInner(t.key);
      onChange && onChange(t.key);
    }
  })));
}
Object.assign(__ds_scope, { BottomNavigation, __ds_default_components_navigation_BottomNavigation_1b8y84e: BottomNavigation });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomNavigation.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Dialog.jsx
try { (() => {
/** Modal: max 400px, radius 20, padding 24, elevation 3. Destructive action last, result stated concretely. */
function Dialog({
  title = '기억을 삭제할까요?',
  text1,
  body = '이 기억과 사진, 댓글이 모두 삭제되고 다시 복구할 수 없어요.',
  text2,
  cancelLabel = '취소',
  confirmLabel = '기억 삭제',
  tone = 'danger',
  onCancel,
  onConfirm,
  className,
  style
}) {
  const tid = 'ws-dlg-title';
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": tid,
    className: className,
    style: {
      width: 400,
      maxWidth: '100%',
      boxSizing: 'border-box',
      padding: 24,
      borderRadius: 'var(--ws-radius-sheet)',
      background: 'var(--ws-color-bg-elevated)',
      boxShadow: 'var(--ws-elevation-3)',
      fontFamily: 'var(--ws-font-product)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("h2", {
    id: tid,
    style: {
      margin: 0,
      font: 'var(--type-title-3)',
      letterSpacing: '-.023em',
      color: 'var(--ws-color-fg-strong)'
    }
  }, text1 ?? title), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: '8px 0 24px',
      font: 'var(--type-body-2-read)',
      letterSpacing: '.01em',
      color: 'var(--ws-color-fg-secondary)'
    }
  }, text2 ?? body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    style2: "secondary",
    label: cancelLabel,
    onClick: onCancel
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    style2: tone === 'danger' ? 'danger' : 'primary',
    label: confirmLabel,
    onClick: onConfirm
  })));
}
Object.assign(__ds_scope, { Dialog, __ds_default_components_navigation_Dialog_1tsixft: Dialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Dialog.jsx", error: String((e && e.message) || e) }); }

// components/navigation/EmptyState.jsx
try { (() => {
/** Empty state: 48px icon, headline-2 title, label-1-read body, one optional action. Never blames the user. */
function EmptyState({
  icon = 'IconMemory',
  title = '아직 남긴 기억이 없어요',
  text1,
  body = '함께한 첫 순간을 기록해 보세요.',
  text2,
  actionLabel = '기억 남기기',
  onAction,
  className,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      width: 320,
      maxWidth: '100%',
      boxSizing: 'border-box',
      padding: '32px 20px',
      fontFamily: 'var(--ws-font-product)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'grid',
      placeItems: 'center',
      width: 72,
      height: 72,
      marginBottom: 16,
      borderRadius: '50%',
      background: 'var(--ws-color-bg-recall-subtle)',
      color: 'var(--ws-color-fg-brand)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 48
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-headline-2)',
      color: 'var(--ws-color-fg-strong)'
    }
  }, text1 ?? title), /*#__PURE__*/React.createElement("div", {
    style: {
      margin: '4px 0 20px',
      font: 'var(--type-label-1-read)',
      letterSpacing: '.014em',
      color: 'var(--ws-color-fg-secondary)'
    }
  }, text2 ?? body), actionLabel && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    label: actionLabel,
    onClick: onAction,
    icon: "IconPlus"
  }));
}
Object.assign(__ds_scope, { EmptyState, __ds_default_components_navigation_EmptyState_16owh55: EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/navigation/InlineMessage.jsx
try { (() => {
const TITLE = {
  info: '알아두세요',
  success: '완료됐어요',
  warning: '확인해 주세요',
  danger: '문제가 발생했어요'
};

/** Persistent in-context message for errors, permissions and settlement warnings. Status bg + border pair. */
function InlineMessage({
  tone = 'info',
  text1,
  text2 = '관계와 기록의 공개 범위를 다시 확인할 수 있어요.',
  children,
  className,
  style
}) {
  const t = TITLE[tone] ? tone : 'info';
  return /*#__PURE__*/React.createElement("div", {
    role: t === 'danger' ? 'alert' : 'note',
    className: className,
    style: {
      display: 'grid',
      gridTemplateColumns: '8px minmax(0,1fr)',
      columnGap: 10,
      width: 420,
      maxWidth: '100%',
      boxSizing: 'border-box',
      padding: '14px 16px',
      borderRadius: 'var(--ws-radius-control)',
      border: '1px solid var(--ws-color-border-' + t + ')',
      background: 'var(--ws-color-status-bg-' + t + ')',
      fontFamily: 'var(--ws-font-product)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      width: 8,
      height: 8,
      marginTop: 6,
      borderRadius: '50%',
      background: 'var(--ws-color-fg-' + t + ')'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: '20px',
      fontWeight: 600,
      letterSpacing: '.014em',
      color: 'var(--ws-color-fg-' + t + ')'
    }
  }, text1 ?? TITLE[t]), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 14,
      lineHeight: '22px',
      fontWeight: 500,
      letterSpacing: '.014em',
      color: 'var(--ws-color-fg-default)'
    }
  }, children ?? text2)));
}
Object.assign(__ds_scope, { InlineMessage, __ds_default_components_navigation_InlineMessage_md6bkt: InlineMessage });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/InlineMessage.jsx", error: String((e && e.message) || e) }); }

// components/navigation/SidebarItem.jsx
try { (() => {
/** Desktop sidebar row: 44px min, 12px radius. Selected = brand-subtle + fg-brand + aria-current. */
function SidebarItem({
  selected,
  text1 = '우리의 기억',
  label,
  icon = 'IconMemory',
  state = 'default',
  href,
  onClick,
  className,
  style
}) {
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  const Tag = href ? 'a' : 'button';
  return /*#__PURE__*/React.createElement(Tag, {
    href: href,
    type: href ? undefined : 'button',
    "aria-current": selected ? 'page' : undefined,
    onClick: onClick,
    className: 'ws-navitem ws-focus' + (className ? ' ' + className : ''),
    "data-state": forced,
    style: {
      width: 216,
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  }), /*#__PURE__*/React.createElement("span", null, label ?? text1));
}
Object.assign(__ds_scope, { SidebarItem, __ds_default_components_navigation_SidebarItem_1x073ia: SidebarItem });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/SidebarItem.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tab.jsx
try { (() => {
/** 44px tab with a 2px brand indicator that never shifts layout. Use inside role="tablist". */
function Tab({
  selected,
  text1 = '우리의 기억',
  label,
  state = 'default',
  onClick,
  id,
  controls,
  className,
  style
}) {
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    role: "tab",
    id: id,
    "aria-controls": controls,
    "aria-selected": selected ? 'true' : 'false',
    tabIndex: selected ? 0 : -1,
    className: 'ws-tab ws-focus' + (className ? ' ' + className : ''),
    "data-state": forced,
    onClick: onClick,
    style: style
  }, label ?? text1);
}
Object.assign(__ds_scope, { Tab, __ds_default_components_navigation_Tab_189qsk0: Tab });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tab.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Toast.jsx
try { (() => {
const COPY = {
  neutral: '링크를 복사했어요.',
  success: '기억이 안전하게 저장됐어요.',
  warning: '확인이 필요한 항목이 있어요.',
  danger: '저장하지 못했어요. 다시 시도해 주세요.'
};

/** Inverse surface, radius 12, elevation 2. Tone shown by a leading mark, text stays inverse for contrast. */
function Toast({
  tone = 'neutral',
  text1,
  children,
  actionLabel,
  onAction,
  className,
  style
}) {
  const t = COPY[tone] ? tone : 'neutral';
  const mark = t === 'success' ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "IconCheck",
    size: 20,
    style: {
      color: 'var(--ws-toast-icon-success)'
    }
  }) : t === 'neutral' ? null : /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      display: 'block',
      flex: 'none',
      width: 8,
      height: 8,
      margin: '0 6px',
      borderRadius: '50%',
      background: 'var(--ws-toast-icon-' + t + ')'
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    role: t === 'danger' ? 'alert' : 'status',
    "aria-live": t === 'danger' ? 'assertive' : 'polite',
    className: className,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      width: 360,
      maxWidth: '100%',
      minHeight: 48,
      boxSizing: 'border-box',
      padding: '12px 16px',
      borderRadius: 'var(--ws-radius-control)',
      background: 'var(--ws-color-bg-inverse)',
      color: 'var(--ws-color-fg-inverse)',
      boxShadow: 'var(--ws-elevation-2)',
      fontFamily: 'var(--ws-font-product)',
      fontSize: 14,
      lineHeight: '22px',
      fontWeight: 500,
      letterSpacing: '.014em',
      ...style
    }
  }, mark, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, children ?? text1 ?? COPY[t]), actionLabel && /*#__PURE__*/React.createElement("button", {
    type: "button",
    onClick: onAction,
    className: "ws-reset ws-focus",
    style: {
      flex: 'none',
      minHeight: 44,
      margin: '-12px -8px -12px 0',
      padding: '0 8px',
      borderRadius: 8,
      cursor: 'pointer',
      color: 'var(--ws-color-fg-inverse)',
      fontWeight: 600,
      textDecoration: 'underline',
      textUnderlineOffset: 3
    }
  }, actionLabel));
}
Object.assign(__ds_scope, { Toast, __ds_default_components_navigation_Toast_1ftfg4k: Toast });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Toast.jsx", error: String((e && e.message) || e) }); }

// components/product/AccessScopePanel.jsx
try { (() => {
const accessScopeOptions = [{
  value: 'private',
  title: '나만 보기',
  description: '내 보관함에서만 볼 수 있어요.'
}, {
  value: 'group',
  title: '모임 멤버',
  description: '현재 모임의 멤버가 볼 수 있어요.'
}, {
  value: 'link',
  title: '링크가 있는 사람',
  description: '링크를 받은 사람이 볼 수 있어요.'
}];

/**
 * "누가 이 기억을 볼 수 있나요?" — each option is one clickable row (min 48px) with a native radio.
 * Purely presentational: it reports the picked value via onChange and never decides access itself.
 * Pass `options` from the server policy so the copy always matches real permissions.
 */
function AccessScopePanel({
  text1 = '누가 이 기억을 볼 수 있나요?',
  title,
  options = accessScopeOptions,
  value,
  defaultValue = 'private',
  onChange,
  name,
  framed = true,
  hideTitle,
  className,
  style
}) {
  const [inner, setInner] = React.useState(defaultValue);
  const cur = value ?? inner;
  const gname = name ?? 'ws-access-scope';
  const tid = gname + '-title';
  return /*#__PURE__*/React.createElement("div", {
    className: className,
    style: {
      width: 360,
      maxWidth: '100%',
      boxSizing: 'border-box',
      fontFamily: 'var(--ws-font-product)',
      ...(framed ? {
        padding: 20,
        borderRadius: 'var(--ws-radius-card)',
        border: '1px solid var(--ws-color-border-subtle)',
        background: 'var(--ws-color-bg-surface)'
      } : null),
      ...style
    }
  }, !hideTitle && /*#__PURE__*/React.createElement("div", {
    id: tid,
    style: {
      marginBottom: 12,
      font: 'var(--type-headline-2)',
      color: 'var(--ws-color-fg-strong)'
    }
  }, title ?? text1), /*#__PURE__*/React.createElement("div", {
    role: "radiogroup",
    "aria-labelledby": hideTitle ? undefined : tid,
    "aria-label": hideTitle ? title ?? text1 : undefined,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, options.map(o => {
    const on = o.value === cur;
    return /*#__PURE__*/React.createElement("label", {
      key: o.value,
      className: "ws-scope"
    }, /*#__PURE__*/React.createElement("input", {
      type: "radio",
      className: "ws-sr",
      name: gname,
      value: o.value,
      checked: on,
      disabled: o.disabled,
      onChange: () => {
        if (value === undefined) setInner(o.value);
        onChange && onChange(o.value);
      }
    }), /*#__PURE__*/React.createElement("span", {
      className: "ws-radio"
    }, /*#__PURE__*/React.createElement("span", {
      className: "ws-radio__dot"
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 600,
        letterSpacing: '.014em',
        color: 'var(--ws-color-fg-strong)'
      }
    }, o.title, o.value === 'private' && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
      name: "IconLock",
      size: 16,
      style: {
        color: 'var(--ws-color-fg-secondary)'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14,
        lineHeight: '22px',
        fontWeight: 500,
        letterSpacing: '.014em',
        color: 'var(--ws-color-fg-secondary)'
      }
    }, o.description)));
  })));
}
Object.assign(__ds_scope, { accessScopeOptions, AccessScopePanel, __ds_default_components_product_AccessScopePanel_k5kr2e: AccessScopePanel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/AccessScopePanel.jsx", error: String((e && e.message) || e) }); }

// components/navigation/BottomSheet.jsx
try { (() => {
/** Bottom sheet: max 520px, top radius 20, 40×4 grip, elevation 3. Defaults to the access-scope picker. */
function BottomSheet({
  title = '공개 범위 선택',
  text1,
  children,
  className,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": text1 ?? title,
    className: className,
    style: {
      width: 375,
      maxWidth: 520,
      boxSizing: 'border-box',
      padding: '8px 20px calc(24px + env(safe-area-inset-bottom,0px))',
      borderRadius: '20px 20px 0 0',
      background: 'var(--ws-color-bg-elevated)',
      boxShadow: 'var(--ws-elevation-3)',
      fontFamily: 'var(--ws-font-product)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      width: 40,
      height: 4,
      margin: '0 auto 16px',
      borderRadius: 2,
      background: 'var(--ws-color-border-strong)'
    }
  }), /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: '0 0 16px',
      font: 'var(--type-title-3)',
      letterSpacing: '-.023em',
      color: 'var(--ws-color-fg-strong)'
    }
  }, text1 ?? title), children ?? /*#__PURE__*/React.createElement(__ds_scope.AccessScopePanel, {
    framed: false,
    hideTitle: true,
    style: {
      width: '100%'
    }
  }));
}
Object.assign(__ds_scope, { BottomSheet, __ds_default_components_navigation_BottomSheet_of063r: BottomSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/BottomSheet.jsx", error: String((e && e.message) || e) }); }

// components/product/InvitationCard.jsx
try { (() => {
const STATUS = {
  pending: {
    tone: 'brand',
    label: '초대 대기'
  },
  accepted: {
    tone: 'success',
    label: '참여 중'
  },
  expired: {
    tone: 'neutral',
    label: '만료됨',
    note: '초대가 만료됐어요.'
  },
  revoked: {
    tone: 'neutral',
    label: '취소됨',
    note: '초대가 취소됐어요.'
  }
};

/** Before acceptance: inviter + title only (no photos, places, participants). */
function InvitationCard({
  state = 'pending',
  text1 = '주말 산책 모임',
  text2 = '우영님이 우리사이에 초대했어요.',
  participants,
  onAccept,
  onLater,
  className,
  style
}) {
  const s = STATUS[state] ?? STATUS.pending;
  return /*#__PURE__*/React.createElement("article", {
    className: 'ws-card' + (className ? ' ' + className : ''),
    style: {
      width: 360,
      maxWidth: '100%',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: s.tone,
    label: s.label,
    style: {
      alignSelf: 'flex-start'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--type-headline-1)',
      letterSpacing: '-.002em',
      color: 'var(--ws-color-fg-strong)'
    }
  }, text1), /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body-2-read)',
      letterSpacing: '.01em',
      color: 'var(--ws-color-fg-secondary)'
    }
  }, text2)), state === 'accepted' && /*#__PURE__*/React.createElement(__ds_scope.ParticipantGroup, {
    names: participants
  }), s.note && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-label-1-read)',
      letterSpacing: '.014em',
      color: 'var(--ws-color-fg-secondary)'
    }
  }, s.note), state === 'pending' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    label: "\uCD08\uB300 \uC218\uB77D",
    onClick: onAccept,
    style: {
      flex: '1 1 auto'
    }
  }), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    style2: "secondary",
    label: "\uB098\uC911\uC5D0",
    onClick: onLater,
    style: {
      flex: '1 1 auto'
    }
  })));
}
Object.assign(__ds_scope, { InvitationCard, __ds_default_components_product_InvitationCard_10fdlqh: InvitationCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/InvitationCard.jsx", error: String((e && e.message) || e) }); }

// components/product/MeetingCard.jsx
try { (() => {
/** Meeting: date strongest, then place and RSVP. RSVP ≠ actual attendance. */
function MeetingCard({
  month = 'NOV',
  day = '18',
  text1 = '가을 끝자락 피크닉',
  text2 = '11월 18일 토요일 · 오후 2:00',
  text3 = '서울숲 가족마당',
  text4 = '참석 응답 6명',
  status,
  className,
  style
}) {
  const row = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    font: 'var(--type-label-1-read)',
    letterSpacing: '.014em',
    color: 'var(--ws-color-fg-secondary)'
  };
  return /*#__PURE__*/React.createElement("article", {
    className: 'ws-card' + (className ? ' ' + className : ''),
    style: {
      width: 360,
      maxWidth: '100%',
      padding: 20,
      display: 'grid',
      gridTemplateColumns: '56px minmax(0,1fr)',
      columnGap: 16,
      alignItems: 'start',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: 64,
      borderRadius: 'var(--ws-radius-control)',
      background: 'var(--ws-color-bg-brand-subtle)',
      fontFamily: 'var(--ws-font-product)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 11,
      lineHeight: '14px',
      fontWeight: 600,
      letterSpacing: '.031em',
      color: 'var(--ws-color-fg-brand)'
    }
  }, month), /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-title-3)',
      color: 'var(--ws-color-fg-strong)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, day)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label-1)',
      letterSpacing: '.014em',
      color: 'var(--ws-color-fg-brand)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, text2), /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--type-headline-1)',
      letterSpacing: '-.002em',
      color: 'var(--ws-color-fg-strong)'
    }
  }, text1), /*#__PURE__*/React.createElement("div", {
    style: row
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "IconMapPin",
    size: 16
  }), text3), /*#__PURE__*/React.createElement("div", {
    style: row
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "IconPeople",
    size: 16
  }), text4), status && /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: status.tone ?? 'neutral',
    label: status.label,
    style: {
      alignSelf: 'flex-start',
      marginTop: 4
    }
  })));
}
Object.assign(__ds_scope, { MeetingCard, __ds_default_components_product_MeetingCard_458hfx: MeetingCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/MeetingCard.jsx", error: String((e && e.message) || e) }); }

// components/product/MemoryCard.jsx
try { (() => {
const SCOPE = {
  private: {
    label: '나만 보기',
    icon: 'IconLock'
  },
  group: {
    label: '모임 멤버',
    icon: 'IconPeople'
  },
  link: {
    label: '링크 공개',
    icon: null
  }
};

/** Photo-first memory card: 4:3 cover (radius 12) → title → date · scope → description. No hover lift. */
function MemoryCard({
  scope = 'private',
  state = 'default',
  src,
  alt,
  text1 = '한강에서 함께 맞이한 저녁',
  text2 = '2026. 11. 10',
  text3 = '바람이 차가웠지만 오래 기억하고 싶은 날.',
  place,
  onClick,
  className,
  style
}) {
  const s = SCOPE[scope] ?? SCOPE.private;
  const forced = ['hover', 'focus'].includes(state) ? state : undefined;
  return /*#__PURE__*/React.createElement("article", {
    className: 'ws-card' + (className ? ' ' + className : ''),
    "data-interactive": onClick ? 'true' : undefined,
    "data-state": forced,
    tabIndex: onClick ? 0 : undefined,
    onClick: onClick,
    style: {
      width: 320,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      aspectRatio: '4 / 3',
      borderRadius: 'var(--ws-radius-media)',
      overflow: 'hidden',
      background: 'var(--ws-color-bg-recall-subtle)',
      display: 'grid',
      placeItems: 'center',
      color: 'var(--ws-color-fg-tertiary)'
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: alt ?? text1,
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "IconMemory",
    size: 32
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      font: 'var(--type-headline-2)',
      color: 'var(--ws-color-fg-strong)',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }
  }, text1), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      font: 'var(--type-label-2)',
      letterSpacing: '.019em',
      color: 'var(--ws-color-fg-secondary)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, text2, place ? ' · ' + place : ''), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: "neutral",
    icon: s.icon,
    label: s.label
  })), text3 && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      font: 'var(--type-body-2-read)',
      letterSpacing: '.01em',
      color: 'var(--ws-color-fg-default)'
    }
  }, text3)));
}
Object.assign(__ds_scope, { MemoryCard, __ds_default_components_product_MemoryCard_1sbf719: MemoryCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/MemoryCard.jsx", error: String((e && e.message) || e) }); }

// components/product/RecallCard.jsx
try { (() => {
/** "1년 전 오늘" recall: recall-subtle surface; date → photo/title → participants. Calm, never guilt-inducing. */
function RecallCard({
  tone = 'soft',
  src,
  text1 = '1년 전 오늘, 우리',
  text2 = '비가 그친 뒤 함께 걸었던 길',
  text3 = '사진 8장 · 정우, 서연, 민지와 함께',
  onClick,
  className,
  style
}) {
  const em = tone === 'emphasis';
  const fgStrong = em ? 'var(--ws-color-fg-on-brand)' : 'var(--ws-color-fg-strong)';
  const fgSoft = em ? 'var(--ws-color-fg-on-brand)' : 'var(--ws-color-fg-secondary)';
  return /*#__PURE__*/React.createElement("article", {
    onClick: onClick,
    className: className,
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      width: 420,
      maxWidth: '100%',
      boxSizing: 'border-box',
      padding: 20,
      borderRadius: 'var(--ws-radius-card)',
      border: em ? '1px solid transparent' : '1px solid var(--ws-color-border-subtle)',
      background: em ? 'var(--ws-color-bg-brand)' : 'var(--ws-color-bg-recall-subtle)',
      fontFamily: 'var(--ws-font-product)',
      cursor: onClick ? 'pointer' : undefined,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label-2)',
      letterSpacing: '.019em',
      color: em ? 'var(--ws-color-fg-on-brand)' : 'var(--ws-color-fg-brand)'
    }
  }, text1), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 14
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 64,
      height: 64,
      borderRadius: 'var(--ws-radius-media)',
      overflow: 'hidden',
      display: 'grid',
      placeItems: 'center',
      background: em ? 'var(--ws-color-bg-brand-hover)' : 'var(--ws-color-bg-surface)',
      color: em ? 'var(--ws-color-fg-on-brand)' : 'var(--ws-color-fg-tertiary)'
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block'
    }
  }) : /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "IconMemory",
    size: 24
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-headline-1)',
      letterSpacing: '-.002em',
      color: fgStrong
    }
  }, text2), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label-1-read)',
      letterSpacing: '.014em',
      color: fgSoft
    }
  }, text3))));
}
Object.assign(__ds_scope, { RecallCard, __ds_default_components_product_RecallCard_ymza6v: RecallCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/RecallCard.jsx", error: String((e && e.message) || e) }); }

// components/product/SettlementPrivacyCard.jsx
try { (() => {
/** Amount shown only to settlement participants. Neutral amount; only "unconfirmed" uses Warning. */
function SettlementPrivacyCard({
  state = 'settled',
  text1 = '정산 정보',
  text2 = '82,400원',
  text3 = '정산 참여자만 금액을 볼 수 있어요.',
  className,
  style
}) {
  const badge = state === 'pending' ? {
    tone: 'warning',
    label: '확인 전'
  } : {
    tone: 'success',
    label: '정산 완료'
  };
  return /*#__PURE__*/React.createElement("article", {
    className: 'ws-card' + (className ? ' ' + className : ''),
    style: {
      width: 360,
      maxWidth: '100%',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      font: 'var(--type-label-1)',
      letterSpacing: '.014em',
      color: 'var(--ws-color-fg-default)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "IconLock",
    size: 16,
    style: {
      color: 'var(--ws-color-fg-secondary)'
    }
  }), text1), /*#__PURE__*/React.createElement(__ds_scope.Badge, {
    tone: badge.tone,
    label: badge.label
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-title-2)',
      letterSpacing: '-.024em',
      color: 'var(--ws-color-fg-strong)',
      fontVariantNumeric: 'tabular-nums'
    }
  }, text2), /*#__PURE__*/React.createElement("div", {
    style: {
      font: 'var(--type-label-1-read)',
      letterSpacing: '.014em',
      color: 'var(--ws-color-fg-secondary)'
    }
  }, text3));
}
Object.assign(__ds_scope, { SettlementPrivacyCard, __ds_default_components_product_SettlementPrivacyCard_15n0smf: SettlementPrivacyCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/product/SettlementPrivacyCard.jsx", error: String((e && e.message) || e) }); }

if (__ds_scope.__ds_default_components_icons_icon_data_12stud1$1nb03e1 === undefined) __ds_scope.__ds_default_components_icons_icon_data_12stud1$1nb03e1 = __ds_scope.__ds_default_components_icons_icon_data_12stud1;

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.IconPlus = __ds_scope.IconPlus;

__ds_ns.ParticipantGroup = __ds_scope.ParticipantGroup;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.FilterChip = __ds_scope.FilterChip;

__ds_ns.Radio = __ds_scope.Radio;

__ds_ns.SegmentedControl = __ds_scope.SegmentedControl;

__ds_ns.Switch = __ds_scope.Switch;

__ds_ns.TextField = __ds_scope.TextField;

__ds_ns.BottomNavigation = __ds_scope.BottomNavigation;

__ds_ns.BottomNavigationItem = __ds_scope.BottomNavigationItem;

__ds_ns.BottomSheet = __ds_scope.BottomSheet;

__ds_ns.Dialog = __ds_scope.Dialog;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.InlineMessage = __ds_scope.InlineMessage;

__ds_ns.SidebarItem = __ds_scope.SidebarItem;

__ds_ns.Tab = __ds_scope.Tab;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.AccessScopePanel = __ds_scope.AccessScopePanel;

__ds_ns.InvitationCard = __ds_scope.InvitationCard;

__ds_ns.MeetingCard = __ds_scope.MeetingCard;

__ds_ns.MemoryCard = __ds_scope.MemoryCard;

__ds_ns.RecallCard = __ds_scope.RecallCard;

__ds_ns.SettlementPrivacyCard = __ds_scope.SettlementPrivacyCard;

})();
