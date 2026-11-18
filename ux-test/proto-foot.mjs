// 발자국 통계 탐색·단일 친구 선택. 기존 필터 결과를 지도와 목록이 함께 사용한다.

const FRIEND_OLD = `          <sc-if value="{{ footWithMode }}" hint-placeholder-val="{{ false }}">
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <sc-for list="{{ footPeople }}" as="p" hint-placeholder-count="6">
                <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.FilterChip" label="{{ p.nick }}" selected="{{ p.selected }}" on-change="{{ p.pick }}" hint-size="64px,36px"></x-import>
              </sc-for>
            </div>
          </sc-if>`;

const FRIEND_NEW = `          <sc-if value="{{ footWithMode }}" hint-placeholder-val="{{ false }}">
            <div style="display:flex;align-items:center;gap:12px;min-height:64px;padding:10px 12px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle)">
              <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.Avatar" size="36" name="{{ footFriendName }}" hint-size="36px,36px"></x-import>
              <span style="display:flex;flex:1;min-width:0;flex-direction:column;gap:2px"><small style="font:var(--type-caption-1);color:var(--ws-color-fg-tertiary)">함께한 친구</small><b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:var(--type-headline-2);color:var(--ws-color-fg-strong)">{{ footFriendName }}</b></span>
              <button onClick="{{ openFootFriend }}" style="min-width:76px;min-height:44px;border:0;background:none;color:var(--ws-color-fg-brand);font:var(--type-label-1);font-family:var(--ws-font-product);cursor:pointer">친구 변경</button>
            </div>
          </sc-if>`;

const STATS_OLD = `          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div style="padding:14px 16px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle);display:flex;flex-direction:column;gap:2px">
              <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">기록된 지역</span>
              <span style="font:var(--type-title-2);color:var(--ws-color-fg-strong)">{{ footRegionCount }}<span style="font:var(--type-body-2);color:var(--ws-color-fg-secondary)"> / 17곳</span></span>
            </div>
            <div style="padding:14px 16px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle);display:flex;flex-direction:column;gap:2px">
              <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">연결된 추억</span>
              <span style="font:var(--type-title-2);color:var(--ws-color-fg-strong)">{{ footMemCount }}<span style="font:var(--type-body-2);color:var(--ws-color-fg-secondary)">개</span></span>
            </div>
          </div>`;

const STATS_NEW = `          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <button onClick="{{ openFootRegions }}" aria-label="기록된 지역 목록 보기, {{ footRegionStat }}" style="min-height:132px;padding:14px 16px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle);display:flex;flex-direction:column;gap:4px;text-align:left;font-family:var(--ws-font-product);cursor:pointer">
              <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">기록된 지역</span>
              <strong style="font:var(--type-title-2);color:var(--ws-color-fg-strong)">{{ footRegionStat }}</strong>
              <small style="margin-top:auto;font:var(--type-caption-1);color:var(--ws-color-fg-secondary)">지역 목록 보기</small>
            </button>
            <button onClick="{{ openFootMems }}" aria-label="연결된 추억 목록 보기, {{ footMemCount }}개" style="min-height:132px;padding:14px 16px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle);display:flex;flex-direction:column;gap:4px;text-align:left;font-family:var(--ws-font-product);cursor:pointer">
              <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">연결된 추억</span>
              <strong style="font:var(--type-title-2);color:var(--ws-color-fg-strong)">{{ footMemCount }}<span style="font:var(--type-body-2);color:var(--ws-color-fg-secondary)">개</span></strong>
              <small style="margin-top:auto;font:var(--type-caption-1);color:var(--ws-color-fg-secondary)">추억 목록 보기</small>
            </button>
          </div>`;

