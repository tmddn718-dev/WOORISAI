// 사진별 기억 이어가기와 대한민국 사진 마커 지도. 원본 화면을 유지하면서 필요한 마크업·상태만 치환한다.

const MAP_OLD = `          <div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px 4px;padding:16px 6px;border-radius:var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle)">
            <sc-for list="{{ stamps }}" as="r" hint-placeholder-count="17">
              <button onClick="{{ r.pick }}" aria-label="{{ r.aria }}" style="display:flex;flex-direction:column;align-items:center;gap:5px;border:0;background:none;padding:0;cursor:pointer;font-family:var(--ws-font-product)">
                <span style="position:relative;width:52px;height:52px;border-radius:9999px;overflow:hidden;display:grid;place-items:center;border:{{ r.border }};background:{{ r.bg }};font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">
                  {{ r.initial }}
                  <sc-if value="{{ r.has }}" hint-placeholder-val="{{ false }}"><img src="{{ r.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></sc-if>
                </span>
                <span style="min-height:16px;font:var(--type-caption-1);color:{{ r.capColor }}">{{ r.cap }}</span>
              </button>
            </sc-for>
          </div>`;

const MAP_NEW = `          <div role="img" aria-label="대한민국 지역별 추억 지도" style="position:relative;width:100%;max-width:430px;aspect-ratio:5/7;margin:0 auto;border-radius:var(--ws-radius-card);overflow:hidden;background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle)">
            <svg viewBox="0 0 300 420" aria-hidden="true" style="position:absolute;inset:5% 12% 3%;width:76%;height:92%;fill:var(--ws-color-bg-brand-subtle);stroke:var(--ws-color-border-default);stroke-width:1.5"><path d="M132 18c34 8 65 38 72 75 5 28-9 51 1 80 7 22 28 43 20 72-8 31-38 45-52 72-11 22-15 62-42 68-24 5-47-22-50-47-4-32 16-55 9-84-7-28-34-52-26-85 7-30 35-40 43-65 10-31 3-75 35-86Z"/><path d="M54 395c18-10 45-10 66 0-15 18-49 21-66 0Z"/></svg>
            <sc-for list="{{ mapMarkers }}" as="r" hint-placeholder-count="17">
              <button onClick="{{ r.pick }}" aria-label="{{ r.aria }}" style="position:absolute;left:{{ r.x }}%;top:{{ r.y }}%;transform:translate(-50%,-50%);z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;min-width:44px;min-height:44px;border:0;background:none;padding:0;cursor:{{ r.cursor }};font-family:var(--ws-font-product)">
                <span style="position:relative;width:{{ r.size }}px;height:{{ r.size }}px;border-radius:9999px;overflow:hidden;display:grid;place-items:center;border:{{ r.border }};background:{{ r.bg }};font:var(--type-caption-1);color:var(--ws-color-fg-tertiary);box-shadow:{{ r.shadow }}">
                  {{ r.initial }}
                  <sc-if value="{{ r.has }}" hint-placeholder-val="{{ false }}"><img src="{{ r.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></sc-if>
                </span>
                <sc-if value="{{ r.has }}" hint-placeholder-val="{{ false }}"><span style="position:absolute;right:-2px;top:-4px;min-width:20px;height:20px;padding:0 5px;display:grid;place-items:center;border-radius:9999px;background:var(--ws-color-bg-brand);border:2px solid #fff;color:#fff;font:var(--type-caption-1)">{{ r.count }}</span></sc-if>
                <span style="padding:1px 4px;border-radius:4px;background:rgba(250,249,246,.88);font:var(--type-caption-1);color:var(--ws-color-fg-secondary);white-space:nowrap">{{ r.name }}</span>
              </button>
            </sc-for>
          </div>`;

const PHOTO_OLD = `          </div>
          <div style="display:flex;flex-direction:column;gap:8px;padding:0 20px">`;
