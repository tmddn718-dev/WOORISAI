// P0 (약속 시간·장소 상태 + 사진 확대 미리보기). Claude Design 에 없는 새 입력이라 기존 디자인 시스템 컴포넌트(FilterChip·TextField)와 같은 간격·타이포 토큰만 쓴다.
// 마크업 치환은 build.mjs 가 되돌려 원본과 같은지 검사한다(모두 '교체' 형태라 원본 문자열이 그대로 복원돼야 한다).
const DSC = 'WOORISAIDesignSystem_e5e56b';
const chip = (list, label = 'k') => `<div style="display:flex;flex-wrap:wrap;gap:8px"><sc-for list="{{ ${list} }}" as="${label}" hint-placeholder-count="4"><x-import component-from-global-scope="${DSC}.FilterChip" label="{{ ${label}.label }}" selected="{{ ${label}.selected }}" on-change="{{ ${label}.pick }}" hint-size="88px,36px"></x-import></sc-for></div>`;
const LBL = 'display:flex;flex-direction:column;gap:6px;font:var(--type-label-1);color:var(--ws-color-fg-strong)';
const HEAD = 'font:var(--type-label-1);color:var(--ws-color-fg-strong)';
const CAP = 'font:var(--type-caption-1);color:var(--ws-color-fg-secondary)';

export const P0_MARKUP = [
  // 날짜는 한 줄 전체로, 그 아래에 시간 상태 선택
  [`<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px">\n            <label style="${LBL}">날짜`,
   `<div style="display:grid;grid-template-columns:minmax(0,1fr);gap:12px">\n            <label style="${LBL}">날짜`],
  [`            <label style="${LBL}">시간\n              <input type="time"`,
   `            <div style="display:flex;flex-direction:column;gap:8px"><span style="${HEAD}">시간</span>${chip('pfTimeKinds')}<span style="${CAP}">시간은 나중에 정해도 괜찮아요.</span></div>\n            <sc-if value="{{ pfTimeExact }}" hint-placeholder-val="{{ true }}">\n            <label style="${LBL}"><span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">시간 입력</span>\n              <input type="time"`],
  [`<span style="font:var(--type-caption-1);color:var(--ws-color-fg-danger)">시간을 골라 주세요.</span></sc-if>\n            </label>\n          </div>\n          <x-import component-from-global-scope="${DSC}.TextField" label="장소 (선택)" placeholder="정하지 않았다면 비워 두세요" value="{{ pf.place }}" on-change="{{ pfPlace }}" dc-props="{{ fullW }}" hint-size="100%,72px"></x-import>`,
   `<span style="font:var(--type-caption-1);color:var(--ws-color-fg-danger)">시간을 입력하거나, 오전쯤·오후쯤·아직 미정을 골라 주세요.</span></sc-if>\n            </label>\n            </sc-if>\n          </div>\n          <div style="display:flex;flex-direction:column;gap:8px"><span style="${HEAD}">장소</span>${chip('pfPlaceKinds')}<sc-if value="{{ pfPlaceOn }}" hint-placeholder-val="{{ false }}"><x-import component-from-global-scope="${DSC}.TextField" label="{{ pfPlaceLabel }}" placeholder="{{ pfPlacePh }}" value="{{ pf.place }}" on-change="{{ pfPlace }}" error="{{ pfPlaceErr }}" dc-props="{{ fullW }}" hint-size="100%,72px"></x-import></sc-if><span style="${CAP}">장소도 나중에 정해서 바꿀 수 있어요.</span></div>`],
];