const PAGES_OLD = `      <sc-if value="{{ isRegion }}" hint-placeholder-val="{{ false }}">`;
const PAGES_NEW = `      <sc-if value="{{ isFootRegions }}" hint-placeholder-val="{{ false }}">
        <div data-screen-label="기록된 지역" style="display:flex;flex-direction:column;gap:20px;padding:4px 20px 32px">
          <div style="margin-left:-8px"><x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.IconButton" icon1="{{ ic.chevronLeft }}" label="뒤로" on-click="{{ back }}" hint-size="44px,44px"></x-import></div>
          <div><h1 style="margin:0;font:var(--type-title-2);color:var(--ws-color-fg-strong)">기록된 지역</h1><p style="margin:8px 0 0;font:var(--type-body-2-read);color:var(--ws-color-fg-secondary)">{{ footListSummary }}</p></div>
          <div style="display:flex;flex-direction:column;gap:10px"><sc-for list="{{ footRegionRows }}" as="r" hint-placeholder-count="3"><button onClick="{{ r.open }}" style="display:grid;grid-template-columns:56px minmax(0,1fr) 24px;align-items:center;gap:12px;min-height:72px;padding:8px 12px;border:1px solid var(--ws-color-border-subtle);border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);font-family:var(--ws-font-product);text-align:left;cursor:pointer"><span style="position:relative;width:56px;height:56px;border-radius:var(--ws-radius-small);overflow:hidden;background:var(--ws-color-bg-recall-subtle)"><img src="{{ r.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></span><span style="display:flex;min-width:0;flex-direction:column;gap:4px"><b style="font:var(--type-headline-2);color:var(--ws-color-fg-strong)">{{ r.name }}</b><small style="font:var(--type-label-2);color:var(--ws-color-fg-secondary)">추억 {{ r.count }}개</small></span><lucide-icon name="chevron-right" size="20"></lucide-icon></button></sc-for><sc-if value="{{ footListEmpty }}" hint-placeholder-val="{{ false }}"><p style="padding:28px 16px;text-align:center;font:var(--type-body-2-read);color:var(--ws-color-fg-tertiary)">아직 기록된 지역이 없어요.</p></sc-if></div>
        </div>
      </sc-if>

      <sc-if value="{{ isFootMems }}" hint-placeholder-val="{{ false }}">
        <div data-screen-label="연결된 추억" style="display:flex;flex-direction:column;gap:20px;padding:4px 20px 32px">
          <div style="margin-left:-8px"><x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.IconButton" icon1="{{ ic.chevronLeft }}" label="뒤로" on-click="{{ back }}" hint-size="44px,44px"></x-import></div>
          <div><h1 style="margin:0;font:var(--type-title-2);color:var(--ws-color-fg-strong)">연결된 추억</h1><p style="margin:8px 0 0;font:var(--type-body-2-read);color:var(--ws-color-fg-secondary)">{{ footListSummary }}</p></div>
          <div style="display:flex;flex-direction:column;gap:12px"><sc-for list="{{ footMemRows }}" as="m" hint-placeholder-count="3"><button onClick="{{ m.open }}" style="display:grid;grid-template-columns:76px minmax(0,1fr) 24px;align-items:center;gap:12px;padding:12px;border:1px solid var(--ws-color-border-subtle);border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);font-family:var(--ws-font-product);text-align:left;cursor:pointer"><span style="position:relative;width:76px;height:76px;border-radius:var(--ws-radius-small);overflow:hidden;background:var(--ws-color-bg-recall-subtle)"><img src="{{ m.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></span><span style="display:flex;min-width:0;flex-direction:column;gap:4px"><b style="overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font:var(--type-headline-2);color:var(--ws-color-fg-strong)">{{ m.title }}</b><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">{{ m.rangeShort }} · {{ m.r }}</span><small style="font:var(--type-label-2);color:var(--ws-color-fg-secondary)">{{ m.counts }}</small></span><lucide-icon name="chevron-right" size="20"></lucide-icon></button></sc-for><sc-if value="{{ footListEmpty }}" hint-placeholder-val="{{ false }}"><p style="padding:28px 16px;text-align:center;font:var(--type-body-2-read);color:var(--ws-color-fg-tertiary)">이 조건에 해당하는 추억이 아직 없어요.</p></sc-if></div>
        </div>
      </sc-if>

      <sc-if value="{{ isRegion }}" hint-placeholder-val="{{ false }}">`;

