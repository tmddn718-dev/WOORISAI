// P1(프로토타입): 홈은 받은 초대를 맨 위로, 만들기는 지역·장소를 접어서 나중에. 실제 앱 P1과 같은 방향이며, 디자인 시스템 컴포넌트와 같은 토큰만 쓴다.
// 마크업 치환은 build.mjs 가 되돌려 원본과 같은지 검사한다.
const INVITE = "          <sc-if value=\"{{ hasInvite }}\" hint-placeholder-val=\"{{ true }}\">\n            <section style=\"display:flex;flex-direction:column;gap:12px\">\n              <h2 style=\"margin:0;font:var(--type-headline-1);color:var(--ws-color-fg-strong)\">함께 기록하자는 초대</h2>\n              <x-import component-from-global-scope=\"WOORISAIDesignSystem_e5e56b.InvitationCard\" state=\"pending\" text1=\"연말 송년회, 을지로에서\" text2=\"준서님이 이 추억을 함께 기록하자고 초대했어요.\" on-accept=\"{{ acceptInvite }}\" on-later=\"{{ laterInvite }}\" dc-props=\"{{ fullW }}\" hint-size=\"100%,180px\"></x-import>\n            </section>\n          </sc-if>\n";
const FOOT_ANCHOR = "          <section style=\"display:flex;flex-direction:column;gap:12px\">\n            <h2 style=\"margin:0;font:var(--type-headline-1);color:var(--ws-color-fg-strong)\">우리의 발자국</h2>";
const NOMEMS = "          <sc-if value=\"{{ noMems }}\" hint-placeholder-val=\"{{ false }}\">";
const REGION = "          <div style=\"display:flex;flex-direction:column;gap:8px\">\n            <span style=\"font:var(--type-label-1);color:var(--ws-color-fg-strong)\">지역</span>\n            <div style=\"display:flex;flex-wrap:wrap;gap:8px\">\n              <sc-for list=\"{{ cRegions }}\" as=\"r\" hint-placeholder-count=\"17\">\n                <x-import component-from-global-scope=\"WOORISAIDesignSystem_e5e56b.FilterChip\" label=\"{{ r.name }}\" selected=\"{{ r.selected }}\" on-change=\"{{ r.pick }}\" hint-size=\"56px,36px\"></x-import>\n              </sc-for>\n            </div>\n          </div>\n          <sc-if value=\"{{ cHasRegion }}\" hint-placeholder-val=\"{{ false }}\">\n            <x-import component-from-global-scope=\"WOORISAIDesignSystem_e5e56b.TextField\" label=\"장소 (선택)\" placeholder=\"예: 성수동\" value=\"{{ c.place }}\" on-change=\"{{ onPlace }}\" dc-props=\"{{ fullW }}\" hint-size=\"100%,72px\"></x-import>\n          </sc-if>";

const FOLD_OPEN = '          <details open="{{ cRegionOpen }}" style="border:1px solid var(--ws-color-border-subtle);border-radius:var(--ws-radius-control);background:var(--ws-color-bg-surface);padding:0 16px">\n            <summary style="display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;cursor:pointer;list-style:none;font:var(--type-label-1);color:var(--ws-color-fg-strong)"><span>지역·장소 연결 <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">(선택)</span></span><span aria-live="polite" style="font:var(--type-label-2);color:var(--ws-color-fg-brand)">{{ cRegionHint }}</span></summary>\n            <div style="display:flex;flex-direction:column;gap:16px;padding:0 0 16px">\n';
const FOLD_CLOSE = '\n            </div>\n          </details>';

export const P1_MARKUP = [
  // 홈: 받은 초대를 있던 자리에서 빼서 맨 위(헤더 바로 아래)로
  [INVITE + FOOT_ANCHOR, FOOT_ANCHOR],
  [NOMEMS, INVITE + NOMEMS],
  // 만들기: 지역·장소(칩 17개)를 접는 영역으로
  [REGION, FOLD_OPEN + REGION.split('\n').map(l => '    ' + l).join('\n') + FOLD_CLOSE]
];
export const P1_LOGIC = [
  ['cHasRegion: !!c.region,', "cHasRegion: !!c.region, cRegionOpen: !!c.fromPlan, cRegionHint: c.region ? c.region + ' 선택됨' : '발자국에 쌓여요',"]
];
