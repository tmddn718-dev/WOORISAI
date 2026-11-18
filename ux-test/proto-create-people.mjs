// 추억 만들기 참여자: 메인 폼은 요약만, 검색·다중 선택은 기존 바텀시트 패턴으로 처리한다.

const PEOPLE_OLD = `          <div style="display:flex;flex-direction:column;gap:8px">
            <span style="font:var(--type-label-1);color:var(--ws-color-fg-strong)">함께한 사람</span>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              <sc-for list="{{ cPeople }}" as="p" hint-placeholder-count="6">
                <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.FilterChip" label="{{ p.nick }}" selected="{{ p.selected }}" on-change="{{ p.toggle }}" hint-size="64px,36px"></x-import>
              </sc-for>
            </div>
          </div>`;

const PEOPLE_NEW = `          <div style="display:flex;flex-direction:column;gap:8px">
            <span style="display:flex;align-items:center;justify-content:space-between;gap:12px">
              <span style="font:var(--type-label-1);color:var(--ws-color-fg-strong)">함께한 사람 (선택)</span>
              <sc-if value="{{ cPeopleHasSelection }}" hint-placeholder-val="{{ false }}"><span aria-live="polite" style="font:var(--type-label-2);color:var(--ws-color-fg-brand)">{{ cPeopleCount }}명 선택</span></sc-if>
            </span>
            <sc-if value="{{ cPeopleCanPick }}" hint-placeholder-val="{{ true }}">
              <span style="font:var(--type-label-1-read);color:var(--ws-color-fg-secondary)">이 추억에 함께한 친구를 선택해 주세요.</span>
              <button id="create-people-trigger" onClick="{{ openCreatePeople }}" aria-label="{{ cPeopleTriggerAria }}" style="display:flex;align-items:center;gap:12px;width:100%;min-height:64px;padding:12px 16px;border:1px solid var(--ws-color-border-default);border-radius:var(--ws-radius-control);background:var(--ws-color-bg-surface);color:var(--ws-color-fg-strong);font-family:var(--ws-font-product);text-align:left;cursor:pointer">
                <span style="min-width:0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:var(--type-label-1)">{{ cPeopleSummary }}</span>
                <span style="flex:none;font:var(--type-label-1);color:var(--ws-color-fg-brand)">{{ cPeopleAction }}</span>
              </button>
              <sc-if value="{{ cPeopleNoSelection }}" hint-placeholder-val="{{ true }}"><span style="font:var(--type-caption-1);color:var(--ws-color-fg-tertiary)">선택한 친구가 없어요.</span></sc-if>
            </sc-if>
            <sc-if value="{{ cPeopleNoFriends }}" hint-placeholder-val="{{ false }}"><span style="padding:14px 16px;border:1px solid var(--ws-color-border-subtle);border-radius:var(--ws-radius-control);background:var(--ws-color-bg-surface);font:var(--type-label-1-read);color:var(--ws-color-fg-secondary);text-wrap:pretty">아직 연결된 친구가 없어요. 친구와 연결되면 함께한 사람으로 선택할 수 있어요.</span></sc-if>
          </div>`;