const SHEET_OLD = `    <sc-if value="{{ sheetRegionPeek }}" hint-placeholder-val="{{ false }}">`;
const SHEET_NEW = `    <sc-if value="{{ sheetFootFriend }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;left:0;right:0;bottom:0;z-index:30;overflow:hidden;border-radius:24px 24px 0 0;background:#fff">
        <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.BottomSheet" title="함께한 친구 선택" style="width:100%;max-width:none;max-height:min(80dvh,680px);overflow:auto;border-radius:24px 24px 0 0;background:#fff" dc-props="{{ fullW }}" hint-size="100%,600px">
          <div style="display:flex;flex-direction:column;gap:14px;padding-bottom:max(4px,env(safe-area-inset-bottom))">
            <label style="display:flex;align-items:center;gap:8px;min-height:48px;padding:0 14px;border:1px solid var(--ws-color-border-default);border-radius:var(--ws-radius-control);background:var(--ws-color-bg-surface)"><lucide-icon name="search" size="20"></lucide-icon><input value="{{ footFriendQuery }}" onChange="{{ footFriendSearch }}" placeholder="친구 이름 검색" aria-label="친구 이름 검색" style="width:100%;min-width:0;border:0;outline:0;background:transparent;font:var(--type-body-2);font-family:var(--ws-font-product);color:var(--ws-color-fg-strong)"></label>
            <div style="display:flex;max-height:340px;flex-direction:column;gap:6px;overflow:auto"><sc-for list="{{ footFriendRows }}" as="p" hint-placeholder-count="6"><button onClick="{{ p.pick }}" aria-pressed="{{ p.selected }}" style="display:grid;grid-template-columns:40px minmax(0,1fr) 24px;align-items:center;gap:12px;min-height:64px;padding:8px 10px;border:{{ p.border }};border-radius:var(--ws-radius-control);background:{{ p.bg }};font-family:var(--ws-font-product);text-align:left;cursor:pointer"><x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.Avatar" size="40" name="{{ p.nick }}" hint-size="40px,40px"></x-import><span style="display:flex;min-width:0;flex-direction:column;gap:2px"><b style="font:var(--type-label-1);color:var(--ws-color-fg-strong)">{{ p.nick }}</b><small style="font:var(--type-caption-1);color:var(--ws-color-fg-secondary)">함께한 추억 {{ p.count }}개</small></span><span style="color:var(--ws-color-fg-brand)">{{ p.check }}</span></button></sc-for><sc-if value="{{ footFriendNone }}" hint-placeholder-val="{{ false }}"><p style="padding:24px 0;text-align:center;font:var(--type-label-1-read);color:var(--ws-color-fg-tertiary)">검색 결과가 없어요.</p></sc-if></div>
            <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.Button" full-width="{{ true }}" label="선택 완료" disabled="{{ footFriendDisabled }}" on-click="{{ applyFootFriend }}" hint-size="100%,52px"></x-import>
          </div>
        </x-import>
      </div>
    </sc-if>

    <sc-if value="{{ sheetRegionPeek }}" hint-placeholder-val="{{ false }}">`;

export const FOOT_MARKUP = [[FRIEND_OLD, FRIEND_NEW], [STATS_OLD, STATS_NEW], [PAGES_OLD, PAGES_NEW], [SHEET_OLD, SHEET_NEW]];