const PHOTO_NEW = `          </div>
          <sc-if value="{{ cur.hasFocusPhoto }}" hint-placeholder-val="{{ true }}">
            <div style="margin:-8px 20px 0;display:flex;flex-direction:column;gap:10px;padding:14px 16px 16px;border-radius:0 0 var(--ws-radius-card) var(--ws-radius-card);background:var(--ws-color-bg-surface);border:1px solid var(--ws-color-border-subtle);border-top:0">
              <div style="display:flex;align-items:center;flex-wrap:wrap;gap:6px 12px;font:var(--type-label-2);color:var(--ws-color-fg-secondary)"><span style="display:flex;align-items:center;gap:4px"><lucide-icon name="message-square-plus" size="16"></lucide-icon>댓글 {{ cur.threadCommentCount }}</span><span style="display:flex;align-items:center;gap:4px"><lucide-icon name="heart" size="16"></lucide-icon>반응 {{ cur.threadReactionCount }}</span><span style="margin-left:auto">{{ cur.threadReactionText }}</span></div>
              <sc-if value="{{ cur.threadHasPreview }}" hint-placeholder-val="{{ false }}"><div style="display:flex;flex-direction:column;gap:6px"><sc-for list="{{ cur.threadPreview }}" as="c" hint-placeholder-count="2"><p style="margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:var(--type-label-1-read);color:var(--ws-color-fg-default)"><b>{{ c.by }}</b> {{ c.text }}</p></sc-for></div></sc-if>
              <sc-if value="{{ cur.threadEmpty }}" hint-placeholder-val="{{ true }}"><p style="margin:0;font:var(--type-label-1-read);color:var(--ws-color-fg-tertiary)">이 사진에 이어진 기억이 아직 없어요.</p></sc-if>
              <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.Button" style2="secondary" full-width="{{ true }}" label="기억 이어가기" on-click="{{ cur.openThread }}" hint-size="100%,44px"></x-import>
            </div>
          </sc-if>
          <div style="display:flex;flex-direction:column;gap:8px;padding:0 20px">`;

const SHEETS_OLD = `    <sc-if value="{{ sheetContrib }}" hint-placeholder-val="{{ false }}">`;
const SHEETS_NEW = `    <sc-if value="{{ sheetRegionPeek }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;left:0;right:0;bottom:0;z-index:30">
        <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.BottomSheet" title="{{ regionPeek.name }}" dc-props="{{ fullW }}" hint-size="100%,420px">
          <div style="display:flex;flex-direction:column;gap:16px">
            <span style="font:var(--type-label-1-read);color:var(--ws-color-fg-secondary)">추억 {{ regionPeek.count }}개</span>
            <div style="display:flex;flex-direction:column;gap:10px"><sc-for list="{{ regionPeek.list }}" as="m" hint-placeholder-count="2"><button onClick="{{ m.open }}" style="display:grid;grid-template-columns:64px minmax(0,1fr) 44px;align-items:center;gap:12px;padding:10px;border-radius:var(--ws-radius-card);border:1px solid var(--ws-color-border-subtle);background:var(--ws-color-bg-surface);font-family:var(--ws-font-product);text-align:left;cursor:pointer"><span style="position:relative;width:64px;height:64px;border-radius:var(--ws-radius-small);overflow:hidden"><img src="{{ m.img }}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></span><span style="min-width:0;display:flex;flex-direction:column;gap:3px"><b style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:var(--type-headline-2);color:var(--ws-color-fg-strong)">{{ m.title }}</b><span style="font:var(--type-label-2);color:var(--ws-color-fg-tertiary)">{{ m.rangeShort }}</span></span><lucide-icon name="chevron-right" size="20"></lucide-icon></button></sc-for></div>
            <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.Button" full-width="{{ true }}" label="전체 추억 보기" on-click="{{ regionPeek.openAll }}" hint-size="100%,48px"></x-import>
          </div>
        </x-import>
      </div>
    </sc-if>

    <sc-if value="{{ sheetThread }}" hint-placeholder-val="{{ false }}">
      <div style="position:absolute;left:0;right:0;bottom:0;z-index:30">
        <x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.BottomSheet" title="기억 이어가기" dc-props="{{ fullW }}" hint-size="100%,650px">
          <div style="display:flex;flex-direction:column;gap:16px">
            <p style="margin:0;font:var(--type-caption-1);color:var(--ws-color-fg-tertiary)">이 사진을 함께 보는 사람만 대화를 볼 수 있어요.</p>
            <div style="display:flex;gap:8px;overflow-x:auto"><sc-for list="{{ threadReactions }}" as="r" hint-placeholder-count="5"><button onClick="{{ r.toggle }}" aria-pressed="{{ r.on }}" aria-label="{{ r.aria }}" style="min-width:48px;min-height:44px;padding:0 10px;border-radius:9999px;border:{{ r.border }};background:{{ r.bg }};font:var(--type-body-1);cursor:pointer">{{ r.emoji }} <span style="font:var(--type-caption-1);color:var(--ws-color-fg-secondary)">{{ r.count }}</span></button></sc-for></div>
            <div style="display:flex;flex-direction:column;gap:10px;max-height:240px;overflow:auto">
              <sc-for list="{{ threadRows }}" as="c" hint-placeholder-count="3"><div style="margin-left:{{ c.indent }}px;padding:12px 14px;border-radius:var(--ws-radius-control);background:var(--ws-color-bg-surface-muted);border-left:{{ c.border }}"><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><span><b style="font:var(--type-label-1);color:var(--ws-color-fg-strong)">{{ c.by }}</b> <span style="font:var(--type-caption-1);color:var(--ws-color-fg-tertiary)">{{ c.at }}</span></span><button onClick="{{ c.remove }}" style="min-height:32px;border:0;background:none;font:var(--type-caption-1);color:var(--ws-color-fg-secondary);cursor:pointer">삭제</button></div><p style="margin:6px 0 0;font:var(--type-body-2-read);color:var(--ws-color-fg-default);white-space:pre-wrap">{{ c.text }}</p><sc-if value="{{ c.hasPhoto }}" hint-placeholder-val="{{ false }}"><img src="{{ c.photo }}" alt="댓글에 첨부한 사진" style="display:block;width:min(100%,220px);max-height:180px;margin-top:8px;border-radius:var(--ws-radius-small);object-fit:cover"></sc-if><button onClick="{{ c.reply }}" style="display:block;margin:4px -6px -6px auto;min-height:32px;padding:0 6px;border:0;background:none;font:var(--type-caption-1);color:var(--ws-color-fg-secondary);cursor:pointer">답글</button></div></sc-for>
              <sc-if value="{{ threadEmpty }}" hint-placeholder-val="{{ true }}"><p style="margin:12px 0;text-align:center;font:var(--type-label-1-read);color:var(--ws-color-fg-tertiary)">이 사진에서 떠오르는 기억을 먼저 남겨보세요.</p></sc-if>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;border-top:1px solid var(--ws-color-border-subtle);padding-top:14px"><span style="font:var(--type-label-1);color:var(--ws-color-fg-strong)">{{ threadInputLabel }}</span><textarea value="{{ threadDraft }}" onChange="{{ threadDraftChange }}" maxlength="500" placeholder="이 사진에서 기억나는 순간을 남겨보세요" style="width:100%;min-height:80px;padding:12px 14px;resize:none;border:1px solid var(--ws-color-border-default);border-radius:var(--ws-radius-control);background:var(--ws-color-bg-surface);font:var(--type-body-2-read);font-family:var(--ws-font-product);color:var(--ws-color-fg-strong)"></textarea><label style="position:relative;display:flex;align-items:center;justify-content:center;width:max-content;min-height:44px;padding:0 14px;border:1px solid var(--ws-color-border-default);border-radius:var(--ws-radius-control);font:var(--type-label-2);cursor:pointer"><input type="file" accept="image/*" onChange="{{ threadFile }}" style="position:absolute;width:1px;height:1px;opacity:0">사진 첨부</label><sc-if value="{{ threadHasPhoto }}" hint-placeholder-val="{{ false }}"><img src="{{ threadPhoto }}" alt="첨부할 사진 미리보기" style="width:88px;height:88px;border-radius:var(--ws-radius-small);object-fit:cover"></sc-if><x-import component-from-global-scope="WOORISAIDesignSystem_e5e56b.Button" full-width="{{ true }}" label="남기기" on-click="{{ threadSubmit }}" hint-size="100%,48px"></x-import></div>
          </div>
        </x-import>
      </div>
    </sc-if>

    <sc-if value="{{ sheetContrib }}" hint-placeholder-val="{{ false }}">`;