const SHEET_OLD = `    <sc-if value="{{ sheetAuth }}" hint-placeholder-val="{{ false }}">`;
const SHEET_NEW = `    <sc-if value="{{ sheetCreatePeople }}" hint-placeholder-val="{{ false }}">
      <div role="dialog" aria-modal="true" aria-label="함께한 친구 선택" style="position:absolute;left:0;right:0;bottom:0;z-index:30;height:min(88dvh,760px);max-height:88dvh;min-height:0;display:flex;flex-direction:column;gap:12px;padding:10px 20px max(16px,env(safe-area-inset-bottom));overflow:hidden;border-radius:24px 24px 0 0;background:#fff">
            <span aria-hidden="true" style="width:40px;height:5px;flex:none;align-self:center;border-radius:9999px;background:#C7CAC5"></span>
            <span style="display:flex;align-items:center;justify-content:space-between;gap:12px"><strong style="font:var(--type-headline-1);color:var(--ws-color-fg-strong)">함께한 친구 선택</strong><span aria-live="polite" style="font:var(--type-label-1);color:var(--ws-color-fg-brand)">{{ cPeopleDraftCount }}명 선택</span></span>
            <label style="display:flex;align-items:center;gap:8px;min-height:48px;padding:0 14px;border:1px solid var(--ws-color-border-default);border-radius:var(--ws-radius-control);background:#fff"><lucide-icon name="search" size="20"></lucide-icon><input data-create-people-search value="{{ cPeopleQuery }}" onChange="{{ cPeopleSearch }}" placeholder="친구 이름 검색" aria-label="친구 이름 검색" style="width:100%;min-width:0;border:0;outline:0;background:transparent;font:var(--type-body-2);font-family:var(--ws-font-product);color:var(--ws-color-fg-strong)"></label>
            <div style="flex:1;min-height:0;display:flex;flex-direction:column;gap:8px;overflow:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch">
              <sc-for list="{{ cPeopleRows }}" as="p" hint-placeholder-count="6">
                <button onClick="{{ p.toggle }}" aria-pressed="{{ p.selected }}" aria-label="{{ p.aria }}" style="display:grid;grid-template-columns:40px minmax(0,1fr) 24px;align-items:center;gap:12px;min-height:56px;padding:8px 12px;border:{{ p.border }};border-radius:12px;background:{{ p.bg }};font-family:var(--ws-font-product);text-align:left;cursor:pointer;transition:background-color 150ms,border-color 150ms">
                  <span style="width:40px;height:40px;display:grid;place-items:center;border-radius:9999px;background:{{ p.avatarBg }}"><x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.Avatar" size="36" name="{{ p.name }}" hint-size="36px,36px"></x-import></span>
                  <span style="min-width:0;display:flex;flex-direction:column;gap:2px"><b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px;line-height:22px;font-weight:{{ p.weight }};color:{{ p.fg }}">{{ p.name }}</b><sc-if value="{{ p.inSpace }}" hint-placeholder-val="{{ false }}"><small style="font:var(--type-caption-1);color:var(--ws-color-fg-tertiary)">현재 공간 멤버</small></sc-if></span>
                  <span aria-hidden="true" style="width:22px;height:22px;display:grid;place-items:center;border:{{ p.checkBorder }};border-radius:6px;background:{{ p.checkBg }};color:#fff">{{ p.check }}</span>
                </button>
              </sc-for>
              <sc-if value="{{ cPeopleNoResult }}" hint-placeholder-val="{{ false }}"><div style="padding:28px 8px;text-align:center"><p style="margin:0;font:var(--type-label-1);color:var(--ws-color-fg-strong)">검색 결과가 없어요.</p><p style="margin:6px 0 0;font:var(--type-label-1-read);color:var(--ws-color-fg-secondary)">다른 이름으로 검색해 보세요.</p></div></sc-if>
            </div>
            <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.Button" full-width="{{ true }}" label="{{ cPeopleApplyLabel }}" on-click="{{ applyCreatePeople }}" hint-size="100%,52px"></x-import>
      </div>
    </sc-if>

    <sc-if value="{{ sheetAuth }}" hint-placeholder-val="{{ false }}">`;

export const CREATE_PEOPLE_MARKUP = [[PEOPLE_OLD, PEOPLE_NEW], [SHEET_OLD, SHEET_NEW]];

const PICKER_LOGIC = `    // shortcut: 프로토타입 친구 데이터가 이름 문자열이라 연결 순서 기반 ID를 쓴다, 실제 API 연결 시 사용자 ID로 교체한다.
    const createFriendOptions = (s.friends || []).map((name, index) => ({ id: 'friend-' + index, name }));
    const cConfirmedIds = Array.isArray(c.withIds) ? c.withIds : createFriendOptions.filter(f => (c.with || []).includes(f.name)).map(f => f.id);
    const cSelectedFriends = createFriendOptions.filter(f => cConfirmedIds.includes(f.id));
    const cSelectedNames = cSelectedFriends.map(f => f.name), cPeopleCount = cSelectedFriends.length;
    const cPeopleSummary = cPeopleCount ? cSelectedNames.slice(0, 3).join(' · ') + (cPeopleCount > 3 ? ' 외 ' + (cPeopleCount - 3) + '명' : '') : '함께한 친구 선택';
    const cPeopleDraftIds = Array.isArray(s.cPeopleDraft) ? s.cPeopleDraft : [], cPeopleQuery = String(s.cPeopleQuery || '').trim().toLocaleLowerCase('ko-KR');
    const cPeopleRows = createFriendOptions.filter(f => !cPeopleQuery || f.name.toLocaleLowerCase('ko-KR').includes(cPeopleQuery)).map(f => {
      const selected = cPeopleDraftIds.includes(f.id), inSpace = !!(c.space && spaceOf(c.space) && spaceOf(c.space).members.includes(f.name));
      return { id:f.id, name:f.name, inSpace, selected, aria:f.name + (selected ? ', 선택됨' : ', 선택 안 됨'), bg:selected ? '#EEF2EC' : '#FFFFFF', border:selected ? '1.5px solid #566B5C' : '1px solid #D7DAD5', fg:selected ? '#405B48' : '#242622', weight:selected ? 600 : 500, avatarBg:selected ? '#FFFFFF' : '#F3F4F1', checkBorder:selected ? '1.5px solid #566B5C' : '1.5px solid #A8ADA6', checkBg:selected ? '#566B5C' : '#FFFFFF', check:selected ? LI('check', 16, '2.25') : '', toggle:() => this.setState(st => ({ cPeopleDraft:(st.cPeopleDraft || []).includes(f.id) ? st.cPeopleDraft.filter(id => id !== f.id) : [...(st.cPeopleDraft || []), f.id] })) };
    });

`;

