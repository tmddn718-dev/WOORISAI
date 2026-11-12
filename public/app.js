import { LUCIDE } from './lucide.js';
import { validateNickname, graphemes, suggest, NICK_MAX, NICK_HINT } from './nickname.js';
// 우리사이 웹 앱 — 바닐라 JS SPA. 권한은 서버가 판단하고, 여기서는 그 결과만 보여준다.
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = { me: null, draft: null, authMode: 'intro', filter: { people: [], mode: 'and', group: '', year: '', month: '', region: '', dim: 'all' }, join: null };

// 아이콘은 모두 Lucide 0.469.0 원본이다(public/lucide.js). 이름 매핑은 시안(Claude Design)이 쓰는 이름을 그대로 따른다.
const ICN = { home: 'house', photo: 'images', create: 'square-pen', pinned: 'map-pinned', user: 'user-round', back: 'chevron-left', chev: 'chevron-right', more: 'ellipsis', x: 'x', plus: 'plus', lock: 'lock-keyhole', users: 'users-round', invite: 'user-round-plus', cal: 'calendar-days', calplus: 'calendar-plus', cchk: 'calendar-check', cc: 'circle-check', cd: 'circle-dot', cx: 'circle-x', clock: 'clock', pin: 'map-pin', imgplus: 'image-plus', pen: 'message-square-plus', searchx: 'search-x', zin: 'zoom-in', zout: 'zoom-out', trash: 'trash-2', check: 'check',
  /* 시안에 없는 앱 전용 기능(좋아요·숨기기·신고 등)은 같은 Lucide 라이브러리의 대응 아이콘 */ heart: 'heart', eye: 'eye', flag: 'flag', down: 'download', out: 'log-out', link: 'link', list: 'list', bookmark: 'bookmark', block: 'ban', help: 'circle-dot', star: 'pencil' };
const KNOT = '<svg class="knot" viewBox="0 0 120 120" aria-hidden="true"><path d="M32 44 C32 33 44 28 53 36 L60 43 L67 36 C76 28 88 33 88 44 V77 C88 88 76 93 67 85 L60 78 L53 85 C44 93 32 88 32 77Z" fill="#fff" opacity=".85"/><circle cx="60" cy="60" r="9" fill="#D3DBD1"/></svg>';
const I = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${LUCIDE[ICN[n]] || ''}</svg>`;

// ---------- 공통 ----------
const netFail = () => { const e = new Error('저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.'); e.network = true; return e; };
async function api(method, url, body) {
  const blob = body instanceof Blob;
  const r = await fetch(url, { method, headers: { 'x-ww': '1', ...(body ? { 'content-type': blob ? body.type : 'application/json' } : {}) }, body: body ? (blob ? body : JSON.stringify(body)) : undefined }).catch(() => { throw netFail(); });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) { const e = new Error(d.error || '문제가 생겼어요. 잠시 후 다시 시도해 주세요.'); e.status = r.status; e.data = d; throw e; }
  return d;
}
let tt; const toast = (m, ms = 2600) => { $('#toast')?.remove(); const t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); t.textContent = m; document.body.append(t); clearTimeout(tt); tt = setTimeout(() => t.remove(), ms); };
const hideToast = () => { clearTimeout(tt); $('#toast')?.remove(); };
const go = h => { if (location.hash === '#' + h) route(); else location.hash = h; };
async function act(fn, msg) {
  try { const r = await fn(); if (msg) toast(msg); route(); return r; }
  catch (e) { if (e.status === 401 && S.me) { S.me = null; return route(); } toast(e.message); }
}
function sheet(html) {
  closeSheet();
  const b = document.createElement('div'); b.className = 'back';
  b.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" tabindex="-1"><div class="grab"></div>${html}</div>`;
  b.addEventListener('pointerdown', e => { if (e.target === b) closeSheet(); });
  document.body.classList.add('sheet-open'); $('#layer').append(b); b.querySelectorAll('form[data-form]').forEach(f => f.noValidate = true); b.firstElementChild.focus(); return b;
}
const closeSheet = () => { $('#layer').innerHTML = ''; document.body.classList.remove('sheet-open'); };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
const ask = o => new Promise(res => {
  const b = sheet(`<h2>${esc(o.title)}</h2><p class="sub body2">${o.body || ''}</p>${o.check ? `<label class="row" style="margin-top:16px"><input type="checkbox" id="ck" style="width:20px;height:20px"><span class="body2">${esc(o.check)}</span></label>` : ''}<div class="actions"><button class="btn ${o.danger ? 'danger' : ''}" data-r="1">${esc(o.ok)}</button><button class="btn line" data-r="0">${esc(o.cancel || '취소')}</button></div>`);
  b.addEventListener('click', e => { const t = e.target.closest('[data-r]'); if (t) { const ck = $('#ck', b)?.checked; closeSheet(); res(t.dataset.r === '1' ? { checked: !!ck } : null); } });
});
const fmtDate = d => { if (!d) return '날짜 미상'; const [y, m, x] = d.split('-'); return `${y}년 ${+m}월 ${+x}일`; };
const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
// 약속 시간·장소 상태: 정확한 시간이 아니면 저장된 시각(그날 끝)을 보여주지 않는다
const TKL = { am: '오전쯤', pm: '오후쯤', tbd: '시간 미정' };
const timeTxt = (m, o = {}) => !m.time_kind || m.time_kind === 'exact' ? new Date(m.starts_at).toLocaleTimeString('ko-KR', { timeZone: m.tz || localTz, hour: 'numeric', minute: '2-digit', ...o }) : TKL[m.time_kind];
const placeTxt = m => m.place ? esc(m.place) : '장소 미정';
const fmtDT = (iso, tz, kind) => new Date(iso).toLocaleString('ko-KR', { timeZone: tz || localTz, month: 'long', day: 'numeric', weekday: 'short', year: 'numeric', ...(!kind || kind === 'exact' ? { hour: 'numeric', minute: '2-digit' } : {}) }) + (kind && kind !== 'exact' ? ' ' + TKL[kind] : '') + (tz && tz !== localTz ? ` (${tz})` : '');
const radios = (name, opts, cur) => `<div class="pick" role="radiogroup">${opts.map(([v, t]) => `<label><input type="radio" name="${name}" value="${v}" ${v === cur ? 'checked' : ''}><span>${t}</span></label>`).join('')}</div>`;
const whenFields = (m = {}) => { const d = m.starts_at ? new Date(m.starts_at) : null, tk = m.time_kind || 'exact', pk = m.place_kind || (m.place ? 'exact' : 'tbd');
  return `<div class="field" data-field="day"><label for="mt-day"><span>날짜</span></label><input id="mt-day" type="date" name="day" required value="${d ? d.toLocaleDateString('sv') : ''}"></div>
    <div class="field" data-field="at"><span>시간</span>${radios('tk', [['exact', '정확한 시간'], ['am', '오전쯤'], ['pm', '오후쯤'], ['tbd', '아직 미정']], tk)}<input type="time" name="at" aria-label="시간" style="margin-top:8px${tk === 'exact' ? '' : ';display:none'}" value="${d && tk === 'exact' ? d.toLocaleTimeString('sv').slice(0, 5) : ''}"><small>시간은 나중에 정해도 괜찮아요. ${esc(localTz)} 기준이에요.</small></div>
    <div class="field" data-field="place"><span>장소</span>${radios('pk', [['exact', '정확한 장소'], ['area', '지역만'], ['tbd', '아직 미정']], pk)}<input type="text" name="place" maxlength="60" aria-label="장소" style="margin-top:8px${pk === 'tbd' ? ';display:none' : ''}" value="${esc(m.place || '')}" placeholder="${pk === 'area' ? '예: 성수, 홍대' : '예: 카페 이름'}"><small>장소도 나중에 정해서 바꿀 수 있어요.</small></div>`; };
const whenBody = fd => { const k = fd.get('tk'), pk = fd.get('pk'); return { starts_at: new Date(k === 'exact' ? `${fd.get('day')}T${fd.get('at')}` : `${fd.get('day')}T23:59:${{ am: 57, pm: 58, tbd: 59 }[k]}`).toISOString(), time_kind: k, tz: localTz, place_kind: pk, place: pk === 'tbd' ? '' : fd.get('place') }; }; // ponytail: 비정확 시간은 그날 끝 초 단위로 저장(오전<오후<미정 정렬), 정확한 시각 아님
const whenValid = fd => [['day', need(fd.get('day'), '날짜를 선택해 주세요.')], ['at', fd.get('tk') === 'exact' ? need(fd.get('at'), '시간을 입력하거나, 오전쯤·오후쯤·아직 미정을 골라 주세요.') : null], ['place', fd.get('pk') !== 'tbd' ? need(fd.get('place'), fd.get('pk') === 'area' ? '지역을 입력해 주세요.' : '장소를 입력해 주세요.') : null]];
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const won = n => Number(n).toLocaleString('ko-KR') + '원';
const top = (title, o = {}) => `<header class="top">${o.back === false ? '' : `<button class="icon-btn" data-act="back" aria-label="뒤로 가기">${I('back')}</button>`}<h1>${esc(title)}</h1>${o.right || ''}</header>`;
const empty = (t, d, btn, icon = /조건/.test(t) ? 'searchx' : 'photo') => `<div class="empty"><span class="empty-ic">${I(icon)}</span><h2>${t}</h2><p>${d}</p>${btn || ''}</div>`;
const av = (n, c = '') => `<span class="av ${c}" aria-hidden="true">${esc([...(n || '?')][0])}</span>`;
const pick = (list, name = 'm', on = []) => { const dup = list.reduce((m, u) => (m[u.name] = (m[u.name] || 0) + 1, m), {}); return `<div class="pick">${list.map(u => `<label><input type="checkbox" name="${name}" value="${u.id}" ${on.includes(u.id) ? 'checked' : ''}><span>${esc(u.name)}${u.username && dup[u.name] > 1 ? ` <i class="uid">@${esc(u.username)}</i>` : ''}</span></label>`).join('')}</div>`; };
const tile = p => `<a class="tile" href="#/post/${p.id}"><span class="t-ph">${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}</span><b>${esc(p.title)}</b><span class="cap">${fmtDate(p.occurred_on)}${p.place ? ' · ' + esc(p.place.label) : ''} · ${p.count}명</span></a>`;
const postCard = p => `<a class="card post" href="#/post/${p.id}"><div class="ph">${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}<span class="ph-badge">${I('lock', 'xs')}초대된 사람만</span></div><div class="meta"><h2>${esc(p.title)}</h2><p class="cap">${fmtDate(p.occurred_on)}${p.place ? ' · ' + esc(p.place.label) : ''}${p.status === 'closed' ? ' · 종료됨' : ''}${p.years_ago ? ` · ${p.years_ago}년 전 오늘` : ''}</p><div class="who"><span class="avs">${(p.names || []).map(n => av(n, 's')).join('')}</span><span><b>${p.count}명이 함께</b></span></div></div></a>`;
const gone = e => e.status === 403 || e.status === 404
  ? `${top('추억', { back: false })}${empty(e.status === 404 ? '이 기록은 삭제되었어요' : '이 추억은 더 이상 공유되지 않아요', '다른 추억을 둘러보세요.', '<a class="btn" href="#/">다른 추억 보기</a>')}`
  : `${top('앗', { back: false })}${empty('불러오지 못했어요', esc(e.message), '<button class="btn" data-act="reload">다시 시도하기</button>')}`;
const wordmark = () => `<div class="logo-row"><img src="/logo.svg" alt=""><div><div class="wordmark">우리사이</div><div class="wm-en">WOORISAI</div></div></div>`;

// ---------- 인증 ----------
// 간편가입: 우리사이 자체 CTA는 아이콘 없이 텍스트만 쓴다. 제공자 공식 버튼 규정과 충돌하면 규정을 우선한다(출시 전 확인).
const SNS = [['kakao', '카카오 계정으로 계속하기', '#FEE500'], ['naver', '네이버 계정으로 계속하기', '#03C75A'], ['google', 'Google 계정으로 계속하기', '#FFFFFF']];
// 약관 문구는 임시입니다. 출시 전에 법률 검토를 거친 정식 문서로 바꿔야 해요.
const DOCS = {
  '/terms': ['이용약관', ['이 문서는 임시 안내문이에요. 출시 전에 법률 검토를 거친 정식 약관으로 바꿔요.', '우리사이는 초대한 사람끼리만 사진과 글을 함께 남기는 서비스예요.', '내가 올린 사진과 글은 언제든 직접 삭제할 수 있어요.', '다른 사람의 사생활을 침해하거나 괴롭히는 이용은 제한될 수 있어요.']],
  '/privacy-policy': ['개인정보처리방침', ['이 문서는 임시 안내문이에요. 출시 전에 법률 검토를 거친 정식 방침으로 바꿔요.', '수집 항목: 이름(로그인 아이디), 닉네임, 비밀번호(암호화) 또는 로그인 제공자의 계정 번호.', '이메일, 전화번호, 친구 목록, 주소록은 수집하지 않아요.', '사진의 위치 정보(GPS)는 올릴 때 지워요.', '계정을 삭제하면 로그인과 연결이 정리돼요. 이미 다른 사람이 저장한 사진은 되돌릴 수 없어요.']],
  '/help': ['로그인 도움말', ['카카오·네이버·Google로 가입했다면 첫 화면에서 같은 버튼으로 계속해 주세요. 이름과 비밀번호로 가입했다면 \u2018이름으로 로그인하기\u2019를 쓰세요.', '우리사이에서 로그아웃해도 카카오·네이버·Google 계정은 로그아웃되지 않아요.', '다른 로그인 방법으로 들어오면 새 계정이 만들어질 수 있어요. 이메일이 같아도 계정을 자동으로 합치지 않아요.', '로그인 정보를 잃어버렸다면 지원에 문의해 주세요. 신분증 같은 민감한 정보는 요구하지 않아요.']],
};
const docPage = path => { const [t, ps] = DOCS[path]; return `<div class="page stack"><button class="icon-btn" data-act="back" aria-label="뒤로 가기" style="margin-left:-12px">${I('back')}</button><h1>${t}</h1>${ps.map(p => `<p>${esc(p)}</p>`).join('')}</div>`; };

const CONSENTS = [['c_terms', '이용약관 동의', true, '/terms', '우리사이 이용약관의 임시 문구예요. 출시 전 법률 검토가 필요해요.'], ['c_privacy', '개인정보 수집·이용 동의', true, '/privacy-policy', '수집 항목은 이름(아이디), 닉네임, 비밀번호(암호화) 또는 로그인 제공자 계정 번호예요. 이메일·전화번호·친구 목록은 수집하지 않아요.'], ['c_marketing', '마케팅 정보 수신 동의', false, '', '선택 사항이에요. 동의하지 않아도 모든 기능을 쓸 수 있어요.']];
const consentBlock = () => `<fieldset class="consent" data-field="consent"><legend class="sr">서비스 이용 동의</legend>
  <label class="crow all"><input type="checkbox" name="c_all"><span><b>전체 동의</b></span></label>
  ${CONSENTS.map(([n, l, req, href, desc]) => `<div class="crow ${req ? 'req' : 'opt'}"><label><input type="checkbox" name="${n}"><span>${l} <em class="tag2 ${req ? 'must' : ''}">${req ? '필수' : '선택'}</em></span></label><details><summary>내용 보기</summary><p class="cap">${desc}</p>${href ? `<a class="cap" href="#${href}">전문 보기</a>` : ''}</details></div>`).join('')}</fieldset>`;

function nickField(id, label = '닉네임', initial = '') {
  return `<div class="field" data-nick><label for="${id}"><span>${label}</span></label><input id="${id}" data-nick-input type="text" name="nickname" value="${esc(initial)}" maxlength="40" placeholder="${esc(suggest())}" autocomplete="nickname" aria-describedby="${id}-m" required>
    <div class="row between"><small id="${id}-m" class="msg" aria-live="polite">${NICK_HINT}</small><small id="${id}-c" class="count">${graphemes(initial)}/${NICK_MAX}</small></div>
    <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:8px"><button type="button" class="btn sec2 sm" data-act="nick-suggest" data-for="${id}">닉네임 추천받기</button><button type="button" class="btn line sm" data-act="nick-restore" data-for="${id}" hidden>이전 이름으로 돌아가기</button></div></div>`;
}
const nst = el => el._n ||= { recent: [], lastUser: '', suggested: false };
function nickRender(el, final) {
  const v = el.value, n = graphemes(v), r = validateNickname(v), s = nst(el), box = el.closest('[data-nick]'), m = $('#' + el.id + '-m'), cnt = $('#' + el.id + '-c');
  cnt.textContent = `${n}/${NICK_MAX}`; cnt.classList.toggle('bad', n > NICK_MAX);
  const showErr = n > NICK_MAX || (final && !r.ok); // 글자 수 초과는 입력 중에도, 나머지는 포커스를 벗어나거나 제출할 때 알린다
  m.textContent = showErr ? r.message : s.suggested ? '추천한 닉네임이에요. 직접 바꿔도 좋아요.' : NICK_HINT; m.className = 'msg' + (showErr ? ' bad' : '');
  el.setAttribute('aria-invalid', showErr);
  box.querySelector('[data-act=nick-suggest]').textContent = s.suggested ? '다시 추천받기' : '닉네임 추천받기';
  box.querySelector('[data-act=nick-restore]').hidden = !(s.suggested && s.lastUser);
  el.dispatchEvent(new CustomEvent('nickchange', { bubbles: true }));
}
document.addEventListener('input', e => { const el = e.target; if (el.matches?.('[data-nick-input]')) { const s = nst(el); s.lastUser = el.value; s.suggested = false; nickRender(el, false); } });
document.addEventListener('focusout', e => { const el = e.target; if (el.matches?.('[data-nick-input]') && !e.relatedTarget?.closest?.('[data-nick]')) nickRender(el, true); });
const nameField = () => `<div class="field"><label for="su-user"><span>이름</span></label><input id="su-user" type="text" name="username" maxlength="20" required autocomplete="username" autocapitalize="none" spellcheck="false" aria-describedby="su-user-m"><small id="su-user-m" class="msg" aria-live="polite">영문 소문자, 숫자, _ 로 3–20자예요. 로그인과 친구 찾기에 써요.</small></div>`;
const backBtn = '<button class="icon-btn" data-act="auth" data-m="intro" aria-label="뒤로 가기" style="margin-left:-12px">' + I('back') + '</button>';
const submitRow = label => `<p class="err" role="alert"></p><div><button class="btn block" disabled>${label}</button><p id="su-why" class="cap" style="margin-top:8px" aria-live="polite"></p></div>`;
const dupHint = '<div class="note stack"><span>이미 사용 중인 우리사이 계정이 있나요?</span><button type="button" class="btn line sm" data-act="auth" data-m="login">기존 계정으로 로그인하기</button></div>';
const oauthView = () => {
  const p = S.pending || {};
  if (S.oauthStep !== 'profile') return `<div class="page stack">${backBtn}<h1>우리사이를 이용하기 위한 내용을 확인해 주세요.</h1><p class="sub body2">${esc(p.label || '간편')} 계정으로 시작해요. 외부 계정에서 한 동의와 별개로 우리사이 이용 동의가 필요해요.</p><form data-form="oauth-consent" class="stack" novalidate>${consentBlock()}${submitRow('동의하고 계속하기')}</form></div>`;
  return `<div class="page stack">${backBtn}<h1>우리사이에서 어떤 이름으로 불리고 싶나요?</h1><p class="sub body2">편하게 불릴 닉네임을 정해보세요. 나중에도 변경할 수 있어요.</p><form data-form="oauth-signup" class="stack" novalidate>${nickField('su-nick', '닉네임', p.suggestion || '')}${nameField()}${submitRow('이 이름으로 시작하기')}</form>${dupHint}</div>`;
};
// 회원가입 폼: 닉네임 → 이름 → 비밀번호 → 비밀번호 확인 → 이용 동의. 입력 중 실시간 검증, 이름은 상태(확인 중/사용 가능/사용 불가)로 나눈다.
const signupView = () => `<div class="page stack">${backBtn}
  <h1>우리사이에서 어떤 이름으로 불리고 싶나요?</h1><p class="sub body2">편하게 불릴 닉네임을 정해보세요. 나중에도 변경할 수 있어요.</p>
  <form data-form="signup" class="stack" autocomplete="on" novalidate>
    ${nickField('su-nick')}
    ${nameField()}
    <div class="field"><label for="su-pw"><span>비밀번호</span></label>
      <div class="pwbox"><input id="su-pw" type="password" name="password" required autocomplete="new-password" aria-describedby="su-pw-r"><button type="button" class="pwtoggle" data-act="pw-toggle" aria-pressed="false">보기</button></div>
      <ul id="su-pw-r" class="rules" aria-live="polite"><li data-r="len">8자 이상</li><li data-r="letter">영문 포함</li><li data-r="digit">숫자 포함</li></ul></div>
    <div class="field"><label for="su-pw2"><span>비밀번호 확인</span></label><input id="su-pw2" type="password" name="confirm" required autocomplete="new-password" aria-describedby="su-pw2-m"><small id="su-pw2-m" class="msg" aria-live="polite"></small></div>
    ${consentBlock()}
    ${submitRow('이 이름으로 시작하기')}
    <button type="button" class="btn line block" data-act="auth" data-m="login">이미 계정이 있어요</button>
  </form></div>`;