export const P0_LOGIC = [
  // 시간·장소 상태 헬퍼(정렬: 같은 날 정확한 시간 → 오전 → 오후 → 미정)
  ["const ft = t => {", "const TKL = { am: '오전쯤', pm: '오후쯤', tbd: '시간 미정' };\nconst tkText = p => !p.tk || p.tk === 'exact' ? ft(p.time) : TKL[p.tk];\nconst sortKey = p => !p.tk || p.tk === 'exact' ? p.time : { am: '~1', pm: '~2', tbd: '~3' }[p.tk];\nconst ft = t => {"],
  ["date: keyToIso(p.d), time: p.time, place: p.place || '',", "date: keyToIso(p.d), time: p.time, tk: p.tk || 'exact', pk: p.pk || (p.place ? 'exact' : 'tbd'), place: p.place || '',"],
  ["date ? keyToIso(date) : '', time: '', place: '', inv: [], memo: '' }", "date ? keyToIso(date) : '', time: '', tk: 'exact', pk: 'tbd', place: '', inv: [], memo: '' }"],
  ["const pf = s.pf || { title: '', date: '', time: '', place: '', inv: [], memo: '' };", "const pf = s.pf || { title: '', date: '', time: '', tk: 'exact', pk: 'tbd', place: '', inv: [], memo: '' };"],
  ["if (!pf.title.trim() || !pf.date || !pf.time) { this.setState({ pfTried: true }); this.say('제목, 날짜, 시간을 입력해 주세요.', 'warning'); return; }",
   "const tk = pf.tk || 'exact', pk = pf.pk || 'tbd';\n      if (!pf.title.trim() || !pf.date || (tk === 'exact' && !pf.time) || (pk !== 'tbd' && !pf.place.trim())) { this.setState({ pfTried: true }); this.say('제목, 날짜, 시간·장소를 확인해 주세요.', 'warning'); return; }"],
  ["const d = isoToKey(pf.date), dt = pd(d), place = pf.place.trim();", "const d = isoToKey(pf.date), dt = pd(d), place = pk === 'tbd' ? '' : pf.place.trim(), time = tk === 'exact' ? pf.time : '';"],
  ["const tc = old.d !== d || old.time !== pf.time, pc = (old.place || '') !== place;", "const tc = old.d !== d || old.time !== time || (old.tk || 'exact') !== tk, pc = (old.place || '') !== place;"],
  ["{ ...p, t: pf.title.trim(), d, time: pf.time, place,", "{ ...p, t: pf.title.trim(), d, time, tk, pk, place,"],
  ["{ id, t: pf.title.trim(), d, time: pf.time, place, host: ME,", "{ id, t: pf.title.trim(), d, time, tk, pk, place, host: ME,"],
  ["timeText: ft(p.time),\n        placeText: p.place || '장소 미정',", "timeText: tkText(p),\n        placeText: p.place ? p.place + (p.pk === 'area' ? ' (지역만)' : '') : '장소 미정',"],
  ["dt.d + '일 ' + ft(p.time) + ', '", "dt.d + '일 ' + tkText(p) + ', '"],
  ["(a.d + a.time).localeCompare(b.d + b.time)", "(a.d + sortKey(a)).localeCompare(b.d + sortKey(b))"],
  ["pfPlace: e => setPf({ place: e.target.value }),",
   `pfPlace: e => setPf({ place: e.target.value }),
      pfTimeExact: (pf.tk || 'exact') === 'exact',
      pfTimeKinds: [['exact', '정확한 시간'], ['am', '오전쯤'], ['pm', '오후쯤'], ['tbd', '아직 미정']].map(([k, label]) => ({ label, selected: (pf.tk || 'exact') === k, pick: () => setPf({ tk: k }) })),
      pfPlaceKinds: [['exact', '정확한 장소'], ['area', '지역만'], ['tbd', '아직 미정']].map(([k, label]) => ({ label, selected: (pf.pk || 'tbd') === k, pick: () => setPf({ pk: k }) })),
      pfPlaceOn: (pf.pk || 'tbd') !== 'tbd', pfPlaceLabel: pf.pk === 'area' ? '지역' : '장소 이름', pfPlacePh: pf.pk === 'area' ? '예: 성수, 홍대' : '예: 카페 이름',
      pfPlaceErr: s.pfTried && (pf.pk || 'tbd') !== 'tbd' && !pf.place.trim() ? (pf.pk === 'area' ? '지역을 입력해 주세요.' : '장소를 입력해 주세요.') : undefined,`],
];

// ---- 사진 확대 미리보기: 썸네일 본문 = 크게 보기, 모서리 원형 = 선택/해제. 크게 보기 안에서 좌우로 넘기며 선택할 수 있고, 닫아도 선택 상태는 그대로다.
const POOL_OLD = `<button onClick="{{ p.toggle }}" aria-label="{{ p.aria }}" style="position:relative;aspect-ratio:1;border:0;padding:0;border-radius:var(--ws-radius-small);overflow:hidden;cursor:pointer;background:var(--ws-color-bg-recall-subtle);outline:{{ p.ring }};outline-offset:-3px">
                  <img src="{{ p.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:{{ p.op }}">
                  <sc-if value="{{ p.selected }}" hint-placeholder-val="{{ false }}"><span style="position:absolute;top:6px;right:6px;width:22px;height:22px;border-radius:9999px;background:var(--ws-color-bg-brand);color:var(--ws-color-fg-on-brand);display:grid;place-items:center;font:var(--type-caption-1)">{{ p.order }}</span></sc-if>
                </button>`;
const POOL_NEW = `<div style="position:relative;aspect-ratio:1;border-radius:var(--ws-radius-small);overflow:hidden;background:var(--ws-color-bg-recall-subtle);outline:{{ p.ring }};outline-offset:-3px">
                  <button onClick="{{ p.view }}" aria-label="{{ p.viewAria }}" style="position:absolute;inset:0;width:100%;height:100%;border:0;padding:0;background:none;cursor:zoom-in"><img src="{{ p.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:{{ p.op }}"></button>
                  <button onClick="{{ p.toggle }}" aria-label="{{ p.aria }}" aria-pressed="{{ p.selected }}" style="position:absolute;top:0;right:0;width:40px;height:40px;border:0;padding:0;background:none;cursor:pointer;display:grid;place-items:center"><span style="width:22px;height:22px;border-radius:9999px;border:1.5px solid #fff;background:{{ p.chipBg }};color:var(--ws-color-fg-on-brand);display:grid;place-items:center;font:var(--type-caption-1)">{{ p.chipText }}</span></button>
                </div>`;