export const MEMORY_MARKUP = [[MAP_OLD, MAP_NEW], [PHOTO_OLD, PHOTO_NEW], [SHEETS_OLD, SHEETS_NEW]];

export const MEMORY_LOGIC = [
  ["const REGIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];", "const REGIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];\nconst REGION_POS = { 서울:[33,24], 인천:[13,31], 경기:[44,39], 강원:[69,23], 충북:[55,43], 세종:[38,49], 충남:[23,51], 대전:[43,57], 경북:[72,50], 대구:[66,62], 전북:[37,65], 광주:[25,73], 전남:[27,81], 경남:[55,73], 부산:[77,75], 울산:[81,65], 제주:[23,94] };"],
  ["    toast: null, toastTone: 'neutral', compact: false", "    toast: null, toastTone: 'neutral', compact: false, threads: SEEDS.threads || {}, threadPhotoId: '', threadDraft: '', threadPhoto: '', threadParent: null, threadReplyName: '', peekRegion: ''"],
  ["\n\n    // detail\n    const curRaw", "\n    const mapMarkers = REGIONS.map((r, i) => ({ ...stamps[i], name: r, x: REGION_POS[r][0], y: REGION_POS[r][1], count: rc[r] || 0, size: rc[r] ? 48 : 18, cursor: rc[r] ? 'pointer' : 'default', shadow: rc[r] ? '0 0 0 2px var(--ws-color-border-brand),0 4px 12px rgba(86,107,92,.2)' : 'none' }));\n\n    // detail\n    const curRaw"],
  ["const mk = (list, key) => list.map((p, i) => ({ src: U(p.id), alt:", "const mk = (list, key) => list.map((p, i) => ({ id: String(p.id), src: U(p.id), alt:"],
  ["      const topIdx = Math.min(s.gIdx[topKey] || 0, Math.max(0, flat.length - 1));\n      cur = {", "      const topIdx = Math.min(s.gIdx[topKey] || 0, Math.max(0, flat.length - 1));\n      const focusPhoto = flat[topIdx], focusId = focusPhoto ? String(focusPhoto.id) : '', threadRaw = { comments: [], reactions: {}, ...((s.threads || {})[focusId] || {}) };\n      const preview = threadRaw.comments.slice(-2).map(c => ({ by: c.by, text: c.text || '사진을 남겼어요.' })), reactionCount = Object.values(threadRaw.reactions).reduce((n, v) => n + (+v || 0), 0);\n      cur = {"],
  ["        all: mk(flat, topKey), topKey, topMulti: flat.length > 1, topPos: topIdx + 1, allCount: flat.length, topScroll: this.galScroll(topKey),", "        all: mk(flat, topKey), topKey, topMulti: flat.length > 1, topPos: topIdx + 1, allCount: flat.length, topScroll: this.galScroll(topKey), hasFocusPhoto: !!focusId, threadCommentCount: threadRaw.comments.length, threadReactionCount: reactionCount, threadReactionText: Object.entries(threadRaw.reactions).filter(([,n]) => n).map(([e,n]) => e + ' ' + n).join(' · '), threadPreview: preview, threadHasPreview: preview.length > 0, threadEmpty: preview.length === 0, openThread: () => guest ? this.gate('contrib', { do: 'contrib', id: curRaw.id }) : this.openThread(focusId),"],
  ["\n\n    // create\n    const c =", "\n    const peekList = s.peekRegion ? footBase.filter(m => m.r === s.peekRegion).map(m => ({ ...dec(m), open: () => this.setState(st => ({ overlay: null, stack: [...st.stack, { t: 'detail', id: m.id }] })) })) : [];\n    const regionPeek = { name: s.peekRegion, count: peekList.length, list: peekList.slice(0, 2), openAll: () => { ev('region_view'); this.setState(st => ({ overlay: null, stack: [...st.stack, { t: 'region', id: s.peekRegion }] })); } };\n\n    // create\n    const c ="],
  ["      cur, region,", "      cur, region, regionPeek, mapMarkers,"],
  ["      sheetAuth: s.overlay === 'auth', sheetMembers: s.overlay === 'members' && !!curRaw, sheetContrib: s.overlay === 'contrib' && !!curRaw,", "      sheetAuth: s.overlay === 'auth', sheetMembers: s.overlay === 'members' && !!curRaw, sheetContrib: s.overlay === 'contrib' && !!curRaw, sheetThread: s.overlay === 'thread', sheetRegionPeek: s.overlay === 'regionPeek' && !!s.peekRegion,"],
  ["      kText: s.kText, onKText: e => this.setState({ kText: e.target.value }), kEmpty: !s.kPics.length && !s.kText.trim(), kSubmit,", "      kText: s.kText, onKText: e => this.setState({ kText: e.target.value }), kEmpty: !s.kPics.length && !s.kText.trim(), kSubmit,\n      threadRows: (((s.threads || {})[s.threadPhotoId] || {}).comments || []).map(c => ({ ...c, indent: c.parent ? 24 : 0, border: c.parent ? '2px solid var(--ws-color-border-brand)' : '0', hasPhoto: !!c.photo, remove: () => this.threadDelete(c.id), reply: () => this.threadReply(c.id, c.by) })), threadEmpty: !(((s.threads || {})[s.threadPhotoId] || {}).comments || []).length, threadReactions: ['❤️','😊','😂','🥹','👏'].map(e => { const n = +((((s.threads || {})[s.threadPhotoId] || {}).reactions || {})[e] || 0); return { emoji:e, count:n || '', on:!!n, aria:e + ' 반응 ' + n + '개', border:n ? '1px solid var(--ws-color-border-brand)' : '1px solid var(--ws-color-border-default)', bg:n ? 'var(--ws-color-bg-brand-subtle)' : 'var(--ws-color-bg-surface)', toggle:() => this.threadReact(e) }; }), threadDraft:s.threadDraft, threadDraftChange:e => this.setState({threadDraft:e.target.value}), threadFile:e => this.threadFile(e), threadHasPhoto:!!s.threadPhoto, threadPhoto:s.threadPhoto, threadInputLabel:s.threadParent ? (s.threadReplyName + '님에게 답글') : '짧은 기억', threadSubmit:() => this.threadSubmit(),"],
];