const introView = () => {
  const n = S.authNotice, jf = S.joinFrom;
  return `<div class="hero"><div class="hero-text">${wordmark()}<div class="stack"><p class="display">우리 사이에 쌓이는<br>모든 순간.</p><p class="sub">친구들과의 사진과 이야기를 함께 남겨보세요.</p></div>
    ${jf ? `<div class="note"><b>${esc(jf)}님이 초대했어요.</b><br>가입하면 초대 화면으로 돌아와요. 초대를 수락하기 전에는 사진과 글이 보이지 않아요.</div>` : ''}
    ${n ? `<div class="note warn stack" role="alert"><span>${esc(n.msg)}</span><div class="row" style="flex-wrap:wrap;gap:8px">${n.retry ? `<button class="btn sm" data-act="sns" data-p="${n.retry}">다시 시도하기</button>` : ''}<button class="btn sm line" data-act="notice-clear">다른 계정으로 계속하기</button></div></div>` : ''}
    <div class="stack" role="group" aria-label="간편 로그인">${SNS.map(([k, label, bg]) => `<button class="btn block sns-btn" style="background:${bg}" data-act="sns" data-p="${k}" ${S.sns?.[k] ? '' : 'aria-disabled="true"'}>${label}</button>`).join('')}<p id="sns-status" class="cap" aria-live="polite">계속하면 서비스 이용에 필요한 안내를 확인할 수 있어요.${SNS.some(x => !S.sns?.[x[0]]) ? ' 흐리게 보이는 로그인은 아직 준비 중이에요.' : ''}</p></div>
    <div class="or"><span>또는</span></div>
    <div class="row"><button class="btn line grow" data-act="auth" data-m="signup">이름으로 가입하기</button><button class="btn line grow" data-act="auth" data-m="login">이름으로 로그인하기</button></div>
    <button class="btn line block" data-act="guest-start">로그인 없이 둘러보기</button>
    <p class="cap row" style="flex-wrap:wrap;gap:4px 16px"><a href="#/terms">이용약관</a><a href="#/privacy-policy">개인정보처리방침</a><a href="#/help">로그인 도움말</a></p></div>
    <div class="hero-art demo" aria-hidden="true"><div class="card"><div class="ph">${KNOT}</div><div class="meta"><h2>성수동 브런치</h2><p class="cap">2025년 11월 9일 · 성수동, 서울 · 3명</p><div class="who"><span class="av s">지</span><span class="av s">민</span><span class="av s">하</span><span class="cap">사진 12장 · 이야기 4개</span></div></div></div></div></div>`;
};
function authView() {
  $('#tabs').hidden = true;
  const m = S.authMode;
  if (m === 'oauth') return oauthView();
  if (m === 'intro') return introView();
  if (m === 'signup') return signupView();
  return `<div class="page stack">${backBtn}<h1>다시 만나서 반가워요</h1><p class="sub body2">이름과 비밀번호로 로그인해요. 카카오·네이버·Google로 가입했다면 처음 화면에서 같은 버튼으로 계속해 주세요.</p>
    <form data-form="login" class="stack" autocomplete="on" novalidate>
      <div class="field"><label for="li-user"><span>이름</span></label><input id="li-user" type="text" name="username" maxlength="20" autocomplete="username" autocapitalize="none" spellcheck="false"></div>
      <div class="field"><label for="li-pw"><span>비밀번호</span></label><input id="li-pw" type="password" name="password" autocomplete="current-password"></div>
      <p class="err" role="alert"></p>
      <button class="btn block">로그인하기</button>
      <button type="button" class="btn line block" data-act="auth" data-m="signup">새로 시작하기</button>
    </form></div>`;
}


// ---------- 비로그인 둘러보기 (시안 A): 예시 추억으로 둘러보고, 행동할 때만 로그인 ----------
const GU = '/ux-test/images/unsplash/';
const GATE = { create: ['첫 추억을 남겨볼까요?', '로그인하면 사진과 이야기를 안전하게 보관하고, 함께한 사람을 초대할 수 있어요.', '로그인하고 추억 남기기'], memories: ['내 추억을 보려면 로그인이 필요해요', '로그인하면 함께 남긴 추억을 모아 볼 수 있어요.', '로그인하고 보기'], me: ['내 정보를 보려면 로그인이 필요해요', '로그인하면 함께한 사람과 내 기록을 관리할 수 있어요.', '로그인하기'], foot: ['우리의 발자국을 함께 모아볼까요?', '로그인하면 친구와 함께 남긴 지역별 추억을 연결할 수 있어요.', '로그인하고 연결하기'] };
function gate(k) {
  const [t, b, c] = GATE[k], el = sheet(`<h2>${t}</h2><p class="sub body2" style="margin:8px 0 16px">${b}</p><div class="actions"><button class="btn" data-a="go">${c}</button><button class="btn line" data-a="x">계속 둘러보기</button></div>`);
  el.addEventListener('click', e => { const x = e.target.closest('[data-a]')?.dataset.a; if (!x) return; closeSheet(); if (x === 'go') leaveGuest(k); });
}
function leaveGuest(k) { S.guest = false; S.intent = k === 'create' ? 'create' : null; try { sessionStorage.removeItem('ws_guest'); } catch { } S.authMode = 'intro'; go('/'); }
const guestBar = '<div class="gbar"><span><b>우리사이 미리보기</b><span class="cap">예시 추억으로 둘러보고 있어요.</span></span><button class="btn sm" data-act="guest-login">시작하기</button></div>';
const GUEST_STEPS = [['users', '함께한 사람을 초대해요', '초대를 수락한 사람만 볼 수 있어요.'], ['photo', '각자의 사진과 이야기를 더해요', '한 추억 안에 모두의 기록이 쌓여요.'], ['pinned', '다녀온 지역에 발자국이 남아요', '전국 17개 시·도를 함께 채워요.']];
const guestHome = () => `${guestBar}<header class="top home-top"><div class="small-logo"><img src="/logo.svg" alt=""><span class="wordmark">우리사이</span></div></header><div class="page stack" style="gap:28px;padding-top:0">
  <section class="stack" style="gap:12px"><div><h2 class="g-h">함께 다녀온 날을,<br>한 곳에 같이 모아요</h2><p class="sub body2">각자 찍은 사진과 이야기가 하나의 추억이 돼요.</p></div>
    <div class="card g-hero"><div class="ph"><img src="${GU}jeju-fall.jpg" alt=""><span class="ph-badge">예시 추억</span></div><div class="meta"><h2>제주 2박 3일, 비 그친 뒤의 오름</h2><p class="cap">4명이 남긴 사진 38장 · 이야기 6개</p><div class="g-th">${[['jeju-sea', '친구 A'], ['jeju-flower', '친구 B'], ['jeju-house', '친구 C'], ['jeju-cliff', '나']].map(([f, by]) => `<span><img loading="lazy" src="${GU}${f}.jpg" alt=""><i>${by}</i></span>`).join('')}</div></div></div></section>
  <section class="stack" style="gap:14px">${GUEST_STEPS.map(([ic_, t, b]) => `<div class="g-step"><span class="pe-ic s" style="background:var(--ws-color-bg-brand-subtle)">${I(ic_, 's')}</span><span><b>${t}</b><span class="cap">${b}</span></span></div>`).join('')}</section>
  <button class="btn block" data-act="guest-gate" data-k="create">나도 추억 남기기</button></div>`;
const GUEST_FOOT = { 서울: ['mem-han', 2], 제주: ['mem-jeju', 1], 강원: ['mem-anmok', 1], 부산: ['mem-gwangan', 1] };
const guestFoot = () => `${guestBar}<header class="top"><h1>우리의 발자국</h1></header><div class="page stack" style="padding-top:8px">
  <p class="sub body2">예시 발자국이에요. 추억에 지역을 연결하면 내 발자국이 쌓여요.</p>
  <div class="foot-stats"><div><span class="cap">기록된 지역</span><b>4<small> / 17곳</small></b></div><div><span class="cap">연결된 추억</span><b>5<small>개</small></b></div></div>
  <div class="stamps">${REGIONS.map(r => `<button class="stamp${GUEST_FOOT[r] ? ' on' : ''}" data-act="guest-gate" data-k="foot" aria-label="${r}${GUEST_FOOT[r] ? ', 예시 추억 ' + GUEST_FOOT[r][1] + '개' : ', 아직 기록이 없어요'}"><span class="sp">${GUEST_FOOT[r] ? `<img loading="lazy" src="${GU}${GUEST_FOOT[r][0]}.jpg" alt="">` : esc(r[0])}</span><span class="cap">${GUEST_FOOT[r] ? r : ''}</span></button>`).join('')}</div>
  <button class="btn block" data-act="guest-login">로그인하고 모으기</button></div>`;
function guestRoute(path, view) {
  const tabs = $('#tabs'), foot = path === '/foot', T = [['home', '홈', 'home'], ['memories', '추억', 'photo'], ['new', '만들기', 'create'], ['foot', '발자국', 'pinned'], ['me', '나', 'user']];
  $('#app').classList.add('authed'); tabs.hidden = false;
  tabs.innerHTML = '<div class="brand"><img src="/logo.svg" alt=""><span class="wordmark">우리사이</span></div>' + T.map(([k, l, i]) => k === 'new' ? `<button data-act="guest-gate" data-k="create" data-kk="new" aria-label="만들기"><span class="mk">${I('create')}</span>${l}</button>` : k === 'home' || k === 'foot' ? `<a href="${k === 'home' ? '#/' : '#/foot'}" data-k="${k}" ${(k === 'foot') === foot ? 'aria-current="page"' : ''}><span class="nv-ic">${I(i)}</span>${l}</a>` : `<a href="#/" data-act="guest-gate" data-k="${k}" data-kk="${k}"><span class="nv-ic">${I(i)}</span>${l}</a>`).join('') + '<div class="side-label l1">둘러보기</div><div class="side-label l2">함께하기</div><div class="side-label l3">내 정보</div>';
  view.innerHTML = foot ? guestFoot() : guestHome(); window.scrollTo(0, 0);
}

// ---------- 페이지 ----------
const P = {};
const PP = { files: [], urls: [] };
function ppRender() {
  const f = $('[data-form=newpost]'), list = $('#pp-list'); if (!f || !list) return;
  const dt = new DataTransfer(); PP.files.forEach(x => dt.items.add(x)); f.photos.files = dt.files;
  list.innerHTML = PP.urls.map((u, i) => `<span class="pp-t"><button type="button" class="pp-v" data-act="pp-view" data-i="${i}" aria-label="${i + 1}번째 사진 크게 보기"><img src="${u}" alt=""></button>${i === 0 ? '<i>대표</i>' : ''}<button type="button" data-act="pp-rm" data-i="${i}" aria-label="이 사진 빼기">${I('x', 's')}</button></span>`).join('');
  const n = $('#pp-note'); if (n && PP.files.length) n.textContent = `사진 ${PP.files.length}장 · 맨 앞 사진이 대표 사진이 돼요.`;
}
const RSL = { yes: '참석', maybe: '미정', no: '불참', invited: '응답 대기' };
const planCard = m => { const d = new Date(m.starts_at), off = m.status === 'cancelled', host = m.organizer_id === S.me?.id; return `<a class="plan${off ? ' off' : ''}" href="#/meetup/${m.id}" aria-label="${esc(m.title)}, ${off ? '취소됨' : RSL[m.rsvp] || ''}"><span class="pd"><span>${d.getMonth() + 1}월</span><b>${d.getDate()}</b></span><span class="pb"><b>${esc(m.title)}</b><span class="plan-where"><span>${I('clock', 'xs')}${timeTxt(m, { timeZone: localTz })}</span><span>${I('pin', 'xs')}${placeTxt(m)}</span></span><span class="plan-attend">전체 참석 ${m.yes || 0}명</span></span><span class="plan-state"><span>내 응답 <strong class="rs ${off ? 'x' : m.rsvp}">${off ? '취소됨' : RSL[m.rsvp] || ''}</strong></span>${host ? '<span class="plan-host">내가 만든 약속</span>' : ''}</span>${m.changed && !off ? `<span class="plan-change">${I('help', 'xs')}<span><b>${esc(m.changed)}</b></span></span>` : ''}</a>`; };

const threadComment = c => `<article class="thread-comment${c.parent_id ? ' reply' : ''}"><div class="thread-author"><span><b>${esc(c.author)}</b><time>${esc(c.created_at.slice(0, 16).replace('T', ' '))}</time></span>${c.mine ? `<button class="thread-delete" data-act="memory-del" data-id="${c.id}" data-mid="${c.media_id || ''}">삭제</button>` : ''}</div>${c.restricted ? '<p class="cap">검토 중인 콘텐츠예요.</p>' : `<p>${esc(c.text)}</p>${c.attachment ? `<img class="thread-attachment" src="/media/${c.attachment}" alt="댓글에 첨부한 사진">` : ''}`}<button class="thread-reply" data-act="memory-reply" data-id="${c.id}" data-name="${esc(c.author)}">답글</button></article>`;
async function THREAD_UI(mid) {
  const t = await api('GET', `/api/media/${mid}/thread`), choices = ['❤️', '😊', '😂', '🥹', '👏'];
  const byEmoji = Object.fromEntries(t.reactions.map(x => [x.emoji, x]));
  sheet(`<div class="thread-sheet"><div class="thread-head"><div><h2>기억 이어가기</h2><p class="sub body2">이 사진에 떠오르는 이야기를 남겨보세요.</p></div><button class="icon-btn" data-act="sheet-close" aria-label="닫기">${I('x')}</button></div><div class="reaction-row" aria-label="이모지 반응">${choices.map(e => { const r = byEmoji[e]; return `<button data-act="memory-react" data-id="${mid}" data-emoji="${e}" aria-pressed="${!!r?.mine}" aria-label="${e} 반응 ${r?.count || 0}개">${e}<span>${r?.count || ''}</span></button>`; }).join('')}</div><section class="thread-memories"><h3>친구들의 기억</h3><div class="thread-list">${t.comments.map(c => threadComment({ ...c, media_id: mid })).join('') || '<p class="thread-empty">아직 남긴 기억이 없어요.</p>'}</div></section>${t.open ? `<form data-form="memory-comment" data-mid="${mid}" class="thread-form"><input type="hidden" name="parent_id"><label class="field"><span id="thread-label">짧은 기억 남기기</span><textarea name="text" maxlength="500" required placeholder="이 사진에서 떠오르는 순간을 남겨보세요"></textarea></label><p class="err" role="alert"></p><button class="btn block">남기기</button></form>` : '<p class="note">종료된 추억에는 새 기억을 남길 수 없어요.</p>'}</div>`);
}

P.home = async () => {
  const [d, today, fm] = await Promise.all([api('GET', '/api/home'), api('GET', '/api/today?date=' + localDate()), api('GET', '/api/map').catch(() => ({ total: 0, countries: [] }))]);
  const fby = regionMap(fm), fr = REGIONS.filter(r => fby[r]);
  const news = d.postInvites.length + d.friendRequests.length + d.meetupInvites.length;
  return `<header class="top home-top"><div class="small-logo"><img src="/logo.svg" alt=""><span class="wordmark">우리사이</span></div><a class="home-av" href="#/me" aria-label="나">${av(S.me.name, 's')}</a></header><div class="page">
  <p class="cap" style="margin-bottom:8px">${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
  <div class="chips" style="margin:12px 0 24px" aria-label="빠른 시작"><a class="chip" href="#/new-meetup">약속 만들기</a><a class="chip" href="#/people">사람 초대하기</a><a class="chip" href="#/saved">저장한 추억</a><a class="chip" href="#/memories?tab=map">추억 지도</a></div>
  ${news ? `<section aria-label="새 소식"><div class="hd row between"><h2>새 소식</h2></div><div class="card list">
    ${d.postInvites.map(x => `<a href="#/post/${x.id}">${av(x.inviter)}<span class="grow"><b>${esc(x.title)}</b><br><span class="cap">${esc(x.inviter)}${x.inviter_username ? ` (@${esc(x.inviter_username)})` : ''}님이 추억에 초대했어요</span></span>${I('chev', 's')}</a>`).join('')}
    ${d.friendRequests.map(x => `<div>${av(x.name)}<span class="grow"><b>${esc(x.name)}</b><br><span class="cap">연결을 요청했어요</span></span><button class="btn sm" data-act="accept-friend" data-id="${x.id}">수락</button><button class="btn sm line" data-act="decline-friend" data-id="${x.id}">거절</button></div>`).join('')}
    ${d.meetupInvites.map(x => `<a href="#/meetup/${x.id}">${av('약')}<span class="grow"><b>${esc(x.title)}</b><br><span class="cap">${fmtDT(x.starts_at, x.tz, x.time_kind)} · 참석 여부를 알려 주세요</span></span>${I('chev', 's')}</a>`).join('')}</div></section>` : ''}
  ${d.posts.length ? `<section class="home-sec sec" aria-label="최근 함께한 추억"><h2>최근 함께한 추억</h2><div class="hero-card">${postCard(d.posts[0])}</div>${d.posts.slice(1, 3).map(p => `<a class="mrow" href="#/post/${p.id}"><span class="th">${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}</span><span><b>${esc(p.title)}</b><span class="cap">${fmtDate(p.occurred_on)} · ${p.count}명${p.place ? ' · ' + esc(p.place.label) : ''}</span></span>${I('chev', 's')}</a>`).join('')}${d.posts.length > 3 ? `<a class="btn sm line" style="align-self:flex-start" href="#/memories">추억 모두 보기 (${d.posts.length})</a>` : ''}</section>
  <section class="memory-create sec" aria-label="새 추억 만들기"><div class="memory-create-guide"><span class="memory-create-icon">${I('create')}</span><span class="memory-create-copy"><h2>함께한 순간을 남겨볼까요?</h2><p>사진과 이야기를 하나의 추억으로 모아보세요.</p></span></div><a class="btn block memory-create-button" href="#/new-post">새 추억 만들기</a></section>` : `<section class="sec" aria-label="우리의 추억"><div class="hd"><h2>우리의 추억</h2></div>${empty('아직 남긴 추억이 없어요.', '함께했던 하루를 첫 번째 추억으로 남겨보세요.', '<a class="btn" href="#/new-post">첫 추억 만들기</a>')}</section>`}
  ${today.items.length ? `<section class="moment" aria-label="1년 전 오늘"><h2>그날의 우리가 여기 있어요</h2><p class="cap" style="margin:4px 0 16px">함께 남긴 사진과 이야기를 다시 살펴보세요.</p>${postCard(today.items[0])}<div class="row" style="margin-top:12px;flex-wrap:wrap"><a class="btn sm line" href="#/post/${today.items[0].id}?add=1">기억 더하기</a><button class="btn sm line" data-act="hide-post" data-id="${today.items[0].id}">다시 추천하지 않기</button></div></section>` : ''}
  <section class="sec" aria-label="다가오는 약속"><div class="hd"><h2>다가오는 약속</h2><a class="btn sm line" href="#/new-meetup">새 약속 만들기</a></div><div class="stack" style="gap:12px">${d.upcoming.length ? d.upcoming.map(planCard).join('') : `<div class="plan-empty"><span class="pe-ic">${I('cal')}</span><span><b>다가오는 약속이 없어요</b><span class="cap">만날 날을 정해 두면, 그날을 추억으로 이어 남길 수 있어요.</span></span></div>`}${d.pastNudge ? `<a class="nudge" href="#/meetup/${d.pastNudge.id}"><span class="pe-ic s">${I('photo', 's')}</span><span><b>지난 약속을 추억으로 남길까요?</b><span class="cap">${esc(d.pastNudge.title)} · ${new Date(d.pastNudge.starts_at).getMonth() + 1}월 ${new Date(d.pastNudge.starts_at).getDate()}일</span></span>${I('chev', 's')}</a>` : ''}${d.upcoming.length ? '<a class="body2" style="color:var(--green)" href="#/meetups">약속 모두 보기</a>' : ''}</div></section>
  <section class="sec" aria-label="우리의 발자국"><div class="hd"><h2>우리의 발자국</h2></div><a class="foot-card" href="#/foot"><span class="fc-h"><span class="cap">${fr.length ? `${fr.length}개 지역 · 추억 ${fm.total}개` : '추억에 지역을 연결하면 발자국이 쌓여요.'}</span>${I('chev', 's')}</span>${fr.length ? `<span class="fc-m">${fr.slice(0, 5).map(r => `<span><span class="sp">${fby[r][0].cover ? `<img loading="lazy" src="/media/${fby[r][0].cover}" alt="">` : esc(r[0])}</span><span class="cap">${r}</span></span>`).join('')}</span>` : ''}</a></section>
</div>`;
};