export const CREATE_PEOPLE_LOGIC = [
  ["    // plan detail & form\n", PICKER_LOGIC + "    // plan detail & form\n"],
  ["const m = { id, space: c.space || null, t: c.title.trim(),", "const m = { id, space: c.space || null, memberIds: Array.isArray(c.withIds) ? c.withIds.slice() : [], t: c.title.trim(),"],
  ["      cRegions: REGIONS.map", `      cPeopleCount, cPeopleHasSelection:cPeopleCount > 0, cPeopleNoSelection:cPeopleCount === 0, cPeopleCanPick:createFriendOptions.length > 0, cPeopleNoFriends:createFriendOptions.length === 0, cPeopleSummary, cPeopleAction:cPeopleCount ? '변경' : '선택', cPeopleTriggerAria:cPeopleCount ? '함께한 친구 ' + cPeopleCount + '명, 변경' : '함께한 친구 선택',
      openCreatePeople:() => { this.setState({ overlay:'createPeople', cPeopleDraft:cConfirmedIds.slice(), cPeopleQuery:'' }); setTimeout(() => { const el=document.querySelector('[data-create-people-search]'); if (el) el.focus(); }, 0); },
      cPeopleQuery:s.cPeopleQuery || '', cPeopleSearch:e => this.setState({ cPeopleQuery:e.target.value }), cPeopleRows, cPeopleDraftCount:cPeopleDraftIds.length, cPeopleNoResult:createFriendOptions.length > 0 && cPeopleRows.length === 0, cPeopleApplyLabel:'선택 완료 (' + cPeopleDraftIds.length + '명)',
      applyCreatePeople:() => { this.setState(st => { const selected=createFriendOptions.filter(f => (st.cPeopleDraft || []).includes(f.id)); return { c:{ ...st.c, with:selected.map(f => f.name), withIds:selected.map(f => f.id) }, overlay:null }; }); setTimeout(() => { const el=document.getElementById('create-people-trigger'); if (el) el.focus(); }, 0); },
      cRegions: REGIONS.map`],
  ["      hasOverlay: !!s.overlay, closeOverlay: () => this.setState({ overlay: null }),", "      hasOverlay: !!s.overlay, closeOverlay: () => { const restore=s.overlay === 'createPeople'; this.setState({ overlay:null }); if (restore) setTimeout(() => { const el=document.getElementById('create-people-trigger'); if (el) el.focus(); }, 0); },"],
  ["      sheetAuth: s.overlay === 'auth',", "      sheetCreatePeople:s.overlay === 'createPeople' && isCreate, sheetAuth: s.overlay === 'auth',"],
  ["    document.addEventListener('error', this._imgErr, true);", "    document.addEventListener('error', this._imgErr, true);\n    this._createPeopleEsc = e => { if (e.key === 'Escape' && this.state.overlay === 'createPeople') { this.setState({ overlay:null }); setTimeout(() => { const el=document.getElementById('create-people-trigger'); if (el) el.focus(); }, 0); } }; window.addEventListener('keydown', this._createPeopleEsc);"],
  ["  componentWillUnmount() { window.removeEventListener('resize', this._r);", "  componentWillUnmount() { window.removeEventListener('resize', this._r); window.removeEventListener('keydown', this._createPeopleEsc);"],
  ["      createPhoto: () => { this.openCreate(); S(st => ({ c: { ...st.c, mode: 'photo', title: '비 그친 뒤 걸었던 길', pics: POOL.slice(0, 3), with: ['민지'] } })); },", "      createPhoto: () => { this.openCreate(); S(st => ({ c: { ...st.c, mode: 'photo', title: '비 그친 뒤 걸었던 길', pics: POOL.slice(0, 3), with: ['민지'] } })); },\n      createPeople: () => { this.openCreate(); S(st => ({ c:{ ...st.c, mode:'photo', with:['민지','하은'], withIds:['friend-0','friend-2'] }, overlay:'createPeople', cPeopleDraft:['friend-0','friend-2'], cPeopleQuery:'' })); },\n      createPeopleEmpty: () => { this.openCreate(); S(st => ({ friends:[], c:{ ...st.c, mode:'photo', with:[], withIds:[] } })); },\n      createPeopleMany: () => { const friends=Array.from({length:100},(_,i) => '친구 ' + (i + 1)); this.openCreate(); S(st => ({ friends, c:{ ...st.c, mode:'photo', with:[], withIds:[] }, overlay:'createPeople', cPeopleDraft:[], cPeopleQuery:'' })); },"]
];
