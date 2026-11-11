// 프로토타입 '우리 공간'(P1): Claude Design 에 없는 새 화면이라 기존 디자인 시스템 컴포넌트(Button·TextField·FilterChip·Avatar·ParticipantGroup·BottomSheet·InlineMessage)와
// 기존 화면의 간격·타이포 규칙을 그대로 써서 구성한다. 마크업 추가 위치는 모두 기존 블록 '앞'이며, build.mjs 가 되돌리면 원본과 같은지 검사한다.
const DSC = 'WOORISAIDesignSystem_e5e56b';

export const SPACES_MARKUP = [
  // 1) 추억 탭의 '우리 공간' 보기(달력 보기 앞에 끼움)
  ['          <sc-if value="{{ viewCal }}" hint-placeholder-val="{{ false }}">',
`          <sc-if value="{{ viewSpace }}" hint-placeholder-val="{{ false }}">
            <sc-if value="{{ hasSpaces }}" hint-placeholder-val="{{ false }}">
              <div style="display:flex;flex-direction:column;gap:12px">
                <sc-for list="{{ spaceCards }}" as="sp" hint-placeholder-count="2">
                  <div onClick="{{ sp.open }}" role="button" aria-label="{{ sp.aria }}" style="cursor:pointer;display:flex;align-items:center;gap:12px;padding:16px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle)">
                    <span style="display:flex;flex-direction:column;gap:6px;min-width:0;flex:1">
                      <span style="font:var(--type-headline-1);color:var(--ws-color-fg-strong)">{{ sp.name }}</span>
                      <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">{{ sp.meta }}</span>
                      <x-import component-from-global-scope="${DSC}.ParticipantGroup" names="{{ sp.names }}" size="{{ 28 }}" hint-size="96px,28px"></x-import>
                    </span>
                    <lucide-icon name="chevron-right" size="20"></lucide-icon>
                  </div>
                </sc-for>
                <x-import component-from-global-scope="${DSC}.Button" style2="secondary" full-width="{{ true }}" label="우리 공간 만들기" on-click="{{ newSpace }}" hint-size="100%,48px"></x-import>
              </div>
            </sc-if>
            <sc-if value="{{ noSpaces }}" hint-placeholder-val="{{ false }}">
              <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:32px 20px;width:100%">
                <span style="display:grid;place-items:center;width:72px;height:72px;margin-bottom:16px;border-radius:50%;background:var(--ws-color-bg-recall-subtle);color:var(--ws-color-fg-brand)"><lucide-icon name="users-round" size="32"></lucide-icon></span>
                <div style="font:var(--type-headline-2);color:var(--ws-color-fg-strong)">아직 우리 공간이 없어요</div>
                <div style="margin:4px 0 20px;font:var(--type-label-1-read);color:var(--ws-color-fg-secondary);text-wrap:pretty">자주 함께하는 친구들과 공간을 만들면, 같이 쓰는 추억을 한곳에서 볼 수 있어요. 공간에 연결해도 추억은 직접 초대한 사람만 볼 수 있어요.</div>
                <x-import component-from-global-scope="${DSC}.Button" label="우리 공간 만들기" on-click="{{ newSpace }}" hint-size="160px,48px"></x-import>
              </div>
            </sc-if>
          </sc-if>

          <sc-if value="{{ viewCal }}" hint-placeholder-val="{{ false }}">`],

  // 2) 공간 상세 · 만들기/수정 화면(약속 만들기 화면 앞에 끼움)
  ['      <sc-if value="{{ isPlanForm }}" hint-placeholder-val="{{ false }}">',
`      <sc-if value="{{ isSpace }}" hint-placeholder-val="{{ false }}">
        <div data-screen-label="13 우리 공간" style="display:flex;flex-direction:column;gap:20px;padding:4px 20px 32px">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-left:-8px">
            <x-import component-from-global-scope="${DSC}.IconButton" icon1="{{ ic.chevronLeft }}" label="뒤로" on-click="{{ back }}" hint-size="44px,44px"></x-import>
            <x-import component-from-global-scope="${DSC}.Button" style2="ghost" size="sm" label="공간 설정" on-click="{{ openSpaceSet }}" hint-size="88px,36px"></x-import>
          </div>
          <h1 style="margin:0;font:var(--type-title-2);color:var(--ws-color-fg-strong);text-wrap:pretty">{{ sp.name }}</h1>
          <section style="display:flex;flex-direction:column;gap:12px;padding:16px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle)">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px">
              <h2 style="margin:0;font:var(--type-headline-1);color:var(--ws-color-fg-strong)">멤버 {{ sp.count }}명</h2>
              <x-import component-from-global-scope="${DSC}.Button" style2="secondary" size="sm" label="친구 초대하기" on-click="{{ editSpace }}" hint-size="112px,36px"></x-import>
            </div>
            <div style="display:flex;flex-direction:column">
              <sc-for list="{{ sp.rows }}" as="r" hint-placeholder-count="3">
                <div style="display:flex;align-items:center;gap:12px;min-height:48px">
                  <x-import component-from-global-scope="${DSC}.Avatar" size="32" name="{{ r.nick }}" hint-size="32px,32px"></x-import>
                  <span style="flex:1;font:var(--type-body-1);color:var(--ws-color-fg-strong)">{{ r.nick }}</span>
                  <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">{{ r.role }}</span>
                </div>
              </sc-for>
            </div>
          </section>
          <section style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;flex-direction:column;gap:2px">
              <h2 style="margin:0;font:var(--type-headline-1);color:var(--ws-color-fg-strong)">볼 수 있는 추억 {{ sp.memCount }}개</h2>
              <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary);text-wrap:pretty">공간 멤버라도 초대받은 추억만 볼 수 있어요. 이 목록에는 내가 볼 수 있는 추억만 보여요.</span>
            </div>
            <sc-for list="{{ sp.mems }}" as="m" hint-placeholder-count="2">
              <div onClick="{{ m.open }}" role="button" style="cursor:pointer;display:flex;align-items:center;gap:12px;padding:12px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle)">
                <span style="position:relative;width:64px;height:64px;flex:none;border-radius:var(--ws-radius-small);overflow:hidden;background:var(--ws-color-bg-recall-subtle)"><img src="{{ m.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></span>
                <span style="display:flex;flex-direction:column;gap:3px;min-width:0;flex:1">
                  <span style="font:var(--type-headline-2);color:var(--ws-color-fg-strong)">{{ m.title }}</span>
                  <span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">{{ m.meta }}</span>
                </span>
                <lucide-icon name="chevron-right" size="20"></lucide-icon>
              </div>
            </sc-for>
            <sc-if value="{{ sp.noMems }}" hint-placeholder-val="{{ false }}">
              <span style="font:var(--type-body-2-read);color:var(--ws-color-fg-tertiary)">아직 이 공간에서 볼 수 있는 추억이 없어요.</span>
            </sc-if>
          </section>
        </div>
      </sc-if>

      <sc-if value="{{ isSpaceForm }}" hint-placeholder-val="{{ false }}">
        <div data-screen-label="14 우리 공간 만들기" style="display:flex;flex-direction:column;gap:22px;padding:4px 20px 24px">
          <div style="margin-left:-8px"><x-import component-from-global-scope="${DSC}.IconButton" icon1="{{ ic.close }}" label="닫기" on-click="{{ back }}" hint-size="44px,44px"></x-import></div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <h1 style="margin:0;font:var(--type-title-2);color:var(--ws-color-fg-strong)">{{ spHeading }}</h1>
            <p style="margin:0;font:var(--type-body-2-read);color:var(--ws-color-fg-secondary);text-wrap:pretty">자주 함께하는 친구들을 한곳에 묶어 둬요.</p>
          </div>
          <x-import component-from-global-scope="${DSC}.TextField" label="공간 이름" placeholder="예: 성수 친구들" value="{{ spf.name }}" on-change="{{ spfName }}" error="{{ spfNameErr }}" dc-props="{{ fullW }}" hint-size="100%,72px"></x-import>
          <div style="display:flex;flex-direction:column;gap:8px">
            <span style="font:var(--type-label-1);color:var(--ws-color-fg-strong)">함께할 친구 (선택)</span>
            <div style="display:flex;flex-wrap:wrap;gap:8px">
              <sc-for list="{{ spfPeople }}" as="p" hint-placeholder-count="6">
                <x-import component-from-global-scope="${DSC}.FilterChip" label="{{ p.nick }}" selected="{{ p.selected }}" on-change="{{ p.toggle }}" hint-size="64px,36px"></x-import>
              </sc-for>
            </div>
          </div>
          <x-import component-from-global-scope="${DSC}.InlineMessage" tone="info" text2="{{ spNote }}" dc-props="{{ fullW }}" hint-size="100%,64px"></x-import>
        </div>
      </sc-if>

      <sc-if value="{{ isPlanForm }}" hint-placeholder-val="{{ false }}">`],

  // 3) 공간 설정 바텀시트(로그인 안내 시트 앞에 끼움)
  ['    <sc-if value="{{ sheetAuth }}" hint-placeholder-val="{{ false }}">',
`    <sc-if value="{{ sheetSpaceSet }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;left:0;right:0;bottom:0;z-index:30">
        <x-import component-from-global-scope="${DSC}.BottomSheet" title="공간 설정" dc-props="{{ fullW }}" hint-size="100%,260px">
          <div style="display:flex;flex-direction:column;gap:12px">
            <x-import component-from-global-scope="${DSC}.Button" style2="secondary" full-width="{{ true }}" label="이름 바꾸기" on-click="{{ editSpace }}" hint-size="100%,48px"></x-import>
            <x-import component-from-global-scope="${DSC}.Button" style2="secondary" full-width="{{ true }}" label="공간 삭제하기" on-click="{{ spaceDelete }}" hint-size="100%,48px"></x-import>
            <p style="margin:0;font:var(--type-label-1-read);color:var(--ws-color-fg-secondary);text-wrap:pretty">공간만 사라지고, 연결된 추억은 그대로 남아요.</p>
          </div>
        </x-import>
      </div>
    </sc-if>

    <sc-if value="{{ sheetAuth }}" hint-placeholder-val="{{ false }}">`]
];