export const FOOT_LOGIC = [
  ["footScope: 'domestic', footDistrict: '', threads:", "footScope: 'domestic', footDistrict: '', footFriendDraft: '', footFriendQuery: '', threads:"],
  ["const footBase = s.footMode === 'mine' ? all : all.filter(m => m.w.includes(s.footWith));\n    const rc = {}, rcover = {};\n    footBase.forEach", "const footBase = s.footMode === 'mine' ? all : all.filter(m => s.footWith && m.w.includes(s.footWith));\n    const footVisible = s.footScope === 'domestic' ? footBase : [];\n    const rc = {}, rcover = {};\n    footVisible.forEach"],
  ["const mapMarkers = REGIONS.map((r, i) => ({ ...stamps[i], name: r, x: REGION_POS[r][0], y: REGION_POS[r][1], count: rc[r] || 0, size: 52, cursor: 'pointer', shadow: '0 0 0 2px var(--ws-color-border-brand),0 4px 12px rgba(86,107,92,.2)' })).filter(r => r.has);", "const mapMarkers = REGIONS.map((r, i) => ({ ...stamps[i], name: r, x: REGION_POS[r][0], y: REGION_POS[r][1], count: rc[r] || 0, size: 52, cursor: 'pointer', shadow: '0 0 0 2px var(--ws-color-border-brand),0 4px 12px rgba(86,107,92,.2)' })).filter(r => r.has);\n    const footRegionRows = REGIONS.filter(r => rc[r]).map(r => ({ name:r, img:rcover[r], count:rc[r], open:()=>{ ev('region_view'); this.setState(st => ({ stack:[...st.stack,{t:'region',id:r}], footDistrict:'' })); } })), footMemRows = footVisible;"],
  ["const peekList = s.peekRegion ? footBase.filter", "const peekList = s.peekRegion ? footVisible.filter"],
  ["if (top && top.t === 'region') {\n      const list = all.filter", "if (top && top.t === 'region') {\n      const list = footVisible.filter"],
  ["isDetail: !!curRaw, isRegion: !!(top && top.t === 'region'), isLogin, isCreate,", "isDetail: !!curRaw, isRegion: !!(top && top.t === 'region'), isFootRegions: !!(top && top.t === 'footRegions'), isFootMems: !!(top && top.t === 'footMems'), isLogin, isCreate,"],
  ["footPeople: s.friends.map(p => ({ nick: p, selected: s.footWith === p, pick: () => this.setState({ footWith: p }) })),", "footFriendName: s.footWith || '친구를 선택해 주세요', openFootFriend:()=>this.setState({overlay:'footFriend',footFriendDraft:s.footWith || '',footFriendQuery:''}), footFriendQuery:s.footFriendQuery, footFriendSearch:e=>this.setState({footFriendQuery:e.target.value}), footFriendRows:s.friends.filter(p=>p.includes(String(s.footFriendQuery || '').trim())).map(p=>{ const selected=s.footFriendDraft===p; return {nick:p,count:all.filter(m=>m.w.includes(p)).length,selected,border:selected?'1px solid var(--ws-color-border-brand)':'1px solid transparent',bg:selected?'var(--ws-color-bg-brand-subtle)':'var(--ws-color-bg-surface)',check:selected?LI('check',20):'',pick:()=>this.setState({footFriendDraft:p})};}), footFriendNone:!s.friends.some(p=>p.includes(String(s.footFriendQuery || '').trim())), footFriendDisabled:!s.footFriendDraft, applyFootFriend:()=>this.setState({footWith:s.footFriendDraft,overlay:null}),"],
  ["stamps, footRegionCount: Object.keys(rc).length, footMemCount: footBase.length, footEmpty: footBase.length === 0,", "stamps, footRegionCount:Object.keys(rc).length, footRegionStat:s.footScope==='domestic' ? Object.keys(rc).length + '곳' : Object.keys(rc).length + '개국', footMemCount:footVisible.length, footEmpty:footVisible.length===0, footRegionRows, footMemRows, footListEmpty:footVisible.length===0, footListSummary:(s.footMode==='with' && s.footWith ? s.footWith + '님과 함께한 ' : '') + (s.footScope==='domestic' ? '국내 발자국' : '해외 발자국'), openFootRegions:()=>this.push({t:'footRegions'}), openFootMems:()=>this.push({t:'footMems'}),"],
  ["sheetThread: s.overlay === 'thread', sheetRegionPeek: s.overlay === 'regionPeek' && !!s.peekRegion,", "sheetThread: s.overlay === 'thread', sheetRegionPeek: s.overlay === 'regionPeek' && !!s.peekRegion, sheetFootFriend:s.overlay==='footFriend',"],
  ["footWith: () => S({ tab: 'foot', footMode: 'with' }),", "footWith: () => S({ tab: 'foot', footMode: 'with' }), footFriend:()=>S({tab:'foot',footMode:'with',overlay:'footFriend',footFriendDraft:'민지'}), footRegions:()=>S({tab:'foot',stack:[{t:'footRegions'}]}), footMems:()=>S({tab:'foot',stack:[{t:'footMems'}]}),"]
];