P.post = async id => {
  const p = await api('GET', '/api/posts/' + id);
  if (p.preview) return `${top('추억 초대')}<div class="page stack"><div class="card pad stack"><span class="tag" style="align-self:flex-start">초대받은 추억</span><h1>${esc(p.title)}</h1><p class="sub body2">${esc(p.inviter)}${p.inviter_username ? ` (@${esc(p.inviter_username)})` : ''}님이 이 추억을 함께 기록하자고 초대했어요.</p><div class="note">수락하면 사진과 글, 함께한 사람을 볼 수 있어요. 수락하기 전에는 사진과 장소가 보이지 않아요.</div></div><div class="row"><button class="btn grow" data-act="respond" data-id="${p.id}" data-v="1">수락하기</button><button class="btn line grow" data-act="respond" data-id="${p.id}" data-v="0">거절하기</button></div></div>`;
  const isAdmin = p.me.role === 'admin', open = p.status === 'active';
  const acc = p.members.filter(m => m.access === 'accepted'), inv = p.members.filter(m => m.access === 'invited');
  const stories = p.notes.filter(n => n.kind === 'story');
  const noteHtml = n => `<div class="card pad" style="${n.kind === 'comment' ? 'border:0;background:var(--sage)' : ''}"><div class="row between"><span class="cap"><b style="color:var(--ink)">${esc(n.author)}</b> · ${n.created_at.slice(0, 10)}</span>${n.mine ? `<button class="btn sm line" data-act="del-note" data-id="${n.id}" aria-label="내 글 삭제하기">삭제</button>` : `<button class="btn sm line" data-act="report" data-t="note" data-id="${n.id}" aria-label="신고하기">신고</button>`}</div><p style="margin-top:8px;white-space:pre-wrap">${n.restricted ? '<span class="sub">검토 중인 콘텐츠예요</span>' : esc(n.text)}</p></div>`;
  const photoSlide = (m, i) => { const recent = m.comments.slice(-2), reacts = m.reactions.filter(x => x.count).map(x => `${x.emoji} ${x.count}`).join(' · '); return `<article class="memory-photo"><button class="memory-photo-open" data-act="photo" data-id="${m.id}" data-mine="${m.mine ? 1 : 0}" data-cover="${p.cover === m.id ? 1 : 0}" aria-label="${i + 1}번째 사진 크게 보기"><span class="memory-photo-frame"><img loading="lazy" src="/media/${m.id}" alt="함께 남긴 ${i + 1}번째 사진"><span class="memory-photo-count">${i + 1} / ${p.media.length}</span></span></button><div class="memory-preview"><h3>기억 이어가기</h3><div class="memory-totals"><span>${I('pen', 'xs')} 댓글 ${m.comment_count}</span><span>${I('heart', 'xs')} 반응 ${m.reaction_count}</span>${reacts ? `<span class="memory-emojis">${esc(reacts)}</span>` : ''}</div>${recent.length ? `<div class="memory-recent">${recent.map(c => `<p><b>${esc(c.author)}</b> ${c.restricted ? '검토 중인 콘텐츠예요.' : esc(c.text || '사진을 남겼어요.')}</p>`).join('')}</div>` : '<p class="memory-empty">이 사진에 이어진 기억이 아직 없어요.</p>'}<button class="btn line block" data-act="memory-thread" data-id="${m.id}">이 사진에 댓글 남기기</button></div></article>`; };
  return `<nav class="crumb" aria-label="현재 위치"><a href="#/">홈</a> › <a href="#/memories">추억</a> › ${esc(p.title)}</nav>${top('', { right: `<button class="icon-btn" data-act="post-menu" data-id="${p.id}" aria-label="더 보기">${I('more')}</button>` })}
  <div class="page stack" style="padding-top:8px" data-post="${p.id}">
    ${(() => { const cv = p.media.find(m => m.id === p.cover && !m.restricted)?.id ?? p.media.find(m => !m.restricted)?.id; return cv ? `<div class="cover"><img src="/media/${cv}" alt="대표 사진"></div>` : ''; })()}
    <div><h1>${esc(p.title)}</h1><p class="sub body2">${I('cal', 'xs')} ${fmtDate(p.occurred_on)}${p.place ? ` · <span title="${p.place.precision === 'exact' ? '정확한 장소' : p.place.precision === 'area' ? '동네까지만 표시' : '도시까지만 표시'}">${I('pin', 'xs')} ${esc(p.place.label)}</span>` : ''}${p.status === 'closed' ? ' · <span class="tag warn">종료됨</span>' : ''}</p>
      ${p.meetup ? `<a class="tag" href="#/meetup/${p.meetup.id}">${esc(p.meetup.title)} 약속에서</a>` : ''}${p.groups.map(g => `<span class="tag">${esc(g.name)}</span>`).join(' ')}</div>
    <div class="split"><div class="stack"><section class="card pad" aria-label="볼 수 있는 사람"><div class="row between"><h3>함께한 사람 ${acc.length}명</h3><span class="cap">${I('lock', 'xs')} 초대된 사람만 볼 수 있어요</span></div>
      <div class="row" style="flex-wrap:wrap;margin-top:12px;gap:8px">${acc.map(m => `<span class="row" style="gap:8px">${av(m.name, 's')}<span class="body2"><i class="dot" title="수락함"></i> ${esc(m.name)}${m.role === 'admin' ? ' <span class="tag">관리자</span>' : ''}</span></span>`).join('')}${inv.map(m => `<span class="tag"><i class="dot hollow"></i> ${esc(m.name)} · 초대 중</span>`).join('')}</div></section>
    <section><div class="row between" style="margin-bottom:12px"><h2>사진 ${p.media.length ? p.media.length + '장' : ''}</h2></div>
      ${p.media.length ? `<div class="memory-swipe" aria-label="사진별 기억">${p.media.map((m, i) => m.restricted ? '<div class="res">검토 중인 콘텐츠예요</div>' : photoSlide(m, i)).join('')}</div>` : `<div class="card pad sub body2">아직 사진이 없어요. 오늘 찍은 사진을 가장 먼저 보태 보세요.</div>`}</section>
      ${open ? `<section class="memory-contrib"><h2>함께 남기는 추억</h2><p class="sub body2">같은 날의 사진과 이야기를 함께 남겨보세요.</p><button class="btn block" data-act="add-more">내 사진 추가하기</button><input type="file" accept="image/*" multiple hidden data-upload="${p.id}" id="pf"></section>` : ''}
    </div><div class="stack"><section class="stack"><h2>우리의 이야기</h2>${stories.map(noteHtml).join('') || '<p class="sub body2">아직 남긴 이야기가 없어요.</p>'}
      ${open ? `<form data-form="note" data-id="${p.id}" data-kind="story" class="stack"><label class="field"><span class="cap">내가 기억하는 그날</span><textarea name="text" id="story-ta" maxlength="2000" required placeholder="그날의 이야기를 남겨 보세요"></textarea><small>남긴 기억은 이 추억의 참여자 ${acc.length}명이 볼 수 있어요.</small></label><button class="btn block">함께 기록하기</button></form>` : ''}</section>
    </div></div></div>`;
};

P.newPost = async () => {
  const [pp, gg] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/groups')]);
  let restored = false, d = S.draft; S.draft = null;
  if (!d) { try { d = JSON.parse(localStorage.getItem('ws_draft') || 'null'); restored = !!d; } catch { } } d ||= {}; window._groups = gg.groups;
  if (!pp.friends.length) return `${top('새 추억 만들기')}${empty('함께할 사람을 먼저 연결해 주세요', '이름이나 초대 링크로 연결하면 함께 추억을 남길 수 있어요.', '<a class="btn" href="#/people">사람 연결하기</a>')}`;
  const start = S.q.start === 'story' ? 'story' : (S.q.start === 'photo' || restored || d.meetup_id || d.group_id) ? 'photo' : null;
  if (!start) return `<div class="page stack"><button class="icon-btn" data-act="back" aria-label="닫기" style="margin-left:-8px">${I('x')}</button><div><h1>새 추억 만들기</h1><p class="sub body2" style="margin-top:8px">사진 한 장이나 짧은 이야기로 시작해도 좋아요.</p></div>
    <div class="stack" style="gap:12px">${[['photo', 'imgplus', '사진으로 시작하기', '기기에서 사진을 골라 한 번에 올려요.'], ['story', 'pen', '이야기로 시작하기', '사진 없이 그날의 이야기부터 남겨요.']].map(([k, i, t, b]) => `<a class="opt" href="#/new-post?start=${k}"><span class="oi">${I(i)}</span><span><b>${t}</b><span class="cap">${b}</span></span>${I('chev', 's')}</a>`).join('')}
      <p class="cap">어느 쪽으로 시작해도 같은 추억이 돼요. 사진과 이야기는 나중에 더할 수 있어요.</p></div></div>`;
  const story = start === 'story'; PP.files = []; PP.urls = [];
  const storyField = `<label class="field"><span>${story ? '이야기' : '이야기 (선택)'}</span><textarea name="text" maxlength="2000" placeholder="그날 어땠는지 한두 줄" data-counter>${esc(d.text || '')}</textarea><small class="count"></small></label>`;
  const photoField = `<div class="field"><span>사진${story ? ' (선택)' : ''}</span><div class="pp"><label class="pp-add" aria-label="기기에서 사진 고르기"><input type="file" name="photos" accept="image/*" multiple>${I('imgplus')}<span>기기에서 고르기</span></label><div class="pp-list" id="pp-list"></div></div><small id="pp-note">${story ? '사진 없이도 추억을 만들 수 있어요.' : '맨 앞 사진이 대표 사진이 돼요. 사진의 GPS 정보는 올릴 때 지워요.'}</small></div>`;
  return `${top('새 추억 만들기')}<form class="page stack" data-form="newpost" data-meetup="${d.meetup_id || ''}">
    ${d.meetup_id ? `<div class="note">${esc(d.title || '이 약속')} 약속에서 이어 만드는 추억이에요. 제목·날짜·함께한 사람은 미리 채웠어요. 지역은 직접 골라 주세요.</div>` : ''}
    ${restored ? '<div class="note row between"><span>임시 저장된 초안을 불러왔어요.</span><button type="button" class="btn sm line" data-act="draft-clear">삭제</button></div>' : ''}
    ${story ? storyField + photoField : photoField}
    <label class="field"><span>추억 제목</span><input type="text" name="title" maxlength="40" required value="${esc(d.title || '')}" placeholder="예) 성수동 브런치" data-counter><small class="count"></small></label>
    <label class="field"><span>언제였나요?</span><input type="date" name="date" value="${d.date || localDate()}" max="${localDate()}"></label>
    <div class="field"><span>누구와 함께했나요?</span><div class="selbar" id="selbar" aria-live="polite"></div>${pick(pp.friends, 'm', d.members || [])}
      ${gg.groups.length ? `<div class="field" style="margin-top:12px"><label><span class="cap">우리 공간에 연결 <small style="display:inline">(선택)</small></span><select name="group" data-fillgroup><option value="">공간 없이 만들게요</option>${gg.groups.map(g => `<option value="${g.id}"${+d.group_id === g.id ? ' selected' : ''}>${esc(g.name)}</option>`).join('')}</select></label><small id="space-note">공간에 연결해도 선택한 사람만 이 추억을 볼 수 있어요.</small><div id="space-all" hidden><button type="button" class="btn sm line" data-act="space-all">공간 멤버 모두 고르기</button></div></div>` : ''}</div>
    <div class="field"><span>지역</span><div class="pick regions" role="radiogroup" aria-label="지역">${REGIONS.map(r => `<label><input type="radio" name="pcity" value="${r}"><span>${r}</span></label>`).join('')}</div><small>지역을 고르면 우리의 발자국에 쌓여요. 지역은 나중에 바꿀 수 있어요.</small></div>
    <label class="field"><span>장소 (선택)</span><input type="text" name="parea" maxlength="30" placeholder="예) 성수동"></label>
    <details class="card pad"><summary style="cursor:pointer;font-weight:500">해외·다른 지역이거나 위치 공개 범위를 바꾸려면</summary><div class="stack" style="margin-top:12px">
      <div class="row"><label class="field grow"><span>도시</span><input type="text" name="pcity_x" maxlength="30"></label><label class="field grow"><span>국가</span><input type="text" name="pcountry_x" maxlength="30" placeholder="대한민국"></label></div>
      <label class="field"><span>보여줄 위치 수준</span><select name="pprec"><option value="exact">정확한 장소까지</option><option value="area" selected>동네까지만</option><option value="city">도시까지만</option></select><small>선택한 수준보다 자세한 위치는 서버에서 내려주지 않아요. 사진의 GPS 정보는 올릴 때 항상 지워요.</small></label></div></details>
    ${story ? '' : storyField}
    <div class="stickybar"><p class="err" role="alert"></p><button class="btn block">다음</button></div></form>`;
};