// 로직(렌더 값·동작). 모두 '원본에 정확히 1번 있는 문자열'(또는 앞선 패치가 만든 문자열)을 기준으로 치환한다.
export const SPACES_LOGIC = [
  // 보기 옵션에 '우리 공간' 추가
  ["viewOptions: [{ value: 'feed', label: '피드' }, { value: 'cal', label: '달력' }]", "viewOptions: [{ value: 'feed', label: '피드' }, { value: 'cal', label: '달력' }, { value: 'space', label: '우리 공간' }]"],
  ["viewFeed: s.mView === 'feed', viewCal: s.mView === 'cal',", "viewFeed: s.mView === 'feed', viewCal: s.mView === 'cal', viewSpace: s.mView === 'space',"],
  // 계산 값(상세·목록·폼)
  ['    // plan detail & form\n',
`    // 우리 공간(P1): 목록·상세·만들기/수정. 공간은 권한을 주지 않는다(추억 열람은 추억별 참여자만).
    const spaces = guest ? [] : s.spaces, isSpace = !!(top && top.t === 'space'), isSpaceForm = !!(top && top.t === 'spaceForm');
    const spRaw = isSpace ? s.spaces.find(x => x.id === top.id) : null, spf = s.spf || { id: null, name: '', members: []};
    const spaceOf = id => s.spaces.find(x => x.id === id), linkedOf = id => all.filter(m => m.space === id);
    const spaceRest = (c.space && spaceOf(c.space)) ? spaceOf(c.space).members.filter(n => !(c.with || []).includes(n)) : [];
    const spaceCards = spaces.map(x => ({ name: x.name, names: [ME, ...x.members], meta: '멤버 ' + (x.members.length + 1) + '명 · 볼 수 있는 추억 ' + linkedOf(x.id).length + '개', aria: '우리 공간, ' + x.name, open: () => { ev('space_view'); this.push({ t: 'space', id: x.id }); } }));
    const sp = spRaw ? (() => { const L = linkedOf(spRaw.id); return { name: spRaw.name, count: spRaw.members.length + 1, rows: [{ nick: ME, role: '소유자' }, ...spRaw.members.map(n => ({ nick: n, role: '멤버' }))], memCount: L.length, noMems: L.length === 0, mems: L.map(m => ({ title: m.title, img: m.img, meta: m.dateShort + ' · ' + m.withShort, open: m.open })) }; })() : {};
    const setSpf = p => this.setState(st => ({ spf: { ...st.spf, ...p } }));
    const openSpaceForm = x => this.setState(st => ({ stack: [...st.stack, { t: 'spaceForm', id: x ? x.id : 'new' }], overlay: null, spTried: false, spf: x ? { id: x.id, name: x.name, members: [...x.members] } : { id: null, name: '', members: [] } }));
    const saveSpace = () => {
      if (!spf.name.trim()) { this.setState({ spTried: true }); this.say('공간 이름을 입력해 주세요.', 'warning'); return; }
      if (spf.id) { this.setState(st => ({ spaces: st.spaces.map(x => x.id === spf.id ? { ...x, name: spf.name.trim(), members: spf.members } : x), stack: st.stack.slice(0, -1) })); ev('space_update', { members: spf.members.length }); this.say('우리 공간을 저장했어요.', 'success'); return; }
      const id = 'sp' + Date.now();
      this.setState(st => ({ spaces: [...st.spaces, { id, name: spf.name.trim(), members: spf.members }], stack: [...st.stack.slice(0, -1), { t: 'space', id }], spTried: false }));
      ev('space_create', { members: spf.members.length }); this.say('우리 공간을 만들었어요. 공간 멤버를 추억에 자동으로 초대하지는 않아요.', 'success');
    };
    // plan detail & form
`],
  // 하단 CTA: 공간 상세/폼
  ['    if (isPlanForm) bar = {', "    if (isSpaceForm) bar = { label: spf.id ? '저장하기' : '우리 공간 만들기', action: saveSpace };\n    else if (isSpace && spRaw) bar = { label: '이 공간에 추억 만들기', action: () => this.openCreate(undefined, { space: spRaw.id }) };\n    else if (isPlanForm) bar = {"],
  // 반환 값
  ["sheetCancel: s.overlay === 'cancelPlan' && !!pRaw,",
   "sheetCancel: s.overlay === 'cancelPlan' && !!pRaw,\n      hasSpaces: spaces.length > 0, noSpaces: spaces.length === 0, spaceCards, isSpace, isSpaceForm, sp, spf, spHeading: spf.id ? '공간 수정' : '우리 공간 만들기',\n      newSpace: () => guest ? this.gate('create', { do: 'create' }) : (ev('space_create_start'), openSpaceForm(null)),\n      editSpace: () => openSpaceForm(spRaw), openSpaceSet: () => this.setState({ overlay: 'spaceSet' }), sheetSpaceSet: s.overlay === 'spaceSet' && !!spRaw,\n      spaceDelete: () => { const id = spRaw.id; this.setState(st => ({ spaces: st.spaces.filter(x => x.id !== id), mems: st.mems.map(m => m.space === id ? { ...m, space: null } : m), overlay: null, stack: st.stack.slice(0, -1) })); ev('space_delete'); this.say('우리 공간을 삭제했어요. 연결된 추억은 그대로예요.'); },\n      spfName: e => setSpf({ name: e.target.value }), spfNameErr: s.spTried && !spf.name.trim() ? '공간 이름을 입력해 주세요.' : undefined,\n      spfPeople: s.friends.map(p => ({ nick: p, selected: spf.members.includes(p), toggle: () => this.setState(st => ({ spf: { ...st.spf, members: st.spf.members.includes(p) ? st.spf.members.filter(x => x !== p) : [...st.spf.members, p] } })) })),\n      spNote: spf.id ? '멤버를 바꿔도 이미 만든 추억의 참여자는 바뀌지 않아요.' : '공간은 친구를 묶어 두는 곳이에요. 공간에 연결해도 추억은 직접 고른 사람만 볼 수 있어요.',"],
  // 추억 만들기: 공간 연결(자동 초대 없음) · 후보 표시 · 안내 문구
  ["const m = { id, t: c.title.trim(),", "const m = { id, space: c.space || null, t: c.title.trim(),"],
  ["cPeople: s.friends.map(p => ({ nick: p, selected:", "cPeople: s.friends.map(p => ({ nick: p + ((spaceOf(c.space) || { members: [] }).members.includes(p) ? ' · 공간' : ''), selected:"],
  ["scopeNote: (c.with || []).length ? (c.with.join(', ') + '에게 초대를 보내요. 수락한 사람만 볼 수 있어요.') : '아직 초대한 사람이 없어요. 저장하면 나만 볼 수 있고, 나중에 초대할 수 있어요.',",
   "scopeNote: (c.space && spaceOf(c.space) ? '‘' + spaceOf(c.space).name + '’ 공간에 연결돼요. 공간 멤버를 자동으로 초대하지 않아요. ' : '') + ((c.with || []).length ? (c.with.join(', ') + '에게 초대를 보내요. 수락한 사람만 볼 수 있어요.') : '아직 초대한 사람이 없어요. 저장하면 나만 볼 수 있고, 나중에 초대할 수 있어요.'),"],
  ["confirmNote: (c.with || []).length ? '위에 적힌 사람만 볼 수 있어요. 초대받은 사람이 수락하면 사진과 글을 함께 남길 수 있어요.' : '지금은 나만 볼 수 있어요. 저장한 뒤 참여자에서 친구를 초대할 수 있어요.',",
   "confirmNote: ((c.space && spaceOf(c.space)) ? '‘' + spaceOf(c.space).name + '’에 연결돼요.' + (spaceRest.length ? ' 공간 멤버 ' + spaceRest.join(', ') + '님은 초대하지 않아서 볼 수 없어요. ' : ' ') : '') + ((c.with || []).length ? '위에 적힌 사람만 볼 수 있어요. 초대받은 사람이 수락하면 사진과 글을 함께 남길 수 있어요.' : '지금은 나만 볼 수 있어요. 저장한 뒤 참여자에서 친구를 초대할 수 있어요.'),"],
  // 상태 초기값·저장
  ["    mems: SEEDS.mems, invite: SEEDS.invite, friends: SEEDS.friends,", "    mems: SEEDS.mems, invite: SEEDS.invite, friends: SEEDS.friends, spaces: SEEDS.spaces, spf: null, spTried: false,"]
];