const PV = `    <sc-if value="{{ pvOpen }}" hint-placeholder-val="{{ false }}">
      <div role="dialog" aria-modal="true" aria-label="사진 크게 보기" style="position:absolute;inset:0;z-index:40;background:#242622;display:flex;flex-direction:column">
        <div style="flex:none;display:flex;align-items:center;padding:12px 20px;min-height:56px;color:#fff;font:var(--type-label-1)" aria-live="polite">{{ pvCount }}</div>
        <div data-gal="pv" onScroll="{{ pvScroll }}" class="ws-scroll" style="flex:1;min-height:0;display:flex;overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;scrollbar-width:none;overscroll-behavior:contain">
          <sc-for list="{{ pvList }}" as="v" hint-placeholder-count="3">
            <div style="flex:0 0 100%;height:100%;scroll-snap-align:start;scroll-snap-stop:always;display:flex;align-items:center;justify-content:center"><img src="{{ v.img }}" alt="" draggable="false" style="max-width:100%;max-height:100%;object-fit:contain"></div>
          </sc-for>
        </div>
        <div style="flex:none;display:flex;flex-direction:column;gap:12px;padding:12px 20px 24px;background:var(--ws-color-bg-surface)">
          <span style="font:var(--type-caption-1);color:var(--ws-color-fg-secondary)">{{ pvNote }}</span>
          <div style="display:flex;gap:8px">
            <div style="flex:1;display:flex"><x-import component-from-global-scope="${DSC}.Button" style2="secondary" full-width="{{ true }}" label="닫기" on-click="{{ pvClose }}" hint-size="100%,48px"></x-import></div>
            <div style="flex:1;display:flex"><x-import component-from-global-scope="${DSC}.Button" full-width="{{ true }}" label="{{ pvLabel }}" on-click="{{ pvToggle }}" hint-size="100%,48px"></x-import></div>
          </div>
        </div>
      </div>
    </sc-if>
`;
P0_MARKUP.push([POOL_OLD, POOL_NEW]);
P0_MARKUP.push(['    <sc-if value="{{ sheetCancel }}" hint-placeholder-val="{{ false }}">', PV + '    <sc-if value="{{ sheetCancel }}" hint-placeholder-val="{{ false }}">']);

P0_LOGIC.push(
  ["aria: i >= 0 ? '선택 해제' : '사진 선택',", "aria: i >= 0 ? '선택 해제' : '사진 선택', chipBg: i >= 0 ? 'var(--ws-color-bg-brand)' : 'rgba(36,38,34,.32)', chipText: i >= 0 ? String(i + 1) : '', viewAria: '사진 크게 보기', view: () => { const ids = [...this.state.devPics, ...POOL]; this._pvInit = true; this.setState({ pv: { ids, i: ids.indexOf(id) } }); },"],
  ["hasPicked: (c.pics || []).length > 0,", `hasPicked: (c.pics || []).length > 0,
      pvOpen: !!s.pv, pvCount: s.pv ? (s.pv.i + 1) + ' / ' + s.pv.ids.length : '', pvList: s.pv ? s.pv.ids.map(id => ({ img: U(id) })) : [],
      pvLabel: s.pv && (c.pics || []).includes(s.pv.ids[s.pv.i]) ? '선택 해제' : '선택하기',
      pvNote: s.pv ? ((c.pics || []).indexOf(s.pv.ids[s.pv.i]) >= 0 ? (c.pics.indexOf(s.pv.ids[s.pv.i]) + 1) + '번째로 선택한 사진이에요 · 총 ' + c.pics.length + '장' : '아직 고르지 않은 사진이에요 · 지금 ' + (c.pics || []).length + '장 선택') : '',
      pvScroll: e => { const el = e.currentTarget, n = Math.round(el.scrollLeft / el.clientWidth); if (this.state.pv && n !== this.state.pv.i) this.setState(st => ({ pv: { ...st.pv, i: n } })); },
      pvToggle: () => this.setState(st => { const id = st.pv.ids[st.pv.i], ps = st.c.pics || []; return { c: { ...st.c, pics: ps.includes(id) ? ps.filter(x => x !== id) : [...ps, id] } }; }),
      pvClose: () => this.setState({ pv: null }),`],
  ["    if (this._restore) { const r = this._restore;", "    if (this._pvInit && this.state.pv) { const el = document.querySelector('[data-gal=\"pv\"]'); if (el) { el.scrollLeft = this.state.pv.i * el.clientWidth; this._pvInit = false; } }\n    if (this._restore) { const r = this._restore;"],
);