P.memories = async () => {
  const tab = ['list', 'cal', 'map', 'today', 'space'].includes(S.q.tab) ? S.q.tab : 'list', f = S.filter;
  const [pp, gg, allp] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/groups'), api('GET', '/api/posts').then(r => r.posts)]);
  const qs = new URLSearchParams({ people: f.people.join(','), mode: f.mode, group: f.group, year: f.year }).toString();
  const flt = ps => ps.filter(p => (!f.month || (p.occurred_on || '').startsWith(f.month)) && (!f.region || regionOf(p.place?.city) === f.region));
  const yr = new Date().getFullYear(), active = f.people.length || f.group || f.month || f.region;
  const months = [...new Set(allp.map(p => (p.occurred_on || '').slice(0, 7)).filter(Boolean))].sort().reverse(), regs = REGIONS.filter(r => allp.some(p => p.place && regionOf(p.place.city) === r));
  const dimOpts = { people: pp.friends.map(u => [u.id, u.name, f.people.includes(u.id)]), month: months.map(m => [m, `${m.slice(0, 4)}년 ${+m.slice(5)}월`, f.month === m]), region: regs.map(r => [r, r, f.region === r]), group: gg.groups.map(g => [String(g.id), g.name, String(f.group) === String(g.id)]) };
  const dimLabel = { people: f.people.length ? `사람 · ${f.people.length}` : '사람', month: f.month ? `${+f.month.slice(5)}월` : '기간', region: f.region || '지역', group: f.group ? gg.groups.find(g => g.id === +f.group)?.name || '우리 공간' : '우리 공간' };
  const dimSel = { people: f.people.length, month: f.month, region: f.region, group: f.group };
  const dims = ['people', 'month', 'region', ...(gg.groups.length ? ['group'] : [])], dim = f.dim || 'all', opts = dimOpts[dim] || [];
  const feedFilter = tab === 'today' || tab === 'space' ? '' : `<div class="stack" style="gap:8px"><div class="chips" aria-label="필터"><button class="chip${!active && dim === 'all' ? ' on' : ''}" aria-pressed="${!active && dim === 'all'}" data-act="f-dim" data-v="all">전체</button>${dims.map(k => `<button class="chip${dim === k || dimSel[k] ? ' on' : ''}" aria-pressed="${dim === k || !!dimSel[k]}" data-act="f-dim" data-v="${k}">${esc(dimLabel[k])}</button>`).join('')}</div>
    ${dim !== 'all' && opts.length ? `<div class="fpanel"><div class="chips" style="flex-wrap:wrap;overflow:visible">${opts.map(([v, l, on]) => `<button class="chip${on ? ' on' : ''}" aria-pressed="${!!on}" data-act="f-pick" data-k="${dim}" data-v="${v}">${esc(l)}</button>`).join('')}</div>${dim === 'people' && f.people.length > 1 ? `<div class="seg" role="tablist" aria-label="여러 사람 조건"><button role="tab" aria-selected="${f.mode === 'and'}" data-act="mode" data-v="and">모두 함께한 추억</button><button role="tab" aria-selected="${f.mode === 'or'}" data-act="mode" data-v="or">누구든 함께한 추억</button></div>` : ''}</div>` : ''}
    ${active ? '<div><button class="btn sm line" data-act="clear-filter">필터 초기화</button></div>' : ''}</div>`;
  const filterUi0 = tab === 'today' ? '' : `<details class="card pad" ${active ? 'open' : ''}><summary style="cursor:pointer;font-weight:500">필터${active ? ' · 적용 중' : ''}</summary><div class="stack" style="margin-top:12px">
    <div><span class="cap">함께한 사람</span><div class="pick" style="margin-top:8px">${pp.friends.map(u => `<label><input type="checkbox" data-filter="people" value="${u.id}" ${f.people.includes(u.id) ? 'checked' : ''}><span>${esc(u.name)}</span></label>`).join('') || '<span class="cap">연결된 사람이 없어요</span>'}</div>
      ${f.people.length > 1 ? `<div class="seg" role="tablist" style="margin-top:8px"><button role="tab" aria-selected="${f.mode === 'and'}" data-act="mode" data-v="and">모두 함께한 추억</button><button role="tab" aria-selected="${f.mode === 'or'}" data-act="mode" data-v="or">누구든 함께한 추억</button></div>` : ''}</div>
    <label class="field"><span class="cap">우리 공간</span><select data-filter="group"><option value="">전체</option>${gg.groups.map(g => `<option value="${g.id}" ${+f.group === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select><small>우리 공간에 연결한 추억만 보여요. 우리 공간 멤버라는 이유만으로 함께한 사람으로 보지 않아요.</small></label>
    <label class="field"><span class="cap">연도</span><select data-filter="year"><option value="">전체</option>${Array.from({ length: 12 }, (_, i) => yr - i).map(y => `<option ${+f.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
    ${active ? '<button class="btn sm line" data-act="clear-filter">필터 해제</button>' : ''}</div></details>`;
  const sumTxt = [f.people.length && pp.friends.filter(u => f.people.includes(u.id)).map(u => u.name).join(', '), f.group && gg.groups.find(g => g.id === +f.group)?.name, f.month && `${f.month.slice(0, 4)}년 ${+f.month.slice(5)}월`, f.region].filter(Boolean).join(' · ');
  const chipsUi = tab !== 'today' && active ? `<div class="chips" aria-label="적용 중인 필터">${f.people.map(id => `<button class="chip on" data-act="rm-filter" data-k="people" data-v="${id}">${esc(pp.friends.find(u => u.id === id)?.name || '')} ${I('x', 's')}</button>`).join('')}${f.group ? `<button class="chip on" data-act="rm-filter" data-k="group">${esc(gg.groups.find(g => g.id === +f.group)?.name || '')} ${I('x', 's')}</button>` : ''}${f.year ? `<button class="chip on" data-act="rm-filter" data-k="year">${f.year}년 ${I('x', 's')}</button>` : ''}</div>` : '';
  const hint = f.people.length > 1 ? `<p class="cap">${f.mode === 'and' ? '선택한 사람이 모두 함께한 추억만 보여줘요.' : '선택한 사람 중 누구든 함께한 추억을 보여줘요.'}</p>` : '';
  let body = '';
  if (tab === 'list') {
    const posts = flt((await api('GET', '/api/posts?' + qs)).posts);
    const byYear = {}; posts.forEach(p => (byYear[(p.occurred_on || '날짜 미상').slice(0, 4)] ||= []).push(p));
    body = posts.length ? `<p class="cap" style="margin:16px 0 12px">${active ? '조건에 맞는 추억 ' : '추억 '}${posts.length}개 · 최근 순</p><div class="feed">${posts.map(postCard).join('')}</div>` : (active ? empty('선택한 조건의 추억이 없어요', `선택한 조건: ${esc(sumTxt)}. 필터를 바꾸거나 해제해 보세요.`, '<button class="btn" data-act="clear-filter">필터 해제</button>') : empty('아직 남긴 추억이 없어요.', '함께했던 하루를 첫 번째 추억으로 남겨보세요.', '<a class="btn" href="#/new-post">첫 추억 만들기</a>'));
  } else if (tab === 'cal') {
    const posts = flt((await api('GET', '/api/posts?' + qs)).posts), { meetups } = await api('GET', '/api/meetups').catch(() => ({ meetups: [] }));
    const cal = S.cal ||= { ym: (posts[0]?.occurred_on || localDate()).slice(0, 7), day: '', f: 'all' }; cal.f ||= 'all';
    const showM = cal.f !== 'plan', showP = cal.f !== 'mem', ld = iso => new Date(iso).toLocaleDateString('sv');
    const [Y, M] = cal.ym.split('-').map(Number), first = new Date(Y, M - 1, 1).getDay(), days = new Date(Y, M, 0).getDate(), by = {}, pby = {};
    posts.forEach(p => p.occurred_on && (by[p.occurred_on] ||= []).push(p)); meetups.forEach(m => (pby[ld(m.starts_at)] ||= []).push(m));
    const inMonth = posts.filter(p => (p.occurred_on || '').startsWith(cal.ym)), planMonth = meetups.filter(m => ld(m.starts_at).startsWith(cal.ym)).sort((x, y) => x.starts_at.localeCompare(y.starts_at));
    const lm = showM ? (cal.day ? by[cal.day] || [] : inMonth) : [], lp = showP ? (cal.day ? pby[cal.day] || [] : planMonth) : [];
    const cells = Array.from({ length: first }, () => '<span></span>').concat(Array.from({ length: days }, (_, i) => { const d = `${cal.ym}-${String(i + 1).padStart(2, '0')}`, c = showM ? (by[d] || []).length : 0, pc = showP ? (pby[d] || []).length : 0; return `<button class="cal-d${cal.day === d ? ' on' : ''}" data-act="cal-day" data-v="${d}" aria-pressed="${cal.day === d}" aria-label="${M}월 ${i + 1}일${c ? ', 추억 ' + c + '개' : ''}${pc ? ', 약속 ' + pc + '개' : ''}"><span class="n">${i + 1}</span><span class="dots"><i class="${c ? 'mk' : ''}"></i><i class="${pc ? 'pk' : ''}"></i></span></button>`; }));
    body = `<div class="row between" style="margin-top:12px;gap:8px;flex-wrap:wrap"><div class="chips">${[['all', '전체'], ['plan', '약속'], ['mem', '추억']].map(([k, l]) => `<button class="chip${cal.f === k ? ' on' : ''}" aria-pressed="${cal.f === k}" data-act="cal-f" data-v="${k}">${l}</button>`).join('')}</div><span class="cal-lg"><span><i class="mk"></i>추억</span><span><i class="pk"></i>약속</span></span></div>
      <div class="card cal"><div class="cal-h"><button class="icon-btn" data-act="cal-move" data-v="-1" aria-label="이전 달">${I('back')}</button><span><b>${Y}년 ${M}월</b><span class="cap">${showM ? `추억 ${inMonth.length}개` : ''}${showM && showP ? ' · ' : ''}${showP ? `약속 ${planMonth.length}개` : ''}</span></span><button class="icon-btn" data-act="cal-move" data-v="1" aria-label="다음 달">${I('chev')}</button></div><div class="cal-g">${['일', '월', '화', '수', '목', '금', '토'].map((w, i) => `<span class="w${i === 0 ? ' su' : ''}">${w}</span>`).join('')}${cells.join('')}</div></div>
      <h2 class="cal-t">${cal.day ? fmtDate(cal.day) : `${M}월`}</h2>
      ${lp.length ? `<div class="stack" style="gap:12px;margin-bottom:12px">${lp.map(m => planCard(m).replace('class="plan', 'class="plan dash')).join('')}</div>` : ''}
      ${lm.length ? `<div class="feed">${lm.map(postCard).join('')}</div>` : ''}${lp.length || lm.length ? '' : '<p class="sub body2">이 날의 약속이나 추억이 없어요.</p>'}`;
  } else if (tab === 'space') {
    const cnt = await Promise.all(gg.groups.map(g => api('GET', '/api/posts?group=' + g.id).then(r => r.posts.length).catch(() => 0)));
    body = gg.groups.length ? `<div class="stack" style="margin-top:16px;gap:12px">${gg.groups.map((g, i) => `<a class="card pad space" href="#/space/${g.id}"><span class="grow"><b>${esc(g.name)}</b><span class="cap">멤버 ${g.members.length}명 · 볼 수 있는 추억 ${cnt[i]}개</span><span class="avs">${g.members.slice(0, 5).map(m => av(m.name, 's')).join('')}</span></span>${I('chev', 's')}</a>`).join('')}<button class="btn line block" data-act="group-new">우리 공간 만들기</button></div>`
      : empty('아직 우리 공간이 없어요', '자주 함께하는 친구들과 공간을 만들면, 같이 쓰는 추억을 한곳에서 볼 수 있어요. 공간에 연결해도 추억은 직접 초대한 사람만 볼 수 있어요.', '<button class="btn" data-act="group-new">우리 공간 만들기</button>');
  } else if (tab === 'map') {
    const m = await api('GET', '/api/map?' + qs);
    window._map = m;
    body = m.total ? `<p class="cap" style="margin-top:12px">내가 볼 수 있는 추억의 대표 사진을 장소별로 모았어요. 기록한 장소를 모은 것이라 실제 이동 경로와 다를 수 있어요. 목록 탭에서 같은 기록을 볼 수 있어요.</p>` + m.countries.map((c, ci) => `<section class="sec"><h2>${esc(c.country)} <span class="sub body2">· ${c.count}개의 추억</span></h2><div class="markers">${c.cities.map((city, i) => { const cv = city.items.find(x => x.cover)?.cover; return `<button class="marker" data-act="marker" data-c="${ci}" data-i="${i}" aria-pressed="false" aria-label="${esc(city.city)} 추억 ${city.count}개 보기"><span class="mk-ph">${cv ? `<img loading="lazy" src="/media/${cv}" alt="">` : KNOT}<b class="badge">${city.count}</b></span><span class="body2">${esc(city.city)}</span></button>`; }).join('')}</div></section>`).join('') + '<div id="preview" class="preview" hidden></div><a class="pill" href="#/memories?tab=list">' + I('list', 's') + ' 목록 보기</a>'
      : empty(active ? '선택한 조건의 추억이 없어요' : '아직 지도에 남긴 추억이 없어요', active ? `선택한 조건: ${esc(sumTxt)}. 필터를 바꾸거나 해제해 보세요.` : '추억을 만들 때 장소를 함께 남겨 보세요.', active ? '<button class="btn" data-act="clear-filter">필터 해제</button>' : '<a class="btn" href="#/new-post">새 추억 만들기</a>');
  } else {
    const t = await api('GET', '/api/today?date=' + localDate());
    body = !t.enabled ? `<div class="card pad stack" style="margin-top:12px"><h2>1년 전 오늘</h2><p class="sub body2">켜면 앱 안에서 오늘과 같은 날의 지난 추억을 보여줘요. 알림은 보내지 않아요. 숨기거나 다시 추천하지 않을 수 있고, 언제든 끌 수 있어요. 끈다고 기록이 삭제되지는 않아요.</p><button class="btn" data-act="mem" data-v="1">켜기</button></div>`
      : t.items.length ? `<section class="sec"><h2 style="margin-bottom:12px">그날의 우리가 여기 있어요.</h2><p class="cap" style="margin-bottom:12px">함께 남긴 사진과 이야기를 다시 살펴보세요.</p><div class="feed">${t.items.map(p => `<div>${postCard(p)}<div class="row" style="margin-top:8px;flex-wrap:wrap"><a class="btn sm sec2" href="#/post/${p.id}?add=1">기억 더하기</a><button class="btn sm line" data-act="save" data-id="${p.id}">${p.saved ? '저장함' : '저장'}</button><button class="btn sm line" data-act="hide-post" data-id="${p.id}">다시 추천하지 않기</button></div></div>`).join('')}</div></section>`
        : empty('오늘과 연결된 추억이 없어요.', '기록은 그대로 안전하게 보관되어 있어요.');
  }
  return `<header class="top"><h1>추억</h1><a class="btn sm sec2 only-pc" href="#/new-post">새 추억</a></header><div class="page" style="padding-top:8px"><div class="seg" role="tablist" aria-label="보기 방식">${[['list', '모든 추억'], ['space', '우리 공간']].map(([k, l]) => `<button role="tab" aria-selected="${(k === 'space') === (tab === 'space')}" data-act="tab" data-v="${k}">${l}</button>`).join('')}</div>${tab === 'space' ? '' : `<div class="chips" style="margin-top:12px" aria-label="보기">${[['list', '피드'], ['cal', '달력']].map(([k, l]) => `<button class="chip${tab === k ? ' on' : ''}" aria-pressed="${tab === k}" data-act="tab" data-v="${k}">${l}</button>`).join('')}</div>`}<div class="stack" style="margin-top:12px">${feedFilter}${tab === 'space' ? '' : hint}</div>${body}</div>${tab === 'today' || tab === 'space' ? '' : `<a class="fab" href="#/new-post">새 추억</a>`}`;
};

const REGIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
// Natural Earth 1:10m 행정구역 중심점 기반. 수도권 세 지역만 52px 마커 충돌을 피하도록 제한적으로 벌렸다.
const REGION_POS = { 서울: [34, 13], 인천: [17, 12], 경기: [49, 16], 강원: [61, 9], 충북: [50, 28], 세종: [36, 31], 충남: [29, 33], 대전: [40, 38], 경북: [67, 38], 대구: [65, 49], 전북: [36, 50], 광주: [27, 62], 전남: [32, 70], 경남: [58, 61], 부산: [74, 68], 울산: [77, 57], 제주: [30, 93] };
const KOREA_COUNTRIES = new Set(['대한민국', '한국', 'South Korea', 'Republic of Korea', 'Korea', '기타']);
const isKorea = c => KOREA_COUNTRIES.has(String(c || '').trim());
const regionOf = c => { const x = String(c || '').replace(/(특별자치시|특별자치도|특별시|광역시|도)$/, ''); return { 충청북: '충북', 충청남: '충남', 전라북: '전북', 전라남: '전남', 경상북: '경북', 경상남: '경남' }[x] || x.slice(0, 2); };
const regionMap = m => { const by = {}; m.countries.filter(c => isKorea(c.country)).forEach(c => c.cities.forEach(ct => { const k = regionOf(ct.city); (by[k] ||= []).push(...ct.items); })); return by; };
const SEOUL_DISTRICT = { 망원한강공원: '마포구', 연남동: '마포구', 망원동: '마포구', 합정: '마포구', 성수동: '성동구', 서울숲: '성동구', 종로: '종로구', 연희동: '서대문구', 반포한강공원: '서초구', 남산: '중구', 을지로: '중구' };
const districtOf = (p, region = '') => { const area = String(p?.area || '').trim(); if (region === '서울') return SEOUL_DISTRICT[area] || (/구$/.test(area) ? area : area || '세부 지역 미지정'); return area || '세부 지역 미지정'; };
const regionMemoryCard = p => `<a class="region-memory-card" href="#/post/${p.id}"><span class="region-thumb">${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}</span><span class="region-copy"><b>${esc(p.title)}</b><span class="region-place">${fmtDate(p.occurred_on)}${p.label ? ' · ' + esc(p.label) : ''}</span><span class="region-meta">사진 ${p.photo_count || 0}장 · 이야기 ${p.story_count || 0}개</span></span><span class="region-chevron">${I('chev', 's')}</span></a>`;
function REGION_UI(region) {
  const items = S.footBy?.[region]?.items || [];
  const b = sheet(`<div class="region-sheet"><div class="thread-head"><div><h2>${esc(region)}의 발자국</h2><p class="cap">추억 ${items.length}개</p></div><button class="icon-btn" data-act="sheet-close" aria-label="닫기">${I('x')}</button></div><div class="region-preview">${items.slice(0, 2).map(p => `<a class="region-mini" href="#/post/${p.id}"><span>${p.cover ? `<img src="/media/${p.cover}" alt="">` : KNOT}</span><b>${esc(p.title)}</b><small>${esc(region)} &gt; ${esc(districtOf(p, region))} · ${fmtDate(p.occurred_on)}</small></a>`).join('')}</div><a class="btn block" href="#/foot-region/${encodeURIComponent(region)}">전체 추억 보기</a></div>`);
  b.querySelector('a[href^="#/foot-region/"]')?.addEventListener('click', closeSheet);
}
P.foot = async () => {
  const f = S.foot ||= { mode: 'all', people: [], region: '', scope: 'domestic' }; f.scope ||= 'domestic';
  const pp = await api('GET', '/api/people'), withMode = f.mode === 'with';
  const m = await api('GET', '/api/map?' + new URLSearchParams({ people: withMode ? f.people.join(',') : '', mode: 'and' }));
  const domestic = m.countries.filter(c => isKorea(c.country)), overseas = m.countries.filter(c => !isKorea(c.country));
  const by = {}; domestic.forEach(c => c.cities.forEach(ct => { const k = regionOf(ct.city); (by[k] ||= { items: [] }).items.push(...ct.items); }));
  S.footBy = by;
  const activeRegions = REGIONS.filter(r => by[r]), n = activeRegions.length, domesticTotal = domestic.reduce((sum, c) => sum + c.count, 0);
  const marker = r => { const it = by[r].items[0], [x, y] = REGION_POS[r]; return `<button class="map-marker on" style="--mx:${x}%;--my:${y}%" data-act="foot-region" data-v="${r}" aria-label="${r}, 추억 ${by[r].items.length}개, 눌러서 보기"><span class="map-marker-img">${it?.cover ? `<img loading="lazy" src="/media/${it.cover}" alt="">` : esc(r[0])}</span><span class="map-count">${by[r].items.length}</span><span class="map-label">${r}</span></button>`; };
  const overseasHtml = overseas.length ? `<section class="country-list" aria-label="해외에서 남긴 추억">${overseas.map(c => { const items = c.cities.flatMap(x => x.items), cover = items.find(x => x.cover)?.cover; return `<a class="country-card" href="#/foot-country/${encodeURIComponent(c.country)}"><span class="country-photo">${cover ? `<img loading="lazy" src="/media/${cover}" alt="">` : KNOT}</span><span><b>${esc(c.country)}</b><small>추억 ${c.count}개 · 도시 ${c.cities.length}곳</small></span>${I('chev', 's')}</a>`; }).join('')}</section>` : `<div class="foot-empty"><h2>아직 해외에 남긴 발자국이 없어요</h2><p>해외에서 함께한 추억을 기록하면 이곳에서 다시 만날 수 있어요.</p></div>`;
  return `<header class="top"><h1>우리의 발자국</h1></header><div class="page stack" style="padding-top:8px">
    <p class="sub body2">함께한 순간이 남아 있는 곳을 다시 찾아보세요.</p>
    <div class="seg" role="tablist" aria-label="국내외 발자국"><button role="tab" aria-selected="${f.scope === 'domestic'}" data-act="foot-scope" data-v="domestic">국내</button><button role="tab" aria-selected="${f.scope === 'overseas'}" data-act="foot-scope" data-v="overseas">해외</button></div>
    <div class="seg" role="tablist" aria-label="발자국 종류">${[['all', '우리의 발자국'], ['with', '함께한 발자국']].map(([k, l]) => `<button role="tab" aria-selected="${f.mode === k}" data-act="foot-mode" data-v="${k}">${l}</button>`).join('')}</div>
    ${withMode ? `<div class="chips" aria-label="함께한 사람">${pp.friends.map(u => `<button class="chip${f.people.includes(u.id) ? ' on' : ''}" aria-pressed="${f.people.includes(u.id)}" data-act="foot-person" data-v="${u.id}">${esc(u.name)}</button>`).join('') || '<span class="cap">연결된 사람이 없어요</span>'}</div>` : ''}
    ${f.scope === 'domestic' ? `<div class="foot-stats"><div><span class="cap">기록된 지역</span><b>${n}<small> / 17곳</small></b></div><div><span class="cap">연결된 추억</span><b>${domesticTotal}<small>개</small></b></div></div><div class="korea-map" aria-label="대한민국 지역별 추억 지도"><img class="korea-shape" src="/brand/korea-admin1.svg" alt="">${activeRegions.map(marker).join('')}</div>${n ? `<section class="foot-region-summary"><div class="row between"><h2>추억이 있는 지역</h2><span class="cap">${n}곳</span></div>${activeRegions.map(r => { const p = by[r].items[0]; return `<button data-act="foot-region" data-v="${r}"><span>${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}</span><b>${r}</b><small>추억 ${by[r].items.length}개</small>${I('chev', 's')}</button>`; }).join('')}</section>` : '<div class="foot-empty"><h2>아직 국내에 남긴 발자국이 없어요</h2><p>추억에 지역을 연결하면 이곳에서 다시 만날 수 있어요.</p></div>'}` : overseasHtml}
    <p class="cap">발자국은 추억을 볼 수 있는 사람에게만 보여요.</p></div>`;
};
P.footRegion = async raw => {
  const region = decodeURIComponent(raw), f = S.foot || { mode: 'all', people: [] }, m = await api('GET', '/api/map?' + new URLSearchParams({ people: f.mode === 'with' ? f.people.join(',') : '', mode: 'and' })), items = regionMap(m)[region] || [];
  const districts = [...new Set(items.map(p => districtOf(p, region)))];
  return `${top(region + '의 발자국')}<div class="page stack region-page"><div><h1>세부 지역</h1><p class="sub body2">${items.length ? `${region} 안에서 추억이 있는 곳을 골라보세요.` : '아직 이 지역에 남긴 추억이 없어요.'}</p></div><div class="city-list">${districts.map(d => `<a href="#/foot-district/${encodeURIComponent(region)}/${encodeURIComponent(d)}"><span><b>${esc(region)} &gt; ${esc(d)}</b><small>추억 ${items.filter(p => districtOf(p, region) === d).length}개</small></span>${I('chev', 's')}</a>`).join('') || '<div class="card pad sub body2">다른 지역의 발자국을 살펴보세요.</div>'}</div></div>`;
};
P.footDistrict = async (rawRegion, rawDistrict) => {
  const region = decodeURIComponent(rawRegion), district = decodeURIComponent(rawDistrict), f = S.foot || { mode: 'all', people: [] }, m = await api('GET', '/api/map?' + new URLSearchParams({ people: f.mode === 'with' ? f.people.join(',') : '', mode: 'and' })), items = (regionMap(m)[region] || []).filter(p => districtOf(p, region) === district);
  return `${top(region + ' > ' + district)}<div class="page stack region-page"><div><h1>이곳의 추억</h1><p class="sub body2">${items.length}개의 추억이 이어져 있어요.</p></div><div class="region-memory-list">${items.map(regionMemoryCard).join('') || '<div class="card pad sub body2">볼 수 있는 추억이 없어요.</div>'}</div></div>`;
};
P.footCountry = async raw => {
  const country = decodeURIComponent(raw), f = S.foot || { mode: 'all', people: [] }, m = await api('GET', '/api/map?' + new URLSearchParams({ people: f.mode === 'with' ? f.people.join(',') : '', mode: 'and' })), c = m.countries.find(x => x.country === country);
  return `${top(country + '의 발자국')}<div class="page stack region-page"><p class="sub body2">도시를 골라 함께 남긴 추억을 살펴보세요.</p><div class="city-list">${c ? c.cities.map(city => `<a href="#/foot-city/${encodeURIComponent(country)}/${encodeURIComponent(city.city)}"><span><b>${esc(city.city)}</b><small>추억 ${city.count}개</small></span>${I('chev', 's')}</a>`).join('') : '<div class="card pad sub body2">볼 수 있는 추억이 없어요.</div>'}</div></div>`;
};
P.footCity = async (rawCountry, rawCity) => {
  const country = decodeURIComponent(rawCountry), cityName = decodeURIComponent(rawCity), f = S.foot || { mode: 'all', people: [] }, m = await api('GET', '/api/map?' + new URLSearchParams({ people: f.mode === 'with' ? f.people.join(',') : '', mode: 'and' })), city = m.countries.find(x => x.country === country)?.cities.find(x => x.city === cityName), items = city?.items || [];
  return `${top(cityName + '의 발자국')}<div class="page stack region-page"><div><h1>이곳의 추억</h1><p class="sub body2">${items.length}개의 추억이 이어져 있어요.</p></div><div class="region-memory-list">${items.map(regionMemoryCard).join('') || '<div class="card pad sub body2">볼 수 있는 추억이 없어요.</div>'}</div></div>`;
};

P.meetups = async () => {
  const { meetups } = await api('GET', '/api/meetups'), now = new Date().toISOString();
  const up = meetups.filter(m => m.starts_at >= now && m.status === 'active').reverse(), past = meetups.filter(m => !(m.starts_at >= now && m.status === 'active'));
  return `${top('약속', { right: `<a class="btn sm" href="#/new-meetup">새 약속</a>` })}<div class="page">
    <section><h2 style="margin-bottom:12px">다가오는 약속</h2>${up.length ? `<div class="stack" style="gap:12px">${up.map(planCard).join('')}</div>` : empty('예정된 약속이 없어요', '함께할 사람을 초대해 약속을 잡아 보세요.', '<a class="btn" href="#/new-meetup">새 약속 만들기</a>')}</section>
    ${past.length ? `<section class="sec"><h2 style="margin-bottom:12px">지난 약속</h2><div class="stack" style="gap:12px">${past.map(planCard).join('')}</div></section>` : ''}</div>`;
};

P.newMeetup = async () => {
  const [pp, gg] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/groups')]); window._groups = gg.groups;
  if (!pp.friends.length) return `${top('새 약속')}${empty('함께할 사람을 먼저 연결해 주세요', '연결된 사람을 약속에 초대할 수 있어요.', '<a class="btn" href="#/people">사람 연결하기</a>')}`;
  return `${top('새 약속 만들기')}<form class="page stack" data-form="newmeetup">
    <label class="field"><span>약속 이름</span><input type="text" name="title" maxlength="40" required></label>
    ${whenFields()}
    <label class="field"><span>설명 (선택)</span><textarea name="descr" maxlength="500"></textarea></label>
    <div class="field"><span>누구를 초대할까요?</span>${pick(pp.friends, 'm')}
      ${gg.groups.length ? `<label class="field" style="margin-top:12px"><span class="cap">우리 공간으로 빠르게 고르기 (선택)</span><select name="group" data-fillgroup><option value="">우리 공간 없이 사람만 고를게요</option>${gg.groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select><small>초대 시점의 우리 공간 멤버만 초대돼요. 이후 멤버가 바뀌어도 초대는 바뀌지 않아요.</small></label>` : ''}</div>
    <p class="err" role="alert"></p><button class="btn block">약속 만들기</button></form>`;
};

const RS = { yes: I('cc', 's') + ' 참석', no: I('cx', 's') + ' 불참', maybe: I('cd', 's') + ' 미정', invited: I('clock', 's') + ' 응답 대기' };
P.meetup = async id => {
  const m = await api('GET', '/api/meetups/' + id), isOrg = m.organizer_id === S.me.id, started = Date.parse(m.starts_at) <= Date.now(), cancelled = m.status === 'cancelled';
  window._m = m;
  const rs = m.mine.rsvp;
  return `${top('약속', { right: isOrg && !cancelled ? `<button class="icon-btn" data-act="meetup-menu" aria-label="더 보기">${I('more')}</button>` : '' })}<div class="page stack" style="padding-top:8px">
    <div><h1${cancelled ? ' style="text-decoration:line-through"' : ''}>${esc(m.title)}</h1>${cancelled ? '<span class="tag warn">취소된 약속</span>' : ''}<div class="pl-lines"><span>${I('cal')}${new Date(m.starts_at).toLocaleDateString('ko-KR', { timeZone: m.tz || localTz, year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</span><span${!m.time_kind || m.time_kind === 'exact' ? '' : ' class="muted"'}>${I('clock')}${timeTxt(m)}</span><span${m.place ? '' : ' class="muted"'}>${I('pin')}${placeTxt(m)}${m.place_kind === 'area' ? ' <small class="cap">지역만 정했어요</small>' : ''}</span></div><p class="sub body2">주최 ${esc(m.organizer)}</p>${m.descr ? `<p style="margin-top:8px;white-space:pre-wrap">${esc(m.descr)}</p>` : ''}</div>
    ${m.changed && !cancelled ? `<div class="note">${esc(m.changed)}</div>` : ''}
    ${isOrg && started && !cancelled ? `<div class="note stack"><span>약속이 끝났어요. 실제로 함께한 사람을 확인하면 추억을 만들 때 바로 고를 수 있어요.</span><button class="btn" data-act="att-open">실제 함께한 사람 확인하기</button></div>` : ''}
    ${!cancelled && !isOrg && !started ? `<section><h3 style="margin-bottom:12px">참석할 수 있나요?</h3>${rs === 'invited' ? '<p class="cap" style="margin-bottom:12px">일정이 새로 정해졌거나 바뀌었어요. 다시 응답해 주세요.</p>' : ''}<div class="rsvp">${[['yes', '참석', 'cchk'], ['maybe', '미정', 'cd'], ['no', '불참', 'cx']].map(([k, l, i]) => `<button data-act="rsvp" data-v="${k}" aria-pressed="${rs === k}">${I(i)}<span>${l}</span></button>`).join('')}</div></section>` : ''}
    <section><h2 style="margin-bottom:12px">함께하는 사람 ${m.participants.length}명</h2><div class="card list">${m.participants.map(p => `<div>${av(p.name)}<span class="grow">${esc(p.name)}${p.id === m.organizer_id ? ' <span class="tag">주최</span>' : ''}</span>${started ? `<span class="tag">${p.attended ? '실제 참석 확인' : '참석 미확인'}</span>` : ''}<span class="body2">${RS[p.rsvp]}</span></div>`).join('')}</div><p class="cap" style="margin-top:8px">응답은 약속이고, 실제 참석은 약속 뒤에 주최자가 확인해요.</p></section>
    ${cancelled || (!m.posts.length && !started) ? '' : `<section><h2 style="margin-bottom:12px">${m.posts.length ? '함께한 추억' : '이 약속의 추억'}</h2>${m.posts.length ? `<div class="feed">${m.posts.map(postCard).join('')}</div><a class="btn block" style="margin-top:12px" href="#/post/${m.posts[0].id}">함께한 추억 보기</a>` : `<p class="sub body2" style="margin-bottom:12px">아직 남긴 추억이 없어요.</p><button class="btn block" data-act="meetup-post">이 약속을 추억으로 남기기</button>`}<p class="cap" style="margin-top:8px">추억은 직접 고른 사람에게만 초대가 가요. 약속에 초대된 것만으로 볼 수 있지 않아요.</p></section>`}
    <section><div class="row between" style="margin-bottom:12px"><h2>정산</h2>${cancelled ? '' : `<button class="btn sm sec2" data-act="settle-new">정산 만들기</button>`}</div>
      ${m.settlements.length ? m.settlements.map(s => { const done = s.shares.filter(x => x.confirmed).length, mineS = s.shares.find(x => x.id === S.me.id);
        return `<div class="card pad stack" style="margin-bottom:12px"><div class="row between"><b>${esc(s.title)}</b><span class="tag ${s.status === 'done' ? '' : 'warn'}">${s.status === 'done' ? '모두 확인함' : `${done}/${s.shares.length}명 확인`}</span></div><p class="cap">${esc(s.payer)}님이 ${won(s.total)}을 냈어요</p><div class="bar" aria-hidden="true"><i style="width:${done / s.shares.length * 100}%"></i></div>
        <div class="list" style="margin:0 -16px">${s.shares.map(x => `<div style="padding:8px 16px">${av(x.name, 's')}<span class="grow body2">${esc(x.name)}</span><b class="body2">${won(x.amount)}</b><span class="tag">${x.confirmed ? I('check', 's') + ' 확인' : '미확인'}</span></div>`).join('')}</div>
        <div class="row">${mineS && !mineS.confirmed ? `<button class="btn sm" data-act="settle-ok" data-id="${s.id}">내 몫 확인했어요</button>` : ''}${s.creator_id === S.me.id ? `<button class="btn sm dline" data-act="settle-del" data-id="${s.id}">정산 삭제</button>` : ''}</div></div>`; }).join('') : '<p class="sub body2">아직 정산이 없어요.</p>'}
      <p class="cap">정산 금액은 정산에 포함된 사람에게만 보이고, 추억·지도·회상에는 나타나지 않아요. ‘확인’은 각자 확인했다는 표시예요. 우리사이는 송금을 대신하지 않아요.</p></section></div>`;
};

P.people = async () => {
  const d = await api('GET', '/api/people');
  return `${top('사람')}<div class="page stack">
    <form data-form="request" class="row" style="align-items:flex-end"><label class="field grow"><span>이름으로 연결하기</span><input type="text" name="username" placeholder="예) minsu" autocapitalize="none" required></label><button class="btn" style="flex:none">연결 요청</button></form><p class="err" role="alert" id="reqerr"></p>
    <div class="card pad stack"><div class="row between"><b>초대 링크로 연결하기</b><button class="btn sm sec2" data-act="link-new">링크 만들기</button></div><ol class="steps"><li>링크를 만들어 연결하고 싶은 사람에게 보내요</li><li>받은 사람이 로그인한 뒤 연결을 확인해요</li><li>연결되면 함께 추억을 만들 수 있어요</li></ol><p class="cap">링크는 한 번만 쓸 수 있고 7일 뒤 만료돼요. 연결만으로 서로의 추억을 볼 수는 없어요.</p>
      ${d.links.map(l => { const u = `${location.origin}/#/join/${l.code}`, days = Math.max(1, Math.ceil((Date.parse(l.expires_at) - Date.now()) / 864e5)); return `<div class="codecard"><span class="cap">내 초대 링크 · ${days}일 뒤 만료 · 1회용</span><code>${esc(u)}</code><div class="row"><button class="btn grow" data-act="share" data-v="${esc(u)}">공유하기</button><button class="btn line" data-act="copy" data-v="${esc(u)}">복사</button><button class="btn dline" data-act="link-del" data-id="${esc(l.code)}">회수</button></div></div>`; }).join('')}</div>
    ${d.incoming.length ? `<section><h2 style="margin-bottom:12px">받은 요청</h2><div class="card list">${d.incoming.map(u => `<div>${av(u.name)}<span class="grow"><b>${esc(u.name)}</b><br><span class="cap">@${esc(u.username)}</span></span><button class="btn sm" data-act="accept-friend" data-id="${u.id}">수락</button><button class="btn sm line" data-act="decline-friend" data-id="${u.id}">거절</button></div>`).join('')}</div></section>` : ''}
    <section><h2 style="margin-bottom:12px">연결된 사람 ${d.friends.length}명</h2>${d.friends.length ? `<div class="card list">${d.friends.map(u => `<div>${av(u.name)}<span class="grow"><b>${esc(u.name)}</b><br><span class="cap">@${esc(u.username)}</span></span><button class="icon-btn" data-act="friend-menu" data-id="${u.id}" data-name="${esc(u.name)}" aria-label="${esc(u.name)} 관리">${I('more')}</button></div>`).join('')}</div>` : '<p class="sub body2">아직 연결된 사람이 없어요.</p>'}</section>
    ${d.outgoing.length ? `<section><h2 style="margin-bottom:12px">보낸 요청</h2><div class="card list">${d.outgoing.map(u => `<div>${av(u.name)}<span class="grow">${esc(u.name)}</span><button class="btn sm line" data-act="decline-friend" data-id="${u.id}">취소</button></div>`).join('')}</div></section>` : ''}</div>`;
};

// 우리 공간(이전 이름: group): 추억 탭의 '우리 공간' 보기에서 들어오는 공간 상세. 공간은 권한을 주지 않는다 — 목록은 내가 볼 수 있는 추억만(/api/posts?group=)
P.groups = async () => { setTimeout(() => go('/memories?tab=space'), 0); return ''; }; // 예전 주소(#/groups)는 우리 공간 보기로
P.space = async id => {
  const { groups } = await api('GET', '/api/groups'), g = groups.find(x => x.id === +id);
  if (!g) throw Object.assign(new Error('이 공간은 볼 수 없어요.'), { status: 404 });
  const { posts } = await api('GET', '/api/posts?group=' + g.id).catch(() => ({ posts: [] })), own = g.owner_id === S.me.id;
  return `${top(g.name, { right: `<button class="btn sm line" data-act="space-set" data-g="${g.id}">공간 설정</button>` })}<div class="page stack" style="padding-top:8px">
    <section class="card pad stack"><div class="row between"><h2>멤버 ${g.members.length}명</h2>${own ? `<button class="btn sm line" data-act="group-add" data-g="${g.id}">친구 초대하기</button>` : ''}</div>
      <div class="row" style="flex-wrap:wrap;gap:8px">${g.members.map(m => `<span class="chip" style="cursor:default">${esc(m.name)}${m.id === g.owner_id ? ' <span class="cap">소유자</span>' : ''}${own && m.id !== S.me.id ? ` <button class="icon-btn" style="width:24px;height:24px" data-act="group-kick" data-g="${g.id}" data-u="${m.id}" aria-label="${esc(m.name)} 내보내기">${I('x', 's')}</button>` : ''}</span>`).join('')}</div></section>
    <section class="stack"><h2>볼 수 있는 추억 ${posts.length}개</h2><p class="cap">공간 멤버라도 초대받은 추억만 볼 수 있어요. 이 목록에는 내가 볼 수 있는 추억만 보여요.</p>
      ${posts.length ? `<div class="feed">${posts.map(postCard).join('')}</div>` : '<p class="sub body2">아직 이 공간에서 볼 수 있는 추억이 없어요.</p>'}</section>
    <div class="stickybar"><button class="btn block" data-act="space-new-post" data-g="${g.id}">이 공간에 추억 만들기</button></div></div>`;
};
P.blocks = async () => { const { blocks } = await api('GET', '/api/blocks'); return `${top('차단한 사람')}<div class="page stack"><p class="sub body2">차단하면 서로 새 초대·댓글·알림이 중단되고 연결이 해제돼요. 상대에게 알리지 않아요.</p>${blocks.length ? `<div class="card list">${blocks.map(u => `<div>${av(u.name)}<span class="grow">${esc(u.name)}</span><button class="btn sm line" data-act="unblock" data-id="${u.id}">차단 해제</button></div>`).join('')}</div>` : empty('차단한 사람이 없어요', '')}</div>`; };
P.hidden = async () => { const h = await api('GET', '/api/hides'); const none = !h.posts.length && !h.users.length; return `${top('숨긴 추억')}<div class="page stack"><p class="sub body2">숨긴 추억은 목록과 지도, 오늘의 추억에 나타나지 않아요. 설정에서 언제든 바꿀 수 있어요.</p>${none ? empty('숨긴 추억이 없어요', '') : `<div class="card list">${h.posts.map(p => `<div><span class="grow">${esc(p.title)}</span><button class="btn sm line" data-act="unhide" data-t="post" data-id="${p.id}">다시 보기</button></div>`).join('')}${h.users.map(u => `<div><span class="grow">${esc(u.name)}님과의 추억 추천 안 함</span><button class="btn sm line" data-act="unhide" data-t="user" data-id="${u.id}">되돌리기</button></div>`).join('')}</div>`}</div>`; };
const CAT = { privacy: '동의 없는 사진/사생활 침해', harass: '괴롭힘·스토킹·위협', sexual_minor: '성적 콘텐츠·미성년자 안전', impersonation: '사칭·계정 도용', illegal: '불법·유해 콘텐츠', rights: '저작권/초상권 등 권리 침해', spam: '스팸·사기', other: '기타' };
const ST = { RECEIVED: '접수됨', TRIAGED: '분류됨', UNDER_REVIEW: '검토 중', ACTIONED: '조치됨', NO_ACTION: '조치 없음', APPEALED: '이의제기', FINAL: '종료' };
P.reports = async () => { const { reports } = await api('GET', '/api/reports'); return `${top('내 신고 내역')}<div class="page">${reports.length ? `<div class="card list">${reports.map(r => `<div><span class="grow"><b>${CAT[r.category]}</b><br><span class="cap">${r.created_at.slice(0, 10)} · ${{ post: '추억', note: '글', media: '사진', user: '사용자' }[r.target_type]}</span></span><span class="tag">${ST[r.status]}</span></div>`).join('')}</div><p class="cap" style="margin-top:8px">신고자의 신원은 상대에게 공개되지 않아요.</p>` : empty('신고한 내역이 없어요', '')}</div>`; };

P.me = async () => {
  const u = S.me;
  const [pp, all, fm] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/posts'), api('GET', '/api/map').catch(() => ({ total: 0, countries: [] }))]);
  const counts = await Promise.all(pp.friends.map(f => api('GET', '/api/posts?people=' + f.id).then(r => r.posts.length).catch(() => 0)));
  const first = all.posts.map(p => p.occurred_on).filter(Boolean).sort()[0], nRegion = REGIONS.filter(r => regionMap(fm)[r]).length;
  const row = (h, i, t, s = '') => `<a href="${h}">${I(i)}<span class="grow">${t}${s ? `<br><span class="cap">${s}</span>` : ''}</span>${I('chev', 's')}</a>`;
  return `<header class="top"><h1>나</h1></header><div class="page stack"><div class="row" style="gap:16px">${av(u.name, 'l')}<span class="grow"><b class="me-n">${esc(u.name)}</b><br><span class="cap">${first ? `${first.slice(0, 4)}년 ${+first.slice(5, 7)}월부터 기록 중` : '@' + esc(u.username)}</span></span><button class="btn sm line" data-act="rename">닉네임 변경하기</button></div>
    <div class="me-stats">${[['추억', all.posts.length], ['함께한 사람', pp.friends.length], ['지역', nRegion]].map(([l, v]) => `<div><span class="cap">${l}</span><b>${v}</b></div>`).join('')}</div>
    <section><h3 style="margin:0 0 8px 4px" class="cap">함께한 사람</h3>${pp.friends.length ? `<div class="card list">${pp.friends.map((f, i) => `<div style="min-height:52px">${av(f.name, 's')}<span class="grow">${esc(f.name)}</span><span class="cap">함께한 추억 ${counts[i]}</span></div>`).join('')}</div>` : '<p class="sub body2">아직 연결된 사람이 없어요. 아래 사람 메뉴에서 연결해 보세요.</p>'}</section>
    <div class="card list">${row('#/people', 'invite', '사람', '연결·초대 링크')}${row('#/groups', 'users', '우리 공간')}</div>
    <section><h3 style="margin:0 0 12px 4px">회상</h3><div class="card list"><div>${I('clock')}<span class="grow">1년 전 오늘<br><span class="cap">${u.mem_enabled ? '켜져 있어요. 앱 안에서만 보여줘요.' : '꺼져 있어요. 켜기 전에는 추천하지 않아요.'}</span></span><button class="btn sm ${u.mem_enabled ? 'line' : ''}" data-act="mem" data-v="${u.mem_enabled ? 0 : 1}">${u.mem_enabled ? '끄기' : '켜기'}</button></div>${row('#/hidden', 'eye', '숨긴 추억', '다시 추천하지 않기 관리')}</div></section>
    <section><h3 style="margin:0 0 12px 4px">안전·데이터</h3><div class="card list">${row('#/saved', 'bookmark', '저장한 추억', '나만 볼 수 있는 책갈피')}${row('#/privacy', 'lock', '개인정보 요청', '열람·정정·삭제·처리정지')}${row('#/blocks', 'block', '차단한 사람')}${row('#/reports', 'flag', '내 신고 내역')}<button class="li" data-act="export">${I('down')}<span class="grow">내 데이터 내보내기<br><span class="cap">내 프로필, 글, 사진 목록을 파일로 받아요</span></span></button></div></section>
    <div class="card list"><button class="li" data-act="logout">${I('out')}<span class="grow">로그아웃하기</span></button><button class="li" data-act="delete-account" style="color:var(--danger)">${I('block')}<span class="grow">계정 삭제하기</span></button></div>
    <p class="cap" style="text-align:center">이 추억에 초대된 사람만 볼 수 있어요.<br>우리사이 v0.1</p></div>`;
};

P.saved = async () => { const { posts } = await api('GET', '/api/saves'); return `${top('저장한 추억')}<div class="page stack"><p class="sub body2">저장한 추억은 나만 볼 수 있어요. 접근 권한이 사라지면 목록에서도 사라져요.</p>${posts.length ? `<div class="feed">${posts.map(postCard).join('')}</div>` : empty('저장한 추억이 없어요', '추억 상세의 더 보기에서 나만 보게 저장할 수 있어요.')}</div>`; };
const PK = { access: '개인정보 열람', correct: '개인정보 정정', delete: '개인정보 삭제', stop: '처리정지' };
P.privacy = async () => { const { requests } = await api('GET', '/api/privacy'); return `${top('개인정보 요청')}<div class="page stack"><p class="sub body2">내 개인정보의 열람, 정정, 삭제, 처리정지를 요청할 수 있어요. 접수한 요청과 처리 상태가 아래에 남아요.</p>
  <form data-form="privacy" class="stack"><div class="stack">${Object.entries(PK).map(([k, l], i) => `<label class="row" style="min-height:40px"><input type="radio" name="kind" value="${k}" ${i ? '' : 'required'} style="width:20px;height:20px"><span>${l}</span></label>`).join('')}</div><label class="field"><span class="cap">요청 내용 (선택)</span><textarea name="detail" maxlength="1000"></textarea></label><p class="err" role="alert"></p><button class="btn">요청 접수하기</button></form>
  ${requests.length ? `<section class="sec"><h2 style="margin-bottom:12px">접수한 요청</h2><div class="card list">${requests.map(r => `<div><span class="grow"><b>${PK[r.kind]}</b><br><span class="cap">${r.created_at.slice(0, 10)}</span></span><span class="tag">${{ RECEIVED: '접수됨', UNDER_REVIEW: '검토 중', DONE: '처리 완료', REJECTED: '처리 불가' }[r.status]}</span></div>`).join('')}</div></section>` : ''}</div>`; };
P.join = async code => {
  try { const r = await api('GET', '/api/invites/' + code); return `${top('연결 요청')}<div class="page stack"><div class="card pad stack"><h1>${esc(r.from)}님과 연결할까요?</h1><p class="sub body2">연결하면 서로의 추억에 초대할 수 있어요. 연결만으로 서로의 추억을 볼 수는 없어요. 이 링크는 한 번만 쓸 수 있어요.</p></div><button class="btn block" data-act="join" data-code="${esc(code)}">연결하기</button></div>`; }
  catch (e) { return `${top('연결 요청', { back: false })}${empty('사용할 수 없는 링크예요', esc(e.message), '<a class="btn" href="#/">홈으로</a>')}`; }
};

// ---------- 라우터 ----------
const routes = [[/^\/(terms|privacy-policy|help)$/, async () => docPage(location.hash.slice(1).split('?')[0]), 'me'], [/^\/$/, P.home, 'home'], [/^\/meetups$/, P.meetups, 'meetups'], [/^\/memories$/, P.memories, 'memories'], [/^\/foot$/, P.foot, 'foot'], [/^\/foot-region\/([^/]+)$/, P.footRegion, 'foot'], [/^\/foot-district\/([^/]+)\/([^/]+)$/, P.footDistrict, 'foot'], [/^\/foot-country\/([^/]+)$/, P.footCountry, 'foot'], [/^\/foot-city\/([^/]+)\/([^/]+)$/, P.footCity, 'foot'], [/^\/me$/, P.me, 'me'], [/^\/post\/(\d+)$/, P.post, ''], [/^\/new-post$/, P.newPost, ''], [/^\/new-meetup$/, P.newMeetup, 'meetups'], [/^\/meetup\/(\d+)$/, P.meetup, 'meetups'], [/^\/people$/, P.people, 'me'], [/^\/groups$/, P.groups, 'me'], [/^\/space\/(\d+)$/, P.space, 'memories'], [/^\/blocks$/, P.blocks, 'me'], [/^\/hidden$/, P.hidden, 'me'], [/^\/reports$/, P.reports, 'me'], [/^\/join\/([\w-]+)$/, P.join, 'me'], [/^\/saved$/, P.saved, 'me'], [/^\/privacy$/, P.privacy, 'me']];
let seq = 0;
async function route() {
  const my = ++seq, view = $('#view');
  if (!S.me) { try { S.me = await api('GET', '/api/me'); } catch { } }
  const [path, qs] = (location.hash.slice(1) || '/').split('?'); S.q = Object.fromEntries(new URLSearchParams(qs || ''));
  if (!S.me && !DOCS[path] && (S.guest ??= (() => { try { return sessionStorage.getItem('ws_guest') === '1'; } catch { return false; } })())) return guestRoute(path, view);
  if (!S.me) {
    if (DOCS[path]) { $('#app').classList.remove('authed'); $('#tabs').hidden = true; view.innerHTML = docPage(path); window.scrollTo(0, 0); return; }
    if (/^\/join\//.test(path)) { S.join = path; try { sessionStorage.setItem('ws_join', path); } catch { } }
    else if (!S.join) { try { S.join = sessionStorage.getItem('ws_join'); } catch { } }
    if (S.join && S.joinFrom === undefined) { try { S.joinFrom = (await api('GET', '/api/invites/' + S.join.split('/')[2] + '/peek')).from; } catch { S.joinFrom = null; S.authNotice = { msg: '초대가 만료되었어요. 초대한 사람에게 다시 요청해 주세요.' }; } }
    if (S.sns === undefined) { try { S.sns = await api('GET', '/api/oauth/providers'); } catch { S.sns = {}; } }
    if (path === '/signup/oauth') { try { S.pending = await api('GET', '/api/oauth/pending?t=' + encodeURIComponent(S.q.t || '')); S.authMode = 'oauth'; S.oauthStep ||= 'consent'; } catch (e) { S.authMode = 'intro'; history.replaceState(null, '', '#/'); toast(e.message, 4000); } }
    else if (S.authMode === 'oauth') S.authMode = 'intro';
    if (S.q.oauth_error) { S.authNotice = { msg: S.q.oauth_error === 'cancel' ? '로그인을 취소했어요.' : '지금은 해당 계정으로 로그인하기 어려워요.', retry: S.sns?.[S.q.p] ? S.q.p : null }; S.snsBusy = false; history.replaceState(null, '', '#/'); }
    $('#app').classList.remove('authed'); view.innerHTML = authView(); initSignup(); return;
  }
  if (S.intent) { const k = S.intent; S.intent = null; if (k === 'create') return go('/new-post'); }
  if (S.join) { const j = S.join; S.join = null; S.joinFrom = undefined; try { sessionStorage.removeItem('ws_join'); } catch { } if (path !== j) return go(j); }
  const r = routes.find(x => x[0].test(path)) || routes[0], args = r[0].exec(path).slice(1);
  const tabs = $('#tabs'); tabs.hidden = false;
  const T = [['home', '홈', 'home', '#/'], ['memories', '추억', 'photo', '#/memories'], ['new', '만들기', 'create'], ['foot', '발자국', 'pinned', '#/foot'], ['me', '나', 'user', '#/me']];
  $('#app').classList.add('authed');
  tabs.innerHTML = '<div class="brand"><img src="/logo.svg" alt=""><span class="wordmark">우리사이</span></div>' + T.map(([k, l, i, h]) => k === 'new' ? `<button data-act="create" data-k="new" aria-label="만들기"><span class="mk">${I('create')}</span>${l}</button>` : `<a href="${h}" data-k="${k}" ${r[2] === k ? 'aria-current="page"' : ''}><span class="nv-ic">${I(i)}</span>${l}</a>`).join('') + '<div class="side-label l1">둘러보기</div><div class="side-label l2">함께하기</div><div class="side-label l3">내 공간</div>' + `<a class="side-user" href="#/me" data-k="user">${av(S.me.name, 's')}<span><b>${esc(S.me.name)}</b><span class="cap">@${esc(S.me.username)}</span></span></a>`;
  let html; try { html = await r[1](...args); } catch (e) { if (e.status === 401) { S.me = null; return route(); } html = gone(e); }
  if (my !== seq) return;
  view.innerHTML = html; document.querySelectorAll('form[data-form]').forEach(f => f.noValidate = true); if (S.q.add) $('#story-ta')?.focus(); updSel(); updCounters(); initSignup(); { const sp = $('[data-fillgroup]'); if (sp && sp.value) markSpace(sp); } if (!/^\/post\//.test(path) || true) { window.scrollTo(0, 0); }
}
window.addEventListener('hashchange', () => { closeSheet(); route(); });

// ---------- 사진 ----------
async function toJpeg(file) { // 방향을 반영해 다시 인코딩 → EXIF/GPS 제거 + 크기 축소
  const bmp = await createImageBitmap(file), s = Math.min(1, 2048 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = Math.round(bmp.width * s); c.height = Math.round(bmp.height * s);
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise((ok, no) => c.toBlob(b => b ? ok(b) : no(new Error('이 사진은 올릴 수 없어요.')), 'image/jpeg', .86));
}
async function upload(pid, files) {
  const fails = []; let n = 0;
  for (const f of files) { toast(`사진을 올리고 있어요 ${++n}/${files.length}`, 60000); try { await api('POST', `/api/posts/${pid}/media`, await toJpeg(f)); } catch (e) { fails.push(f); } }
  hideToast();
  if (fails.length) { const b = sheet(`<h2>사진을 업로드하지 못했어요.</h2><p class="sub body2">네트워크 연결을 확인한 뒤 다시 시도해 주세요. (${fails.length}장)</p><div class="actions"><button class="btn" data-r>다시 시도하기</button><button class="btn line" data-c>닫기</button></div>`); b.addEventListener('click', e => { if (e.target.closest('[data-r]')) { closeSheet(); upload(pid, fails).then(route); } else if (e.target.closest('[data-c]')) closeSheet(); }); }
  return !fails.length;
}

// ---------- 시트 ----------
const REPORT_UI = (t, id) => { const b = sheet(`<h2>신고하기</h2><p class="sub body2">신고자의 신원은 상대에게 공개되지 않아요.</p><form data-form="report" data-t="${t}" data-id="${id}" class="stack" style="margin-top:12px"><div class="stack">${Object.entries(CAT).map(([k, l], i) => `<label class="row" style="min-height:40px"><input type="radio" name="category" value="${k}" ${i ? '' : 'required'} style="width:20px;height:20px"><span>${l}</span></label>`).join('')}</div><label class="field"><span class="cap">자세한 내용 (선택)</span><textarea name="detail" maxlength="1000"></textarea></label>${t === 'user' ? '' : '<label class="row"><input type="checkbox" name="hide" checked style="width:20px;height:20px"><span class="body2">내 화면에서 바로 숨기기</span></label>'}<p class="err" role="alert"></p><button class="btn">신고 접수하기</button></form>`); };

const A = {
  back: () => history.length > 1 ? history.back() : go('/'),
  reload: () => route(),
  'sheet-close': () => closeSheet(),
  auth: (d) => { if (location.hash.startsWith('#/signup/oauth')) history.replaceState(null, '', '#/'); S.authMode = d.m; route(); },
  sns: d => {
    if (S.snsBusy) return; // 연속 탭 방지
    const label = SNS.find(x => x[0] === d.p)?.[1].replace(' 계정으로 계속하기', '') || '';
    if (!S.sns?.[d.p]) { S.authNotice = { msg: `${label} 로그인은 아직 연결되지 않았어요. 다른 방법으로 계속해 주세요.` }; S.authMode = 'intro'; return route(); }
    S.snsBusy = true; document.querySelectorAll('.sns-btn').forEach(b => b.disabled = true);
    const st = $('#sns-status'); if (st) st.textContent = '안전하게 로그인 화면으로 이동하고 있어요.';
    if (S.join) try { sessionStorage.setItem('ws_join', S.join); } catch { } // 초대 링크로 왔다면 가입 뒤 원래 초대로 돌아온다
    location.href = '/api/oauth/' + d.p + '/start';
  },
  'notice-clear': () => { S.authNotice = null; route(); },
  create: () => { const b = sheet(`<h2>무엇을 만들까요?</h2><div class="menu" style="margin-top:8px"><button data-go="/new-post">${I('photo')}<span><b>새 추억 만들기</b><br><span class="cap">함께한 사람과 사진·글을 모아요</span></span></button><button data-go="/new-meetup">${I('cal')}<span><b>새 약속 만들기</b><br><span class="cap">약속을 잡고 참석 여부를 받아요</span></span></button></div>`); b.addEventListener('click', e => { const g = e.target.closest('[data-go]'); if (g) { closeSheet(); go(g.dataset.go); } }); },
  respond: d => act(() => api('POST', `/api/posts/${d.id}/respond`, { accept: d.v === '1' }), d.v === '1' ? '추억에 참여했어요.' : '초대를 거절했어요.'),
  'accept-friend': d => act(() => api('POST', `/api/people/${d.id}/accept`), '연결됐어요.'),
  'decline-friend': d => act(() => api('DELETE', `/api/people/${d.id}`)),
  react: d => act(() => api('POST', `/api/posts/${d.id}/react`)),
  'memory-thread': d => THREAD_UI(+d.id).catch(e => toast(e.message)),
  'memory-react': async d => { try { await api('POST', `/api/media/${d.id}/reactions`, { emoji: d.emoji }); await THREAD_UI(+d.id); } catch (e) { toast(e.message); } },
  'memory-reply': (d, el) => { const f = el.closest('.sheet')?.querySelector('[data-form=memory-comment]'); if (!f) return; f.elements.parent_id.value = d.id; $('#thread-label', f).textContent = `${d.name}님에게 답글`; f.elements.text.focus(); },
  'memory-del': async d => { if (!await ask({ title: '이 댓글을 삭제할까요?', body: '삭제하면 이 사진을 보는 모두에게서 사라져요.', ok: '삭제하기', danger: true })) return; try { await api('DELETE', `/api/notes/${d.id}`); await THREAD_UI(+d.mid); } catch (e) { toast(e.message); } },
  'del-note': async d => { if (await ask({ title: '내 글을 삭제할까요?', body: '삭제하면 모두에게서 사라지고 되돌릴 수 없어요.', ok: '삭제하기', danger: true })) act(() => api('DELETE', `/api/notes/${d.id}`), '삭제했어요.'); },
  report: d => REPORT_UI(d.t, d.id),
  photo: d => {
    const btns = [...document.querySelectorAll('[data-act=photo]')], list = btns.map(b => ({ id: b.dataset.id, mine: b.dataset.mine === '1' })), pid = $('[data-post]')?.dataset.post;
    let i = Math.max(0, list.findIndex(x => x.id === d.id)), zoom = false, tx = 0, ty = 0, last = 0;
    const ov = document.createElement('div'); ov.id = 'viewer'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', '사진 크게 보기');
    ov.innerHTML = `<div class="v-top"><span><b class="v-t"></b></span><button class="v-x" data-v="x" aria-label="닫기">${I('x')}</button></div><div class="v-wrap"><div class="v-g">${list.map(p => `<div class="v-p"><img src="/media/${p.id}" alt="함께 남긴 사진" draggable="false"></div>`).join('')}</div><span class="v-pg" aria-live="polite"></span></div><div class="v-bar"><span class="v-h">두 번 탭하면 확대해요</span><span class="v-b"><button data-v="cover">대표 사진으로</button><button data-v="more"></button><button data-v="zoom"></button></span></div>`;
    document.body.append(ov); document.body.style.overflow = 'hidden';
    const g = $('.v-g', ov), cur = () => $$('.v-p img', ov)[i], apply = () => { $$('.v-p img', ov).forEach(im => { im.style.transform = ''; }); if (cur()) cur().style.transform = zoom ? `translate(${tx}px,${ty}px) scale(2.2)` : ''; };
    // 배지는 보이는 사진(contain 으로 줄어든 이미지)의 오른쪽 아래 모서리에서 12px 안쪽에 둔다
    const place = () => { const im = cur(), pg = $('.v-pg', ov); if (!im || !pg) return; const p = im.parentElement; pg.style.right = (Math.max(0, (p.clientWidth - im.offsetWidth) / 2) + 12) + 'px'; pg.style.bottom = (Math.max(0, (p.clientHeight - im.offsetHeight) / 2) + 12) + 'px'; };
    const upd = () => { $('.v-t', ov).textContent = list[i].mine ? '내가 올린 사진' : '함께 남긴 사진'; { const pg = $('.v-pg', ov); pg.textContent = `${i + 1} / ${list.length}`; pg.hidden = list.length < 2 || zoom; place(); } $('[data-v=more]', ov).innerHTML = list[i].mine ? I('trash') + '삭제' : I('flag') + '신고'; $('[data-v=zoom]', ov).innerHTML = I(zoom ? 'zout' : 'zin') + (zoom ? '원래 크기' : '확대'); g.classList.toggle('z', zoom); apply(); };
    const setZoom = z => { zoom = z; tx = ty = 0; upd(); };
    const close = () => { window.removeEventListener('resize', place); document.removeEventListener('keydown', key); document.body.style.overflow = ''; ov.remove(); btns[i]?.scrollIntoView({ block: 'nearest' }); btns[i]?.focus(); };
    const key = e => { if (e.key === 'Escape') close(); else if (!zoom && e.key === 'ArrowRight') g.scrollBy({ left: g.clientWidth }); else if (!zoom && e.key === 'ArrowLeft') g.scrollBy({ left: -g.clientWidth }); };
    document.addEventListener('keydown', key); window.addEventListener('resize', place); $$('.v-p img', ov).forEach(im => im.addEventListener('load', place));
    g.addEventListener('scroll', () => { const n = Math.round(g.scrollLeft / g.clientWidth); if (n !== i && n >= 0 && n < list.length) { i = n; upd(); } }, { passive: true });
    g.addEventListener('click', e => { if (!e.target.closest('.v-p')) return; const t = Date.now(); if (t - last < 320) { setZoom(!zoom); last = 0; } else last = t; });
    let drag = null;
    g.addEventListener('pointerdown', e => { if (zoom) { drag = { x: e.clientX - tx, y: e.clientY - ty }; g.setPointerCapture(e.pointerId); } });
    g.addEventListener('pointermove', e => { if (!drag) return; const lx = g.clientWidth * .55, ly = g.clientHeight * .4; tx = Math.max(-lx, Math.min(lx, e.clientX - drag.x)); ty = Math.max(-ly, Math.min(ly, e.clientY - drag.y)); apply(); });
    g.addEventListener('pointerup', () => { drag = null; });
    ov.addEventListener('click', async e => {
      const a = e.target.closest('[data-v]')?.dataset.v; if (!a) return; const cp = list[i];
      if (a === 'zoom') return setZoom(!zoom);
      close();
      if (a === 'cover') act(() => api('POST', `/api/posts/${pid}/cover`, { media_id: +cp.id }), '대표 사진을 바꿨어요.');
      if (a === 'more' && !cp.mine) REPORT_UI('media', cp.id);
      if (a === 'more' && cp.mine && await ask({ title: '사진을 삭제할까요?', body: '내가 올린 사진이 이 추억과 지도, 회상에서 모두 사라져요. 되돌릴 수 없어요.', ok: '삭제하기', danger: true })) act(() => api('DELETE', `/api/media/${cp.id}`), '사진을 삭제했어요.');
    });
    upd(); $('.v-x', ov).focus(); requestAnimationFrame(() => { g.scrollLeft = i * g.clientWidth; place(); });
  },
  'post-menu': async d => {
    const p = await api('GET', '/api/posts/' + d.id), admin = p.me.role === 'admin';
    const b = sheet(`<div class="menu">${admin ? `<button data-a="people">${I('users')}참여자 관리·초대</button><button data-a="edit">${I('star')}정보 수정하기</button>` : ''}<button data-a="save">${I('bookmark')}${p.saved ? '저장 취소하기' : '나만 보게 저장하기'}</button><button data-a="log">${I('clock')}활동 기록</button><button data-a="hide">${I('eye')}내 화면에서 숨기기</button><button data-a="report">${I('flag')}신고하기</button><button data-a="leave" class="d">${I('out')}추억에서 나가기</button>${admin ? `<button data-a="close">${I('lock')}${p.status === 'closed' ? '추억 다시 열기' : '추억 종료하기'}</button><button data-a="delete" class="d">${I('block')}추억 삭제하기</button>` : ''}</div>`);
    b.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return; closeSheet();
      if (a === 'hide') act(() => api('POST', '/api/hides', { type: 'post', id: +d.id }), '숨겼어요. 숨긴 추억은 설정에서 다시 볼 수 있어요.').then(() => go('/'));
      if (a === 'report') REPORT_UI('post', d.id);
      if (a === 'save') act(() => api('POST', '/api/saves', { post_id: +d.id }), p.saved ? '저장을 취소했어요.' : '나만 보게 저장했어요.');
      if (a === 'log') { const { log } = await api('GET', `/api/posts/${d.id}/log`); sheet(`<h2>활동 기록</h2><p class="cap">누가 언제 무엇을 바꿨는지 확인할 수 있어요.</p><div class="list" style="margin-top:12px">${log.map(l => `<div style="display:block"><b class="body2">${esc(l.actor)}</b> <span class="body2">${esc(l.what)}</span><br><span class="cap">${l.created_at.slice(0, 16)} (UTC)</span></div>`).join('') || '<div class="sub body2">아직 기록이 없어요.</div>'}</div>`); }
      if (a === 'people') PEOPLE_UI(p);
      if (a === 'edit') EDIT_UI(p);
      if (a === 'close') { if (p.status === 'closed' || await ask({ title: '추억을 종료할까요?', body: '종료하면 새 사진과 글을 더할 수 없어요. 지금까지의 기록은 그대로 보이고, 언제든 다시 열 수 있어요.', ok: '종료하기' })) act(() => api('POST', `/api/posts/${d.id}/close`, { closed: p.status !== 'closed' })); }
      if (a === 'delete' && await ask({ title: '추억을 삭제할까요?', body: `참여한 ${p.members.filter(m => m.access === 'accepted').length}명 모두에게서 이 추억과 올린 사진·글이 삭제돼요. <b>되돌릴 수 없어요.</b>`, ok: '추억 삭제하기', danger: true })) act(() => api('DELETE', `/api/posts/${d.id}`).then(() => go('/')), '추억을 삭제했어요.');
      if (a === 'leave') {
        const r = await ask({ title: '이 추억에서 나갈까요?', body: '나가면 이 추억을 더 이상 볼 수 없고 알림도 끝나요. 다른 사람의 기록은 그대로 남아요.', check: '내가 올린 사진과 글도 함께 삭제', ok: '나가기', danger: true });
        if (r) try { await api('POST', `/api/posts/${d.id}/leave`, { deleteMine: r.checked }); toast('추억에서 나갔어요.'); go('/'); } catch (er) { if (er.data?.code === 'ADMIN_TRANSFER_REQUIRED') { toast(er.message, 4000); TRANSFER_UI(p); } else toast(er.message); }
      }
    });
  },
  'add-more': () => { const b = sheet(`<h2>내 사진과 이야기 더하기</h2><p class="sub body2">추억 전체에 새 사진이나 긴 이야기를 정식으로 보태요.</p><div class="menu add-menu" style="margin-top:8px"><button data-a="photo"><span><b>사진 고르기</b><br><span class="cap">여러 장을 한 번에 올릴 수 있어요</span></span></button><button data-a="text"><span><b>이야기 쓰기</b><br><span class="cap">내가 기억하는 그날을 길게 남겨요</span></span></button></div>`); b.addEventListener('click', e => { const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return; closeSheet(); if (a === 'photo') $('#pf')?.click(); else { const t = $('#story-ta'); t?.scrollIntoView({ block: 'center' }); t?.focus(); } }); },
  save: d => act(() => api('POST', '/api/saves', { post_id: +d.id })),
  marker: (d, t) => {
    const city = window._map.countries[+d.c].cities[+d.i], pv = $('#preview');
    document.querySelectorAll('.marker').forEach(b => b.setAttribute('aria-pressed', b === t));
    pv.hidden = false;
    pv.innerHTML = `<span class="grab-h" aria-hidden="true"></span><div class="row between"><b>${I('pin', 's')} ${esc(city.city)} · ${city.count}개의 추억</b><button class="icon-btn" data-act="marker-x" aria-label="닫기">${I('x')}</button></div><div class="pv-scroll">${city.items.map(i => `<a class="pv" href="#/post/${i.id}"><span class="pv-t"><b>${esc(i.title)}</b><span class="cap">${esc(i.label)}</span><span class="cap">${fmtDate(i.occurred_on)} · 함께한 ${i.count}명</span></span><span class="pv-ph">${i.cover ? `<img loading="lazy" src="/media/${i.cover}" alt="">` : KNOT}</span></a>`).join('')}</div>`;
  },
  'marker-x': () => { $('#preview').hidden = true; document.querySelectorAll('.marker').forEach(b => b.setAttribute('aria-pressed', 'false')); },
  'att-open': () => ATT_UI(window._m),
  'draft-clear': () => { try { localStorage.removeItem('ws_draft'); } catch { } S.draft = null; route(); },
  'rm-filter': d => { if (d.k === 'people') S.filter.people = S.filter.people.filter(x => x !== +d.v); else S.filter[d.k] = ''; route(); },
  share: d => { if (navigator.share) navigator.share({ title: '우리사이', text: '우리사이에서 연결해요. 이 링크는 한 번만 쓸 수 있어요.', url: d.v }).catch(() => { }); else A.copy(d); },
  'nick-suggest': d => { const el = $('#' + d.for), s = nst(el); if (el.value && !s.suggested) s.lastUser = el.value; const v = suggest(s.recent); s.recent = [...s.recent, v].slice(-5); el.value = v; s.suggested = true; nickRender(el, false); },
  'nick-restore': d => { const el = $('#' + d.for), s = nst(el); el.value = s.lastUser; s.suggested = false; nickRender(el, false); },
  'pw-toggle': (d, t) => { const show = t.getAttribute('aria-pressed') !== 'true'; t.setAttribute('aria-pressed', show); t.textContent = show ? '숨기기' : '보기'; document.querySelectorAll('#su-pw, #su-pw2').forEach(i => i.type = show ? 'text' : 'password'); },
  'mode': d => { S.filter.mode = d.v; route(); },
  'clear-filter': () => { S.filter = { people: [], mode: 'and', group: '', year: '', month: '', region: '', dim: 'all' }; route(); },
  'f-dim': d => { if (d.v === 'all') S.filter = { people: [], mode: S.filter.mode, group: '', year: '', month: '', region: '', dim: 'all' }; else S.filter.dim = S.filter.dim === d.v ? 'all' : d.v; route(); },
  'f-pick': d => { const f = S.filter; if (d.k === 'people') { const id = +d.v; f.people = f.people.includes(id) ? f.people.filter(x => x !== id) : [...f.people, id]; } else f[d.k] = f[d.k] === d.v ? '' : d.v; route(); },
  'cal-f': d => { S.cal.f = d.v; route(); },
  tab: d => go('/memories?tab=' + d.v),
  // 올리기 전 확인: 선택한 사진을 크게 넘겨 보고, 마음에 안 들면 여기서 뺀다. 선택 상태(PP)는 그대로 유지된다
  'pp-view': d => {
    let i = +d.i; const ov = document.createElement('div'); ov.id = 'viewer'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', '선택한 사진 크게 보기');
    const draw = () => {
      ov.innerHTML = `<div class="v-top"><span><b class="v-t">선택한 사진 ${PP.urls.length}장</b></span><button class="v-x" data-v="x" aria-label="닫기">${I('x')}</button></div><div class="v-wrap"><div class="v-g">${PP.urls.map(u => `<div class="v-p"><img src="${u}" alt="선택한 사진" draggable="false"></div>`).join('')}</div><span class="v-pg" aria-live="polite"></span></div><div class="v-bar"><span class="v-h"></span><span class="v-b"><button data-v="rm">이 사진 빼기</button><button data-v="x">확인</button></span></div>`;
      const g = $('.v-g', ov), pg = $('.v-pg', ov);
      const upd = () => { pg.textContent = `${i + 1} / ${PP.urls.length}`; pg.hidden = PP.urls.length < 2; $('.v-h', ov).textContent = i === 0 ? '대표 사진이에요' : '좌우로 넘겨 볼 수 있어요'; };
      g.addEventListener('scroll', () => { const n = Math.round(g.scrollLeft / g.clientWidth); if (n !== i && n >= 0 && n < PP.urls.length) { i = n; upd(); } }, { passive: true });
      upd(); requestAnimationFrame(() => { g.scrollLeft = i * g.clientWidth; });
    };
    const key = e => { if (e.key === 'Escape') close(); };
    const close = () => { document.removeEventListener('keydown', key); document.body.style.overflow = ''; ov.remove(); $$('.pp-v')[Math.min(i, PP.urls.length - 1)]?.focus(); };
    document.addEventListener('keydown', key); document.body.style.overflow = 'hidden'; document.body.append(ov); draw(); $('.v-x', ov).focus();
    ov.addEventListener('click', e => { const a = e.target.closest('[data-v]')?.dataset.v; if (a === 'x') close(); else if (a === 'rm') { A['pp-rm']({ i }); if (!PP.urls.length) return close(); i = Math.min(i, PP.urls.length - 1); draw(); $('.v-x', ov).focus(); } });
  },
  'pp-rm': d => { PP.urls.splice(+d.i, 1).forEach(u => URL.revokeObjectURL(u)); PP.files.splice(+d.i, 1); ppRender(); },
  'guest-start': () => { S.guest = true; try { sessionStorage.setItem('ws_guest', '1'); } catch { } go('/'); route(); },
  'guest-login': () => leaveGuest(null),
  'guest-gate': d => gate(d.k),
  'cal-move': d => { const [y, m] = S.cal.ym.split('-').map(Number), x = new Date(y, m - 1 + +d.v, 1); S.cal = { ym: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`, day: '' }; route(); },
  'cal-day': d => { S.cal.day = S.cal.day === d.v ? '' : d.v; route(); },
  'foot-mode': d => { S.foot.mode = d.v; route(); },
  'foot-scope': d => { S.foot.scope = d.v; route(); },
  'foot-person': d => { const id = +d.v, p = S.foot.people; S.foot.people = p.includes(id) ? p.filter(x => x !== id) : [...p, id]; route(); },
  'foot-region': d => REGION_UI(d.v),
  mem: d => act(async () => { S.me = await api('PATCH', '/api/me', { mem_enabled: d.v === '1' }); }, d.v === '1' ? '켰어요. 언제든 끌 수 있어요.' : '껐어요. 기록은 그대로 보관돼요.'),
  'hide-post': d => act(() => api('POST', '/api/hides', { type: 'post', id: +d.id }), '숨긴 추억은 다시 추천하지 않아요. 설정에서 언제든 바꿀 수 있어요.'),
  unhide: d => act(() => api('DELETE', `/api/hides/${d.t}/${d.id}`)),
  rsvp: d => act(() => api('POST', `/api/meetups/${location.hash.match(/meetup\/(\d+)/)[1]}/rsvp`, { rsvp: d.v })),
  'meetup-post': () => {
    const m = window._m, att = m.participants.filter(p => p.attended).map(p => p.id), yes = m.participants.filter(p => p.rsvp === 'yes').map(p => p.id);
    S.draft = { meetup_id: m.id, title: m.title, date: m.starts_at.slice(0, 10) <= localDate() ? new Date(m.starts_at).toLocaleDateString('sv') : localDate(), members: (att.length ? att : yes).filter(x => x !== S.me.id) }; go('/new-post');
  },
  'meetup-menu': () => {
    const m = window._m, started = Date.parse(m.starts_at) <= Date.now();
    const b = sheet(`<div class="menu"><button data-a="edit">${I('cal')}일정 수정하기</button><button data-a="invite">${I('users')}사람 초대하기</button>${started ? `<button data-a="att">${I('star')}실제 참석자 확인하기</button>` : ''}<button data-a="cancel" class="d">${I('block')}약속 취소하기</button></div>`);
    b.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return; closeSheet();
      if (a === 'edit') sheet(`<h2>일정 수정하기</h2><form data-form="meetup-edit" class="stack" style="margin-top:12px"><label class="field"><span>약속 이름</span><input type="text" name="title" maxlength="40" required value="${esc(m.title)}"></label>${whenFields(m)}<p class="cap">일시나 장소를 바꾸면 참석자들에게 다시 응답을 요청해요.</p><p class="err" role="alert"></p><button class="btn">저장하기</button></form>`);
      if (a === 'invite') { const pp = await api('GET', '/api/people'), cur = m.participants.map(p => p.id); sheet(`<h2>사람 초대하기</h2><form data-form="meetup-invite" class="stack" style="margin-top:12px">${pick(pp.friends.filter(f => !cur.includes(f.id)), 'm') || ''}<p class="err" role="alert"></p><button class="btn">초대하기</button></form>`); }
      if (a === 'att') ATT_UI(m);
      if (a === 'cancel' && await ask({ title: '약속을 취소할까요?', body: '참석자들에게 취소된 약속으로 표시돼요. 이미 만든 추억과 정산은 그대로 남아요.', ok: '약속 취소하기', danger: true })) act(() => api('POST', `/api/meetups/${m.id}/cancel`), '약속을 취소했어요.');
    });
  },
  'settle-new': () => {
    const m = window._m;
    sheet(`<h2>정산 만들기</h2><form data-form="settle" class="stack" style="margin-top:12px"><label class="field"><span>항목</span><input type="text" name="title" maxlength="40" required placeholder="예) 저녁 식사"></label><label class="field"><span>전체 금액 (원)</span><input type="number" name="total" min="1" step="1" required inputmode="numeric"></label>
      <label class="field"><span>낸 사람</span><select name="payer">${m.participants.map(p => `<option value="${p.id}" ${p.id === S.me.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>
      <div class="field"><span>나누는 사람</span>${m.participants.map(p => `<div class="row" style="margin-bottom:12px"><label class="row grow"><input type="checkbox" name="m" value="${p.id}" checked style="width:20px;height:20px"><span>${esc(p.name)}</span></label><input type="number" name="a${p.id}" min="0" placeholder="금액" class="custom" style="width:110px;display:none"></div>`).join('')}</div>
      <label class="field"><span>나누는 방법</span><select name="method" data-method><option value="equal">똑같이 나누기</option><option value="custom">금액을 직접 입력</option></select><small>나누어떨어지지 않는 금액은 낸 사람이 부담해요.</small></label><p class="err" role="alert"></p><button class="btn">정산 만들기</button></form>`);
  },
  'settle-ok': d => act(() => api('POST', `/api/settlements/${d.id}/confirm`), '확인했어요.'),
  'settle-del': async d => { if (await ask({ title: '정산을 삭제할까요?', body: '정산에 포함된 모두에게서 사라져요.', ok: '삭제하기', danger: true })) act(() => api('DELETE', `/api/settlements/${d.id}`)); },
  'link-new': async () => { await act(() => api('POST', '/api/invites')); },
  'link-del': d => act(() => api('DELETE', `/api/invites/${d.id}`), '링크를 회수했어요.'),
  copy: d => navigator.clipboard.writeText(d.v).then(() => toast('링크를 복사했어요.'), () => toast('복사하지 못했어요. 링크를 길게 눌러 복사해 주세요.')),
  join: d => act(async () => { const r = await api('POST', `/api/invites/${d.code}/accept`); history.replaceState(null, '', '#/people'); toast(`${r.from}님과 연결됐어요.`); }),
  'friend-menu': d => {
    const b = sheet(`<h2>${esc(d.name)}</h2><div class="menu" style="margin-top:8px"><button data-a="hide">${I('eye')}이 사람과의 추억 추천 안 함</button><button data-a="rep">${I('flag')}신고하기</button><button data-a="un" class="d">${I('out')}연결 해제하기</button><button data-a="block" class="d">${I('block')}차단하기</button></div>`);
    b.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return; closeSheet();
      if (a === 'hide') act(() => api('POST', '/api/hides', { type: 'user', id: +d.id }), '이 사람과의 추억은 추천하지 않아요.');
      if (a === 'rep') REPORT_UI('user', d.id);
      if (a === 'un' && await ask({ title: `${d.name}님과 연결을 해제할까요?`, body: '새 초대는 할 수 없게 돼요. 이미 함께한 추억은 그대로 남아요.', ok: '연결 해제', danger: true })) act(() => api('DELETE', `/api/people/${d.id}`));
      if (a === 'block') { const r = await ask({ title: `${d.name}님을 차단할까요?`, body: '서로 새 초대·댓글·알림이 중단되고 연결이 해제돼요. 상대에게 알리지 않아요.', check: '함께한 추억도 내 화면에서 숨기기', ok: '차단하기', danger: true }); if (r) act(() => api('POST', '/api/blocks', { user_id: +d.id, hideShared: r.checked }), '차단했어요.'); }
    });
  },
  unblock: d => act(() => api('DELETE', `/api/blocks/${d.id}`), '차단을 해제했어요.'),
  'group-new': async () => { const pp = await api('GET', '/api/people'); sheet(`<h2>우리 공간 만들기</h2><form data-form="group" class="stack" style="margin-top:12px"><label class="field"><span>우리 공간 이름</span><input type="text" name="name" maxlength="20" required></label><label class="field"><span>관계 (선택)</span><select name="hint"><option value="">선택 안 함</option><option value="friend">친구</option><option value="family">가족</option><option value="couple">연인</option></select><small>이름표일 뿐, 볼 수 있는 사람을 바꾸지 않아요.</small></label><div class="field"><span>사람 선택</span>${pick(pp.friends, 'm')}</div><p class="err" role="alert"></p><button class="btn">우리 공간 만들기</button></form>`); },
  'group-add': async d => { const [pp, gg] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/groups')]); const cur = gg.groups.find(g => g.id === +d.g).members.map(m => m.id); sheet(`<h2>사람 추가</h2><form data-form="group-add" data-g="${d.g}" class="stack" style="margin-top:12px">${pick(pp.friends.filter(f => !cur.includes(f.id)), 'm')}<p class="err" role="alert"></p><button class="btn">추가하기</button></form>`); },
  'group-kick': d => act(() => api('DELETE', `/api/groups/${d.g}/members/${d.u}`)),
  'space-all': () => { document.querySelectorAll('[data-form=newpost] .pick label.sp input').forEach(i => { i.checked = true; }); updSel(); const f = $('[data-form=newpost]'); if (f) saveDraft(f); },
  'space-new-post': d => { S.draft = { group_id: +d.g }; go('/new-post?start=photo'); },
  'space-set': async d => {
    const { groups } = await api('GET', '/api/groups'), g = groups.find(x => x.id === +d.g); if (!g) return;
    const own = g.owner_id === S.me.id;
    const b = sheet(`<h2>공간 설정</h2><div class="menu" style="margin-top:8px">${own ? '<button data-a="rename"><span><b>이름 바꾸기</b></span></button><button data-a="del" class="d"><span><b>공간 삭제하기</b><br><span class="cap">공간만 사라지고 추억은 그대로예요.</span></span></button>' : '<button data-a="leave" class="d"><span><b>공간 나가기</b><br><span class="cap">이미 함께한 추억에는 영향이 없어요.</span></span></button>'}</div>`);
    b.addEventListener('click', e => { const x = e.target.closest('[data-a]')?.dataset.a; if (!x) return; closeSheet(); if (x === 'rename') sheet(`<h2>이름 바꾸기</h2><form data-form="space-rename" data-g="${g.id}" class="stack" style="margin-top:12px"><label class="field"><span>공간 이름</span><input type="text" name="name" maxlength="20" required value="${esc(g.name)}"></label><p class="err" role="alert"></p><button class="btn">저장하기</button></form>`); else if (x === 'del') A['group-del']({ g: g.id, name: g.name }); else A['group-leave']({ g: g.id }); });
  },
  'group-leave': async d => { if (await ask({ title: '우리 공간에서 나갈까요?', body: '이미 함께한 추억에는 영향이 없어요.', ok: '나가기', danger: true })) act(() => api('DELETE', `/api/groups/${d.g}/members/${S.me.id}`).then(() => { if (/#\/space\//.test(location.hash)) go('/memories?tab=space'); })); },
  'group-del': async d => { if (await ask({ title: `‘${d.name}’ 우리 공간을 삭제할까요?`, body: '우리 공간만 사라지고, 연결된 추억과 약속은 삭제되지 않아요.', ok: '우리 공간 삭제', danger: true })) act(() => api('DELETE', `/api/groups/${d.g}`).then(() => { if (/#\/space\//.test(location.hash)) go('/memories?tab=space'); }), '우리 공간을 삭제했어요.'); },
  rename: () => sheet(`<h2>닉네임 변경하기</h2><form data-form="rename" class="stack" style="margin-top:12px" novalidate>${nickField('rn-nick', '닉네임', S.me.name)}<p class="err" role="alert"></p><button class="btn">변경사항 저장하기</button></form>`),
  export: () => { const a = document.createElement('a'); a.href = '/api/me/export'; a.download = 'woorisai-my-data.json'; a.click(); },
  logout: () => act(async () => { await api('POST', '/api/logout'); S.me = null; S.authMode = 'intro'; }, '우리사이에서 로그아웃했어요. 카카오·네이버·Google 계정에서는 로그아웃되지 않았어요.'),
  'delete-account': () => sheet(`<h2>계정을 삭제할까요?</h2><p class="sub body2">계정을 삭제하면 일부 추억에 다시 접근할 수 없어요. 삭제하면 로그인할 수 없고 연결·우리 공간·내 약속이 정리돼요. 함께 만든 추억에 남긴 사진과 글은 이름이 ‘탈퇴한 사용자’로 바뀐 채 남아요. 함께 지우려면 아래를 선택해 주세요. <b>되돌릴 수 없어요.</b></p><form data-form="delete-account" class="stack" style="margin-top:12px"><label class="row"><input type="checkbox" name="dc" style="width:20px;height:20px"><span class="body2">내가 올린 사진과 글도 모두 삭제</span></label>${S.me.has_password ? '<label class="field"><span>비밀번호 확인</span><input type="password" name="password" required autocomplete="current-password"></label>' : `<label class="field"><span>탈퇴 확인: 내 이름을 입력해 주세요</span><input type="text" name="password" required autocomplete="off" placeholder="${esc(S.me.username)}"></label>`}<p class="err" role="alert"></p><button class="btn danger">계정 삭제하기</button></form>`),
};

function ATT_UI(m) { sheet(`<h2>실제로 함께한 사람</h2><p class="sub body2">응답과 상관없이 실제로 온 사람을 골라 주세요. 추억에 자동으로 초대되지는 않아요.</p><form data-form="attended" class="stack" style="margin-top:12px">${pick(m.participants, 'm', m.participants.filter(p => p.attended || (!m.participants.some(x => x.attended) && p.rsvp === 'yes')).map(p => p.id))}<button class="btn">확인하기</button></form>`); }
function PEOPLE_UI(p) {
  api('GET', '/api/people').then(pp => {
    const cur = p.members.map(m => m.id), others = p.members.filter(m => m.id !== S.me.id);
    const b = sheet(`<h2>참여자 관리</h2><div class="card list" style="margin:12px 0">${others.map(m => `<div>${av(m.name, 's')}<span class="grow body2">${esc(m.name)}${m.access === 'invited' ? ' <span class="tag">초대 중</span>' : ''}</span><button class="btn sm dline" data-rm="${m.id}">내보내기</button></div>`).join('') || '<div class="sub body2">나 혼자예요.</div>'}</div>
      <h3>사람 초대하기</h3><p class="cap" style="margin:4px 0 12px">초대받은 사람은 수락한 뒤에 사진과 글을 함께 남길 수 있어요.</p><form data-form="post-invite" data-id="${p.id}" class="stack">${pick(pp.friends.filter(f => !cur.includes(f.id)), 'm') || '<p class="sub body2">초대할 수 있는 사람이 더 없어요.</p>'}<p class="err" role="alert"></p><button class="btn">사람 초대하기</button></form>`);
    b.addEventListener('click', async e => { const r = e.target.closest('[data-rm]'); if (r && await ask({ title: '이 사람을 내보낼까요?', body: '이 추억을 더 이상 볼 수 없게 돼요. 이미 남긴 기록은 본인이 직접 삭제할 수 있어요.', ok: '내보내기', danger: true })) act(() => api('DELETE', `/api/posts/${p.id}/members/${r.dataset.rm}`), '내보냈어요.'); });
  });
}
function TRANSFER_UI(p) {
  const others = p.members.filter(m => m.id !== S.me.id && m.access === 'accepted');
  const b = sheet(`<h2>관리자를 넘겨 주세요</h2><p class="sub body2">나가기 전에 다른 사람에게 관리자를 넘기거나, 추억을 종료할 수 있어요.</p><div class="menu" style="margin-top:8px">${others.map(m => `<button data-u="${m.id}">${av(m.name, 's')}${esc(m.name)}에게 넘기기</button>`).join('')}</div>`);
  b.addEventListener('click', e => { const u = e.target.closest('[data-u]'); if (u) { closeSheet(); act(() => api('POST', `/api/posts/${p.id}/admin`, { user_id: +u.dataset.u }), '관리자를 넘겼어요.'); } });
}
function EDIT_UI(p) {
  const r = p.place_raw || {};
  sheet(`<h2>추억 정보 수정</h2><form data-form="post-edit" data-id="${p.id}" class="stack" style="margin-top:12px"><label class="field"><span>제목</span><input type="text" name="title" maxlength="40" required value="${esc(p.title)}"></label><label class="field"><span>날짜</span><input type="date" name="date" value="${p.occurred_on || ''}"></label>
    <label class="field"><span>장소 이름</span><input type="text" name="pname" maxlength="40" value="${esc(r.name || '')}"></label><div class="row"><label class="field grow"><span>동네</span><input type="text" name="parea" maxlength="30" value="${esc(r.area || '')}"></label><label class="field grow"><span>도시</span><input type="text" name="pcity" maxlength="30" value="${esc(r.city || '')}"></label></div><label class="field"><span>국가</span><input type="text" name="pcountry" maxlength="30" value="${esc(r.country || '')}"></label>
    <label class="field"><span>보여줄 위치 수준</span><select name="pprec">${[['exact', '정확한 장소까지'], ['area', '동네까지만'], ['city', '도시까지만']].map(([k, l]) => `<option value="${k}" ${r.precision === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label><p class="err" role="alert"></p><button class="btn">저장하기</button></form>`);
}
const placeOf = fd => { const city = String(fd.get('pcity') || fd.get('pcity_x') || '').trim(), country = String(fd.has('pcountry') ? fd.get('pcountry') : (fd.get('pcountry_x') || (city ? '대한민국' : ''))).trim(); return city || country || fd.get('pname') ? { name: fd.get('pname') || '', area: fd.get('parea'), city, country, precision: fd.get('pprec') || 'area' } : null; };

// ---------- 폼 ----------
const F = {
  async login(fd) { S.me = await api('POST', '/api/login', { username: fd.get('username'), password: fd.get('password') }); },
  async signup(fd) { const r = validateNickname(fd.get('nickname')); if (!r.ok) throw new Error(r.message); S.me = await api('POST', '/api/signup', { username: fd.get('username'), nickname: r.value, password: fd.get('password'), consents: { terms: fd.get('c_terms') === 'on', privacy: fd.get('c_privacy') === 'on', marketing: fd.get('c_marketing') === 'on' } }); try { sessionStorage.removeItem('ws_nick'); } catch { } },
  async note(fd, f) { await api('POST', `/api/posts/${f.dataset.id}/notes`, { kind: f.dataset.kind, text: fd.get('text') }); },
  async 'memory-comment'(fd, f) { await api('POST', `/api/media/${f.dataset.mid}/comments`, { text: fd.get('text'), parent_id: +fd.get('parent_id') || null }); await THREAD_UI(+f.dataset.mid); return 'noroute'; },
  async request(fd) { await api('POST', '/api/people/request', { username: fd.get('username') }); toast('연결 요청을 보냈어요. 상대가 수락하면 연결돼요.'); },
  async rename(fd) { const r = validateNickname(fd.get('nickname')); if (!r.ok) throw new Error(r.message); S.me = await api('PATCH', '/api/me', { nickname: r.value }); closeSheet(); toast('닉네임을 바꿨어요.'); },
  async 'oauth-consent'(fd) { S.oauthConsents = { terms: true, privacy: true, marketing: fd.get('c_marketing') === 'on' }; S.oauthStep = 'profile'; },
  async 'oauth-signup'(fd) { const r = validateNickname(fd.get('nickname')); if (!r.ok) throw new Error(r.message); S.me = await api('POST', '/api/signup/oauth', { token: S.q.t, nickname: r.value, username: fd.get('username'), consents: S.oauthConsents }); S.oauthStep = null; history.replaceState(null, '', '#/'); },
  async 'delete-account'(fd) { await api('DELETE', '/api/me', { password: fd.get('password'), deleteContent: fd.get('dc') === 'on' }); S.me = null; S.authMode = 'intro'; closeSheet(); toast('탈퇴가 완료됐어요.'); },
  async group(fd) { const r = await api('POST', '/api/groups', { name: fd.get('name'), type_hint: fd.get('hint'), member_ids: fd.getAll('m').map(Number) }); closeSheet(); if (r.duplicateOf) toast(`같은 사람으로 만든 ‘${r.duplicateOf}’ 우리 공간이 이미 있어요.`, 4000); },
  async 'space-rename'(fd, f) { await api('PATCH', `/api/groups/${f.dataset.g}`, { name: fd.get('name') }); closeSheet(); toast('이름을 바꿨어요.'); },
  async 'group-add'(fd, f) { await api('POST', `/api/groups/${f.dataset.g}/members`, { user_ids: fd.getAll('m').map(Number) }); closeSheet(); },
  async report(fd, f) { await api('POST', '/api/reports', { target_type: f.dataset.t, target_id: +f.dataset.id, category: fd.get('category'), detail: fd.get('detail'), hide: fd.get('hide') === 'on' }); closeSheet(); toast('신고가 접수됐어요. 처리 상태는 ‘나 › 내 신고 내역’에서 확인할 수 있어요.', 4500); },
  async 'post-invite'(fd, f) { await api('POST', `/api/posts/${f.dataset.id}/invite`, { user_ids: fd.getAll('m').map(Number) }); closeSheet(); toast('초대를 보냈어요.'); },
  async 'post-edit'(fd, f) { await api('PATCH', `/api/posts/${f.dataset.id}`, { title: fd.get('title'), occurred_on: fd.get('date'), place: placeOf(fd) }); closeSheet(); },
  async newmeetup(fd) { const r = await api('POST', '/api/meetups', { title: fd.get('title'), ...whenBody(fd), descr: fd.get('descr'), user_ids: fd.getAll('m').map(Number), group_id: fd.get('group') || null }); location.hash = '#/meetup/' + r.id; return 'noroute'; },
  async 'meetup-edit'(fd) { const r = await api('PATCH', `/api/meetups/${window._m.id}`, { title: fd.get('title'), ...whenBody(fd) }); closeSheet(); if (r.reconfirm) toast('참석자들에게 다시 응답을 요청했어요.'); },
  async 'meetup-invite'(fd) { await api('POST', `/api/meetups/${window._m.id}/invite`, { user_ids: fd.getAll('m').map(Number) }); closeSheet(); },
  async attended(fd) { await api('POST', `/api/meetups/${window._m.id}/attended`, { user_ids: fd.getAll('m').map(Number) }); closeSheet(); toast('실제 참석자를 확인했어요.'); },
  async settle(fd) {
    const members = fd.getAll('m').map(Number), custom = fd.get('method') === 'custom', amounts = {};
    if (custom) members.forEach(m => amounts[m] = Number(fd.get('a' + m)) || 0);
    await api('POST', `/api/meetups/${window._m.id}/settlements`, { title: fd.get('title'), total: Number(fd.get('total')), payer_id: +fd.get('payer'), member_ids: members, method: custom ? 'custom' : 'equal', amounts }); closeSheet();
  },
  async newpost(fd, f) { // (성공 시 초안 삭제) // 1) 볼 수 있는 사람 확인 → 2) 생성 → 3) 사진 업로드
    const names = [...f.querySelectorAll('input[name=m]:checked')].map(i => i.nextElementSibling.textContent);
    if (!names.length) throw new Error('함께한 사람을 한 명 이상 선택해 주세요.');
    const gsel = (window._groups || []).find(x => x.id === +fd.get('group')), picked = fd.getAll('m').map(Number), rest = gsel ? gsel.members.filter(m => m.id !== S.me.id && !picked.includes(m.id)).map(m => m.name) : [];
    const ok = await ask({ title: `이 추억을 볼 수 있는 사람 ${names.length + 1}명`, body: `<span class="who"><span><b>나</b> <span class="cap">관리자</span></span>${names.map(n => `<span>${esc(n)} <span class="cap">초대 · 수락하면 볼 수 있어요</span></span>`).join('')}</span>${gsel ? `<span class="cap" style="display:block;margin-top:12px">‘${esc(gsel.name)}’에 연결돼요.${rest.length ? ` 공간 멤버 ${esc(rest.join(', '))}님은 초대하지 않아서 볼 수 없어요.` : ''}</span>` : ''}<span class="cap" style="display:block;margin-top:8px">위에 적힌 사람만 볼 수 있고, 나중에 참여자 관리에서 바꿀 수 있어요.</span>`, ok: '추억 만들기', cancel: '수정하기' });
    if (!ok) return 'noroute';
    const g = fd.get('group'), r = await api('POST', '/api/posts', { title: fd.get('title'), occurred_on: fd.get('date'), member_ids: fd.getAll('m').map(Number), group_id: g || null, meetup_id: f.dataset.meetup || null, place: placeOf(fd), text: fd.get('text') });
    const files = [...f.photos.files]; if (files.length) await upload(r.id, files);
    try { localStorage.removeItem('ws_draft'); } catch { }
    location.hash = '#/post/' + r.id; return 'noroute';
  },
  async privacy(fd) { await api('POST', '/api/privacy', { kind: fd.get('kind'), detail: fd.get('detail') }); toast('요청이 접수됐어요.'); },
};

// 새 추억: 선택한 사람 고정 표시 + 초안 자동 저장 (제목·날짜·사람·글만, 사진은 저장하지 않음)
function markSpace(sel) { // 공간 멤버를 후보로 표시만 한다. 선택은 사람이 직접 한다.
  const f = sel.form, g = (window._groups || []).find(x => x.id === +sel.value), row = $('#space-all', f), note = $('#space-note', f);
  f.querySelectorAll('.pick label').forEach(l => l.classList.remove('sp'));
  if (g) { g.members.forEach(m => f.querySelector(`input[name=m][value="${m.id}"]`)?.closest('label')?.classList.add('sp')); if (row) row.hidden = false; if (note) note.textContent = `‘${g.name}’ 멤버(공간 표시)는 함께한 사람만 직접 골라 주세요. 고르지 않은 멤버는 이 추억을 볼 수 없어요.`; }
  else { if (row) row.hidden = true; if (note) note.textContent = '공간에 연결해도 선택한 사람만 이 추억을 볼 수 있어요.'; }
  updSel();
}
function updCounters() { document.querySelectorAll('[data-counter]').forEach(el => { const c = el.parentElement.querySelector('.count'); if (c) c.textContent = `${el.value.length}/${el.maxLength}`; }); }
function updSel() {
  const f = $('[data-form=newpost]'), bar = $('#selbar'); if (!f || !bar) return;
  const names = [...f.querySelectorAll('input[name=m]:checked')].map(i => i.nextElementSibling.textContent);
  bar.innerHTML = names.length ? `<b>${names.length + 1}명이 볼 수 있어요</b> · 나, ${esc(names.join(', '))}` : '함께한 사람을 선택해 주세요. 선택한 사람만 이 추억을 볼 수 있어요.';
}
function saveDraft(f) { try { localStorage.setItem('ws_draft', JSON.stringify({ title: f.title.value, date: f.date.value, text: f.text.value, members: [...f.querySelectorAll('input[name=m]:checked')].map(i => +i.value) })); } catch { } }
document.addEventListener('input', e => { if (e.target.matches?.('[data-counter]')) updCounters(); const f = e.target.closest?.('[data-form=newpost]'); if (f) saveDraft(f); });
// 가입 폼 검증. 비밀번호는 어디에도 저장하지 않는다. (실서비스: 이름 확인 API는 호출 제한과 함께 운영)
// 프로토타입이 아니라 실제 서버를 호출한다. 이 함수만 바꾸면 다른 확인 방식으로 교체할 수 있다.
// 정책: 탈퇴·제재·예약 사유는 노출하지 않고 '사용 가능/사용 불가'로만 답한다. 이름은 공개 식별자라 이 확인은 계정 열거와 같으므로 서버에서 호출 횟수를 제한한다.
// (이메일처럼 '이전에 사용한 값(rejoin_available)' 상태는 두지 않는다: 탈퇴한 이름은 즉시 일반 사용 가능 상태로 돌아간다.)
const config = { checkName: v => api('GET', '/api/username-check?u=' + encodeURIComponent(v)) };
function initSignup() {
  const f = $('[data-form=signup], [data-form=oauth-signup], [data-form=oauth-consent]'); if (!f || f._init) return; f._init = 1;
  const E = n => f.elements[n], has = n => !!E(n), msg = (id, text, kind) => { const m = $('#' + id); m.textContent = text; m.className = 'msg' + (kind ? ' ' + kind : ''); };
  const u = { status: 'idle', checked: false, token: 0, timer: 0 };
  const rules = pw => ({ len: pw.length >= 8, letter: /[A-Za-z]/.test(pw), digit: /[0-9]/.test(pw) });
  const UM = { idle: ['영문 소문자, 숫자, _ 로 3–20자예요. 로그인과 친구 찾기에 써요.', ''], invalid: ['이름은 영문 소문자, 숫자, _ 로 3–20자예요.', 'bad'], checking: ['확인하고 있어요', ''], available: ['사용할 수 있는 이름이에요.', 'ok'], unavailable: ['현재 이 이름으로 가입할 수 없어요. 다른 이름을 써 주세요.', 'bad'], error: ['지금은 확인하지 못했어요. 잠시 후 다시 시도해 주세요.', 'bad'] };
  const setU = st => { u.status = st; u.checked = st === 'available'; msg('su-user-m', ...UM[st]); E('username').setAttribute('aria-invalid', st === 'invalid' || st === 'unavailable'); upd(); };
  const upd = () => {
    const left = [];
    if (has('nickname') && !validateNickname(E('nickname').value).ok) left.push('닉네임');
    if (has('username') && !u.checked) left.push('이름 확인');
    if (has('password')) {
      const pw = E('password').value, r = rules(pw), c = E('confirm').value;
      f.querySelectorAll('[data-r]').forEach(li => { const ok = r[li.dataset.r]; li.classList.toggle('ok', ok); li.innerHTML = (ok ? I('check', 's') : '<i class="rdot"></i>') + li.textContent; });
      if (!(r.len && r.letter && r.digit)) left.push('비밀번호 조건');
      if (!(c && c === pw)) left.push('비밀번호 확인');
    }
    if (has('c_terms') && !(E('c_terms').checked && E('c_privacy').checked)) left.push('필수 동의');
    f.querySelector('.btn.block').disabled = left.length > 0;
    $('#su-why').textContent = left.length ? `남은 항목이 ${left.length}개 있어요: ${left.join(', ')}` : '';
  };
  f._upd = upd;
  if (has('c_all')) f.addEventListener('change', e => { // 전체 동의 ↔ 개별 동의
    const names = ['c_terms', 'c_privacy', 'c_marketing'];
    if (e.target.name === 'c_all') names.forEach(n => E(n).checked = e.target.checked); else E('c_all').checked = names.every(n => E(n).checked);
    upd();
  });
  if (has('nickname')) {
    f.addEventListener('nickchange', () => { upd(); try { sessionStorage.setItem('ws_nick', E('nickname').value); } catch { } }); // 닉네임 임시 입력만 세션에 유지 (비밀번호는 저장하지 않는다)
    try { const d = sessionStorage.getItem('ws_nick'); if (d && !E('nickname').value) { E('nickname').value = d; nst(E('nickname')).lastUser = d; nickRender(E('nickname'), false); } } catch { }
  }
  if (has('username')) E('username').addEventListener('input', () => {
    const v = E('username').value = E('username').value.toLowerCase().replace(/\s/g, ''); clearTimeout(u.timer); const tk = ++u.token;
    if (!v) return setU('idle');
    if (!/^[a-z0-9_]{3,20}$/.test(v)) return setU('invalid'); // 값이 바뀌면 확인 완료를 무효화한다
    setU('checking');
    u.timer = setTimeout(async () => { try { const r = await config.checkName(v); if (tk === u.token) setU(r.state); } catch { if (tk === u.token) setU('error'); } }, 400); // 오래된 응답은 무시
  });
  if (has('password')) {
    E('password').addEventListener('input', () => { upd(); E('confirm').dispatchEvent(new Event('input')); });
    const cm = final => { const pw = E('password').value, c = E('confirm').value; if (!c) return msg('su-pw2-m', ''); if (c === pw) msg('su-pw2-m', '비밀번호가 일치해요.', 'ok'); else if (pw.startsWith(c) && !final) msg('su-pw2-m', ''); else msg('su-pw2-m', '비밀번호가 일치하지 않아요.', 'bad'); upd(); };
    E('confirm').addEventListener('input', () => cm(false)); E('confirm').addEventListener('blur', () => cm(true));
  }
  upd();
}
// ===== 인라인 오류 =====
// 잘못 입력하면 해당 칸 아래에 한 줄로 알리고(aria-invalid + role=alert), 첫 오류 칸으로 포커스를 옮긴다. 입력을 고치면 그 칸의 오류만 사라진다.
const fieldBox = (f, name) => { const direct = f.querySelector(`[data-field="${name}"]`); if (direct) return [direct, direct.querySelector('input,select,textarea')]; const c = f.elements[name]; const el = c && !c.tagName ? c[0] : c; if (!el) return [null, null]; return [el.closest('[data-field], .field') || el.closest('.pick')?.parentElement || el.parentElement, el]; };
function fieldErr(f, name, text) {
  const [box, el] = fieldBox(f, name); if (!box) return false;
  const live = box.querySelector('small.msg'); // 실시간 검증 메시지가 있는 칸(닉네임·이름·비밀번호 확인)은 그 자리를 쓴다
  if (live) { live.textContent = text; live.className = 'msg bad'; }
  else { let m = box.querySelector(':scope > small.fe'); if (!m) { m = document.createElement('small'); m.className = 'fe'; m.setAttribute('role', 'alert'); box.append(m); } m.textContent = text; }
  el?.setAttribute('aria-invalid', 'true'); return el || true;
}
function clearErrors(f) { f.querySelectorAll('small.fe').forEach(m => m.remove()); f.querySelectorAll('[aria-invalid=true]').forEach(e => e.removeAttribute('aria-invalid')); }
document.addEventListener('input', e => { const el = e.target, f = el.form; if (!f?.dataset?.form || !el.name) return; const [box] = fieldBox(f, el.name); box?.querySelector(':scope > small.fe')?.remove(); if (!box?.querySelector('small.msg')) el.removeAttribute('aria-invalid'); });
document.addEventListener('change', e => { const el = e.target, f = el.form; if (!f?.dataset?.form || !el.name) return; const [box] = fieldBox(f, el.name); box?.querySelector(':scope > small.fe')?.remove(); });
const need = (v, m) => String(v ?? '').trim() ? null : m;
const pastOk = d => d && d > localDate() ? '오늘 이후 날짜는 고를 수 없어요.' : null;
const pickOk = m => fd => [['m', fd.getAll('m').length ? null : m]];
const VALID = {
  login: fd => [['username', need(fd.get('username'), '이름을 입력해 주세요.')], ['password', need(fd.get('password'), '비밀번호를 입력해 주세요.')]],
  request: fd => { const v = String(fd.get('username') || '').trim().replace(/^@/, ''); return [['username', !v ? '연결할 이름을 입력해 주세요.' : !/^[a-z0-9_]{3,20}$/i.test(v) ? '이름은 영문, 숫자, _ 로 3–20자예요.' : null]]; },
  note: fd => [['text', need(fd.get('text'), '내용을 입력해 주세요.')]],
  'memory-comment': fd => [['text', need(fd.get('text'), '짧은 기억을 남겨 주세요.')]],
  newpost: fd => [['title', need(fd.get('title'), '추억 제목을 입력해 주세요.')], ['m', fd.getAll('m').length ? null : '함께한 사람을 한 명 이상 선택해 주세요.'], ['date', pastOk(fd.get('date'))], ['pcity', (fd.get('pname') || fd.get('parea')) && !fd.get('pcity') && !fd.get('pcity_x') && !fd.get('pcountry') && !fd.get('pcountry_x') ? '지역을 골라 주세요.' : null]],
  newmeetup: fd => [['title', need(fd.get('title'), '약속 이름을 입력해 주세요.')], ...whenValid(fd)],
  'meetup-edit': fd => [['title', need(fd.get('title'), '약속 이름을 입력해 주세요.')], ...whenValid(fd)],
  'post-edit': fd => [['title', need(fd.get('title'), '추억 제목을 입력해 주세요.')], ['date', pastOk(fd.get('date'))]],
  group: fd => [['name', need(fd.get('name'), '우리 공간 이름을 입력해 주세요.')]],
  'space-rename': fd => [['name', need(fd.get('name'), '공간 이름을 입력해 주세요.')]],
  'group-add': pickOk('추가할 사람을 한 명 이상 선택해 주세요.'), 'post-invite': pickOk('초대할 사람을 한 명 이상 선택해 주세요.'), 'meetup-invite': pickOk('초대할 사람을 한 명 이상 선택해 주세요.'),
  attended: () => [],
  settle: fd => {
    const total = Number(fd.get('total')), ms = fd.getAll('m').map(Number), custom = fd.get('method') === 'custom';
    const sum = custom ? ms.reduce((a, m) => a + (Number(fd.get('a' + m)) || 0), 0) : total, diff = sum - total;
    return [['title', need(fd.get('title'), '정산 항목을 입력해 주세요.')], ['total', !fd.get('total') ? '전체 금액을 입력해 주세요.' : !Number.isInteger(total) || total <= 0 ? '금액은 1원 이상의 정수로 입력해 주세요.' : null], ['m', ms.length ? null : '나누는 사람을 한 명 이상 선택해 주세요.'], ['method', custom && total > 0 && diff ? `나눈 금액의 합이 전체 금액보다 ${Math.abs(diff).toLocaleString('ko-KR')}원 ${diff > 0 ? '많아요' : '적어요'}.` : null]];
  },
  report: fd => [['category', fd.get('category') ? null : '신고 유형을 선택해 주세요.']],
  privacy: fd => [['kind', fd.get('kind') ? null : '요청 종류를 선택해 주세요.']],
  rename: fd => [['nickname', (r => r.ok ? null : r.message)(validateNickname(fd.get('nickname')))]],
  'delete-account': fd => [['password', need(fd.get('password'), S.me?.has_password ? '비밀번호를 입력해 주세요.' : '내 이름을 입력해 주세요.')]],
  'oauth-consent': (fd, f) => [['consent', fd.get('c_terms') && fd.get('c_privacy') ? null : '필수 동의 항목을 확인해 주세요.']],
};
// ---------- 이벤트 ----------
document.addEventListener('click', e => { const t = e.target.closest('[data-act]'); if (t && A[t.dataset.act]) { e.preventDefault(); A[t.dataset.act](t.dataset, t); } });
document.addEventListener('submit', async e => {
  const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
  let err = f.querySelector('.err'); if (!err) { err = document.createElement('p'); err.className = 'err'; err.setAttribute('role', 'alert'); f.append(err); }
  err.textContent = ''; clearErrors(f);
  const btn = f.querySelector('.btn:not([type=button]):not([data-act])') || f.querySelector('button:not([type=button])');
  const fd = new FormData(f);
  const bad = (VALID[f.dataset.form]?.(fd, f) || []).filter(([, m]) => m);
  if (bad.length) { const els = bad.map(([n, m]) => fieldErr(f, n, m)); (els.find(x => x && x !== true))?.focus(); return; }
  btn && (btn.disabled = true);
  try { const r = await F[f.dataset.form](fd, f); if (r !== 'noroute') { if (['login', 'signup', 'oauth-signup'].includes(f.dataset.form)) S.authMode = 'intro'; route(); } }
  catch (ex) {
    const el = ex.data?.field && fieldErr(f, ex.data.field, ex.message);
    if (el) { if (el !== true) el.focus(); } else err.textContent = ex.message;
    if (ex.network && btn) { btn.dataset.label ||= btn.textContent; btn.textContent = '다시 시도하기'; f.addEventListener('input', () => { btn.textContent = btn.dataset.label; }, { once: true }); }
  }
  finally { btn && (btn.disabled = false); f._upd?.(); }
});
document.addEventListener('change', e => { const pf = e.target; if (pf.matches?.('[data-form=newpost] input[name=photos]')) { const add = [...pf.files].filter(x => !PP.files.some(y => y.name === x.name && y.size === x.size)); PP.files.push(...add); PP.urls.push(...add.map(x => URL.createObjectURL(x))); ppRender(); return; }
  const t = e.target;
  if (t.closest('[data-form=newpost]')) { updSel(); saveDraft(t.closest('form')); }
  if (t.matches('[data-upload]')) { const files = [...t.files]; t.value = ''; upload(+t.dataset.upload, files).then(() => route()); }
  else if (t.matches('[data-filter=people]')) { const id = +t.value; S.filter.people = t.checked ? [...S.filter.people, id] : S.filter.people.filter(x => x !== id); route(); }
  else if (t.matches('[data-filter]')) { S.filter[t.dataset.filter] = t.value; route(); }
  else if (t.matches('input[name=tk],input[name=pk]')) { const f = t.form, isT = t.name === 'tk', inp = f.elements[isT ? 'at' : 'place']; inp.style.display = (isT ? t.value === 'exact' : t.value !== 'tbd') ? '' : 'none'; if (!isT) inp.placeholder = t.value === 'area' ? '예: 성수, 홍대' : '예: 카페 이름'; }
  else if (t.matches('[data-fillgroup]')) { markSpace(t); saveDraft(t.form); }
  else if (t.matches('[data-method]')) t.form.querySelectorAll('.custom').forEach(i => i.style.display = t.value === 'custom' ? '' : 'none');
});

window.addEventListener('pageshow', e => { if (e.persisted) { S.snsBusy = false; route(); } });
route();
