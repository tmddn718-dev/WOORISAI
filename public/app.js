import { validateNickname, graphemes, suggest, NICK_MAX, NICK_HINT } from './nickname.js';
// 우리사이 웹 앱 — 바닐라 JS SPA. 권한은 서버가 판단하고, 여기서는 그 결과만 보여준다.
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const S = { me: null, draft: null, authMode: 'intro', filter: { people: [], mode: 'and', group: '', year: '' }, join: null };

const ic = {
  home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',
  back: '<path d="M15 5l-7 7 7 7"/>', more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
  chev: '<path d="M9 5l7 7-7 7"/>', lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  pin: '<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>',
  users: '<circle cx="9" cy="9" r="3.5"/><path d="M3 19c.7-3.2 3-5 6-5s5.3 1.8 6 5"/><path d="M16 6a3.5 3.5 0 0 1 0 7M18 14.5c1.7.6 2.7 2 3 4.5"/>',
  clock: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>', block: '<circle cx="12" cy="12" r="8"/><path d="M6.3 6.3l11.4 11.4"/>',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>', flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  down: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>', out: '<path d="M9 4H5v16h4M16 8l4 4-4 4M20 12H9"/>', link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  coin: '<circle cx="12" cy="12" r="8"/><path d="M12 7v10M9.5 9.5c.5-1 1.500-1.500 2.500-1.500 1.500 0 2.500.8 2.500 2s-1 1.800-2.500 2-2.500.8-2.500 2 1 2 2.500 2c1 0 2-.5 2.500-1.500"/>',
  check: '<path d="M5 12l5 5 9-10"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>', help: '<circle cx="12" cy="12" r="8"/><path d="M9.5 9.500a2.500 2.500 0 1 1 3.500 2.300c-.700.400-1 .900-1 1.700M12 16.500v.01"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
  bookmark: '<path d="M7 4h10v16l-5-4-5 4z"/>',
  star: '<path d="M12 4l2.400 5 5.600.7-4 3.900 1 5.500-5-2.700-5 2.700 1-5.500-4-3.900 5.600-.7z"/>',
};
const KNOT = '<svg class="knot" viewBox="0 0 120 120" aria-hidden="true"><path d="M32 41 C32 30 44 25 53 33 L60 40 L67 33 C76 25 88 30 88 41 V74 C88 85 76 90 67 82 L60 75 L53 82 C44 90 32 85 32 74Z" fill="#fff" opacity=".85"/><circle cx="60" cy="57" r="9" fill="#D3DBD1"/></svg>';
const I = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${ic[n]}</svg>`;

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
  b.addEventListener('mousedown', e => { if (e.target === b) closeSheet(); });
  $('#layer').append(b); b.querySelectorAll('form[data-form]').forEach(f => f.noValidate = true); b.firstElementChild.focus(); return b;
}
const closeSheet = () => { $('#layer').innerHTML = ''; };
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
const ask = o => new Promise(res => {
  const b = sheet(`<h2>${esc(o.title)}</h2><p class="sub body2">${o.body || ''}</p>${o.check ? `<label class="row" style="margin-top:16px"><input type="checkbox" id="ck" style="width:20px;height:20px"><span class="body2">${esc(o.check)}</span></label>` : ''}<div class="actions"><button class="btn ${o.danger ? 'danger' : ''}" data-r="1">${esc(o.ok)}</button><button class="btn line" data-r="0">취소</button></div>`);
  b.addEventListener('click', e => { const t = e.target.closest('[data-r]'); if (t) { const ck = $('#ck', b)?.checked; closeSheet(); res(t.dataset.r === '1' ? { checked: !!ck } : null); } });
});
const fmtDate = d => { if (!d) return '날짜 미상'; const [y, m, x] = d.split('-'); return `${y}년 ${+m}월 ${+x}일`; };
const localTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
const fmtDT = (iso, tz) => new Date(iso).toLocaleString('ko-KR', { timeZone: tz || localTz, month: 'long', day: 'numeric', weekday: 'short', hour: 'numeric', minute: '2-digit', year: 'numeric' }) + (tz && tz !== localTz ? ` (${tz})` : '');
const localDate = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const won = n => Number(n).toLocaleString('ko-KR') + '원';
const top = (title, o = {}) => `<header class="top">${o.back === false ? '' : `<button class="icon-btn" data-act="back" aria-label="뒤로 가기">${I('back')}</button>`}<h1>${esc(title)}</h1>${o.right || ''}</header>`;
const empty = (t, d, btn, icon = 'photo') => `<div class="empty"><span class="empty-ic">${I(icon)}</span><h2>${t}</h2><p>${d}</p>${btn || ''}</div>`;
const av = (n, c = '') => `<span class="av ${c}" aria-hidden="true">${esc([...(n || '?')][0])}</span>`;
const pick = (list, name = 'm', on = []) => { const dup = list.reduce((m, u) => (m[u.name] = (m[u.name] || 0) + 1, m), {}); return `<div class="pick">${list.map(u => `<label><input type="checkbox" name="${name}" value="${u.id}" ${on.includes(u.id) ? 'checked' : ''}><span>${esc(u.name)}${u.username && dup[u.name] > 1 ? ` <i class="uid">@${esc(u.username)}</i>` : ''}</span></label>`).join('')}</div>`; };
const tile = p => `<a class="tile" href="#/post/${p.id}"><span class="t-ph">${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}</span><b>${esc(p.title)}</b><span class="cap">${fmtDate(p.occurred_on)}${p.place ? ' · ' + esc(p.place.label) : ''} · ${p.count}명</span></a>`;
const postCard = p => `<a class="card post" href="#/post/${p.id}"><div class="ph">${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}<span class="ph-badge">${I('lock', 's')}초대된 사람만</span></div><div class="meta"><h2>${esc(p.title)}</h2><p class="cap">${fmtDate(p.occurred_on)}${p.place ? ' · ' + esc(p.place.label) : ''}${p.status === 'closed' ? ' · 종료됨' : ''}${p.years_ago ? ` · ${p.years_ago}년 전 오늘` : ''}</p><div class="who"><span class="avs">${(p.names || []).map(n => av(n, 's')).join('')}</span><span><b>${p.count}명이 함께</b></span></div></div></a>`;
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

// ---------- 페이지 ----------
const P = {};
const RSL = { yes: '참석', maybe: '미정', no: '불참', invited: '응답 대기' };
const planCard = m => { const d = new Date(m.starts_at), off = m.status === 'cancelled'; return `<a class="plan${off ? ' off' : ''}" href="#/meetup/${m.id}" aria-label="${esc(m.title)}, ${off ? '취소됨' : RSL[m.rsvp] || ''}"><span class="pd"><span>${d.getMonth() + 1}월</span><b>${d.getDate()}</b></span><span class="pb"><b>${esc(m.title)}</b><span class="cap">${d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' })} · ${m.place ? esc(m.place) : '장소 미정'}</span><span class="going">${m.going?.length ? `<span class="avs">${m.going.map(n => av(n, 's')).join('')}</span>` : ''}<span class="cap">${m.yes ? m.yes + '명 참석' : '아직 응답이 없어요'}</span></span></span><span class="pr"><span class="rs ${off ? 'x' : m.rsvp}">${off ? '취소됨' : RSL[m.rsvp] || ''}</span>${m.changed && !off ? '<span class="chg">변경됨</span>' : ''}</span></a>`; };

P.home = async () => {
  const [d, today] = await Promise.all([api('GET', '/api/home'), api('GET', '/api/today?date=' + localDate())]);
  const news = d.postInvites.length + d.friendRequests.length + d.meetupInvites.length;
  return `<header class="top home-top"><div class="small-logo"><img src="/logo.svg" alt=""><span class="wordmark">우리사이</span></div><a class="home-av" href="#/me" aria-label="나">${av(S.me.name, 's')}</a></header><div class="page">
  <p class="cap" style="margin-bottom:8px">${new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'long' })}</p>
  <div class="chips" style="margin:12px 0 24px" aria-label="빠른 시작"><a class="chip" href="#/new-meetup">${I('cal', 's')} 약속 만들기</a><a class="chip" href="#/people">${I('users', 's')} 사람 초대하기</a><a class="chip" href="#/saved">${I('bookmark', 's')} 저장한 추억</a><a class="chip" href="#/memories?tab=map">${I('pin', 's')} 추억 지도</a></div>
  ${news ? `<section aria-label="새 소식"><div class="hd row between"><h2>새 소식</h2></div><div class="card list">
    ${d.postInvites.map(x => `<a href="#/post/${x.id}">${av(x.inviter)}<span class="grow"><b>${esc(x.title)}</b><br><span class="cap">${esc(x.inviter)}${x.inviter_username ? ` (@${esc(x.inviter_username)})` : ''}님이 추억에 초대했어요</span></span>${I('chev', 's')}</a>`).join('')}
    ${d.friendRequests.map(x => `<div>${av(x.name)}<span class="grow"><b>${esc(x.name)}</b><br><span class="cap">연결을 요청했어요</span></span><button class="btn sm" data-act="accept-friend" data-id="${x.id}">수락</button><button class="btn sm line" data-act="decline-friend" data-id="${x.id}">거절</button></div>`).join('')}
    ${d.meetupInvites.map(x => `<a href="#/meetup/${x.id}">${av('약')}<span class="grow"><b>${esc(x.title)}</b><br><span class="cap">${fmtDT(x.starts_at, x.tz)} · 참석 여부를 알려 주세요</span></span>${I('chev', 's')}</a>`).join('')}</div></section>` : ''}
  ${d.posts.length ? `<section class="home-sec sec" aria-label="최근 함께한 추억"><h2>최근 함께한 추억</h2><div class="hero-card">${postCard(d.posts[0])}</div>${d.posts.slice(1, 3).map(p => `<a class="mrow" href="#/post/${p.id}"><span class="th">${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}</span><span><b>${esc(p.title)}</b><span class="cap">${fmtDate(p.occurred_on)} · ${p.count}명${p.place ? ' · ' + esc(p.place.label) : ''}</span></span>${I('chev', 's')}</a>`).join('')}${d.posts.length > 3 ? `<a class="btn sm line" style="align-self:flex-start" href="#/memories">추억 모두 보기 (${d.posts.length})</a>` : ''}</section>
  <div class="cta-card sec"><span class="ic">${I('plus')}</span><span class="tx"><b>함께한 순간을 남겨볼까요?</b><span>사진과 이야기를 하나의 추억으로 모아보세요.</span><a class="btn sm" href="#/new-post">${I('plus', 's')} 새 추억 만들기</a></span></div>` : `<section class="sec" aria-label="우리의 추억"><div class="hd"><h2>우리의 추억</h2></div>${empty('아직 남긴 추억이 없어요.', '함께했던 하루를 첫 번째 추억으로 남겨보세요.', '<a class="btn" href="#/new-post">첫 추억 만들기</a>')}</section>`}
  ${today.items.length ? `<section class="moment" aria-label="1년 전 오늘"><h2>그날의 우리가 여기 있어요</h2><p class="cap" style="margin:4px 0 16px">함께 남긴 사진과 이야기를 다시 살펴보세요.</p>${postCard(today.items[0])}<div class="row" style="margin-top:12px;flex-wrap:wrap"><a class="btn sm line" href="#/post/${today.items[0].id}?add=1">${I('plus', 's')} 기억 더하기</a><button class="btn sm line" data-act="hide-post" data-id="${today.items[0].id}">다시 추천하지 않기</button></div></section>` : ''}
  <section class="sec" aria-label="다가오는 약속"><div class="hd"><h2>다가오는 약속</h2><a class="btn sm line" href="#/new-meetup">${I('plus', 's')} 새 약속 만들기</a></div><div class="stack" style="gap:12px">${d.upcoming.length ? d.upcoming.map(planCard).join('') : `<div class="plan-empty"><span class="pe-ic">${I('cal')}</span><span><b>다가오는 약속이 없어요</b><span class="cap">만날 날을 정해 두면, 그날을 추억으로 이어 남길 수 있어요.</span></span></div>`}${d.pastNudge ? `<a class="nudge" href="#/meetup/${d.pastNudge.id}"><span class="pe-ic s">${I('photo', 's')}</span><span><b>지난 약속을 추억으로 남길까요?</b><span class="cap">${esc(d.pastNudge.title)} · ${new Date(d.pastNudge.starts_at).getMonth() + 1}월 ${new Date(d.pastNudge.starts_at).getDate()}일</span></span>${I('chev', 's')}</a>` : ''}${d.upcoming.length ? '<a class="body2" style="color:var(--green)" href="#/meetups">약속 모두 보기</a>' : ''}</div></section>
</div>`;
};

P.post = async id => {
  const p = await api('GET', '/api/posts/' + id);
  if (p.preview) return `${top('추억 초대')}<div class="page stack"><div class="card pad stack"><span class="tag" style="align-self:flex-start">초대받은 추억</span><h1>${esc(p.title)}</h1><p class="sub body2">${esc(p.inviter)}${p.inviter_username ? ` (@${esc(p.inviter_username)})` : ''}님이 이 추억을 함께 기록하자고 초대했어요.</p><div class="note">수락하면 사진과 글, 함께한 사람을 볼 수 있어요. 수락하기 전에는 사진과 장소가 보이지 않아요.</div></div><div class="row"><button class="btn grow" data-act="respond" data-id="${p.id}" data-v="1">수락하기</button><button class="btn line grow" data-act="respond" data-id="${p.id}" data-v="0">거절하기</button></div></div>`;
  const isAdmin = p.me.role === 'admin', open = p.status === 'active';
  const acc = p.members.filter(m => m.access === 'accepted'), inv = p.members.filter(m => m.access === 'invited');
  const stories = p.notes.filter(n => n.kind === 'story'), cmts = p.notes.filter(n => n.kind === 'comment');
  const noteHtml = n => `<div class="card pad" style="${n.kind === 'comment' ? 'border:0;background:var(--sage)' : ''}"><div class="row between"><span class="cap"><b style="color:var(--ink)">${esc(n.author)}</b> · ${n.created_at.slice(0, 10)}</span>${n.mine ? `<button class="btn sm line" data-act="del-note" data-id="${n.id}" aria-label="내 글 삭제하기">삭제</button>` : `<button class="btn sm line" data-act="report" data-t="note" data-id="${n.id}" aria-label="신고하기">신고</button>`}</div><p style="margin-top:8px;white-space:pre-wrap">${n.restricted ? '<span class="sub">검토 중인 콘텐츠예요</span>' : esc(n.text)}</p></div>`;
  return `<nav class="crumb" aria-label="현재 위치"><a href="#/">홈</a> › <a href="#/memories">추억</a> › ${esc(p.title)}</nav>${top('', { right: `<button class="icon-btn" data-act="post-menu" data-id="${p.id}" aria-label="더 보기">${I('more')}</button>` })}
  <div class="page stack" style="padding-top:8px" data-post="${p.id}">
    ${(() => { const cv = p.media.find(m => m.id === p.cover && !m.restricted)?.id ?? p.media.find(m => !m.restricted)?.id; return cv ? `<div class="cover"><img src="/media/${cv}" alt="대표 사진"></div>` : ''; })()}
    <div><h1>${esc(p.title)}</h1><p class="sub body2">${fmtDate(p.occurred_on)}${p.place ? ` · <span title="${p.place.precision === 'exact' ? '정확한 장소' : p.place.precision === 'area' ? '동네까지만 표시' : '도시까지만 표시'}">${I('pin', 's')} ${esc(p.place.label)}</span>` : ''}${p.status === 'closed' ? ' · <span class="tag warn">종료됨</span>' : ''}</p>
      ${p.meetup ? `<a class="tag" href="#/meetup/${p.meetup.id}">${esc(p.meetup.title)} 약속에서</a>` : ''}${p.groups.map(g => `<span class="tag">${esc(g.name)}</span>`).join(' ')}</div>
    ${open ? `<button class="btn block" data-act="add-more">${I('plus')} 사진 또는 기억 더하기</button><input type="file" accept="image/*" multiple hidden data-upload="${p.id}" id="pf">` : ''}
    <div class="split"><div class="stack"><section class="card pad" aria-label="볼 수 있는 사람"><div class="row between"><h3>함께한 사람 ${acc.length}명</h3><span class="cap">${I('lock', 's')} 초대된 사람만 볼 수 있어요</span></div>
      <div class="row" style="flex-wrap:wrap;margin-top:12px;gap:8px">${acc.map(m => `<span class="row" style="gap:8px">${av(m.name, 's')}<span class="body2"><i class="dot" title="수락함"></i> ${esc(m.name)}${m.role === 'admin' ? ' <span class="tag">관리자</span>' : ''}</span></span>`).join('')}${inv.map(m => `<span class="tag"><i class="dot hollow"></i> ${esc(m.name)} · 초대 중</span>`).join('')}</div></section>
    <section><div class="row between" style="margin-bottom:12px"><h2>사진 ${p.media.length ? p.media.length + '장' : ''}</h2></div>
      ${p.media.length ? `<div class="grid3">${p.media.map(m => m.restricted ? '<div class="res">검토 중인 콘텐츠예요</div>' : `<button data-act="photo" data-id="${m.id}" data-mine="${m.mine ? 1 : 0}" data-cover="${p.cover === m.id ? 1 : 0}" aria-label="사진 크게 보기"><img loading="lazy" src="/media/${m.id}" alt="함께 남긴 사진"></button>`).join('')}</div>` : `<div class="card pad sub body2">아직 사진이 없어요. 오늘 찍은 사진을 가장 먼저 보태 보세요.</div>`}</section>
    </div><div class="stack"><section class="stack"><h2>우리의 이야기</h2>${stories.map(noteHtml).join('') || '<p class="sub body2">아직 남긴 이야기가 없어요.</p>'}
      ${open ? `<form data-form="note" data-id="${p.id}" data-kind="story" class="stack"><label class="field"><span class="cap">내가 기억하는 그날</span><textarea name="text" id="story-ta" maxlength="2000" required placeholder="그날의 이야기를 남겨 보세요"></textarea><small>남긴 기억은 이 추억의 참여자 ${acc.length}명이 볼 수 있어요.</small></label><button class="btn block">함께 기록하기</button></form>` : ''}</section>
    <section class="stack"><div class="row between"><h2>댓글 ${cmts.length || ''}</h2><button class="btn sm ${p.reactions.mine ? '' : 'line'}" data-act="react" data-id="${p.id}" aria-pressed="${p.reactions.mine}">${I('heart', 's')} ${p.reactions.count || ''} 좋아요</button></div>${cmts.map(noteHtml).join('')}
      ${open ? `<form data-form="note" data-id="${p.id}" data-kind="comment" class="row"><input type="text" name="text" maxlength="500" required placeholder="댓글 남기기" aria-label="댓글"><button class="btn sm" style="flex:none">남기기</button></form>` : ''}</section></div></div></div>`;
};

P.newPost = async () => {
  const [pp, gg] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/groups')]);
  let restored = false, d = S.draft; S.draft = null;
  if (!d) { try { d = JSON.parse(localStorage.getItem('ws_draft') || 'null'); restored = !!d; } catch { } } d ||= {}; window._groups = gg.groups;
  if (!pp.friends.length) return `${top('새 추억 만들기')}${empty('함께할 사람을 먼저 연결해 주세요', '이름이나 초대 링크로 연결하면 함께 추억을 남길 수 있어요.', '<a class="btn" href="#/people">사람 연결하기</a>')}`;
  return `${top('새 추억 만들기')}<form class="page stack" data-form="newpost" data-meetup="${d.meetup_id || ''}">
    ${restored ? '<div class="note row between"><span>임시 저장된 초안을 불러왔어요.</span><button type="button" class="btn sm line" data-act="draft-clear">삭제</button></div>' : ''}
    <label class="field"><span>추억 제목</span><input type="text" name="title" maxlength="40" required value="${esc(d.title || '')}" placeholder="예) 성수동 브런치" data-counter><small class="count"></small></label>
    <label class="field"><span>언제였나요?</span><input type="date" name="date" value="${d.date || localDate()}" max="${localDate()}"></label>
    <div class="field"><span>누구와 함께했나요?</span><div class="selbar" id="selbar" aria-live="polite"></div>${pick(pp.friends, 'm', d.members || [])}
      ${gg.groups.length ? `<label class="field" style="margin-top:12px"><span class="cap">그룹으로 빠르게 고르기 <small style="display:inline">(선택)</small></span><select name="group" data-fillgroup><option value="">그룹 없이 사람만 고를게요</option>${gg.groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select><small>그룹을 골라도 이 추억에 초대한 사람만 볼 수 있어요. 그룹을 나중에 바꿔도 이미 만든 추억의 멤버는 바뀌지 않아요.</small></label>` : ''}</div>
    <details class="card pad"><summary style="cursor:pointer;font-weight:500">장소 남기기 (선택)</summary><div class="stack" style="margin-top:12px">
      <label class="field"><span>장소 이름</span><input type="text" name="pname" maxlength="40"></label>
      <div class="row"><label class="field grow"><span>동네</span><input type="text" name="parea" maxlength="30"></label><label class="field grow"><span>도시</span><input type="text" name="pcity" maxlength="30"></label></div>
      <label class="field"><span>국가</span><input type="text" name="pcountry" maxlength="30" value="대한민국"></label>
      <label class="field"><span>보여줄 위치 수준</span><select name="pprec"><option value="exact">정확한 장소까지</option><option value="area" selected>동네까지만</option><option value="city">도시까지만</option></select><small>선택한 수준보다 자세한 위치는 서버에서 내려주지 않아요. 사진의 GPS 정보는 올릴 때 항상 지워요.</small></label></div></details>
    <label class="field"><span>첫 이야기 (선택)</span><textarea name="text" maxlength="2000" placeholder="그날을 한 줄로 남겨 보세요" data-counter>${esc(d.text || '')}</textarea><small class="count"></small></label>
    <label class="field"><span>사진 (선택)</span><input type="file" name="photos" accept="image/*" multiple></label>
    <div class="stickybar"><p class="err" role="alert"></p><button class="btn block">다음: 볼 수 있는 사람 확인</button></div></form>`;
};

P.memories = async () => {
  const tab = ['list', 'cal', 'map', 'today'].includes(S.q.tab) ? S.q.tab : 'list', f = S.filter;
  const [pp, gg] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/groups')]);
  const qs = new URLSearchParams({ people: f.people.join(','), mode: f.mode, group: f.group, year: f.year }).toString();
  const yr = new Date().getFullYear(), active = f.people.length || f.group || f.year;
  const filterUi = tab === 'today' ? '' : `<details class="card pad" ${active ? 'open' : ''}><summary style="cursor:pointer;font-weight:500">필터${active ? ' · 적용 중' : ''}</summary><div class="stack" style="margin-top:12px">
    <div><span class="cap">함께한 사람</span><div class="pick" style="margin-top:8px">${pp.friends.map(u => `<label><input type="checkbox" data-filter="people" value="${u.id}" ${f.people.includes(u.id) ? 'checked' : ''}><span>${esc(u.name)}</span></label>`).join('') || '<span class="cap">연결된 사람이 없어요</span>'}</div>
      ${f.people.length > 1 ? `<div class="seg" role="tablist" style="margin-top:8px"><button role="tab" aria-selected="${f.mode === 'and'}" data-act="mode" data-v="and">모두 함께한 추억</button><button role="tab" aria-selected="${f.mode === 'or'}" data-act="mode" data-v="or">누구든 함께한 추억</button></div>` : ''}</div>
    <label class="field"><span class="cap">그룹</span><select data-filter="group"><option value="">전체</option>${gg.groups.map(g => `<option value="${g.id}" ${+f.group === g.id ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select><small>그룹에 연결한 추억만 보여요. 그룹 멤버라는 이유만으로 함께한 사람으로 보지 않아요.</small></label>
    <label class="field"><span class="cap">연도</span><select data-filter="year"><option value="">전체</option>${Array.from({ length: 12 }, (_, i) => yr - i).map(y => `<option ${+f.year === y ? 'selected' : ''}>${y}</option>`).join('')}</select></label>
    ${active ? '<button class="btn sm line" data-act="clear-filter">필터 해제</button>' : ''}</div></details>`;
  const sumTxt = [f.people.length && pp.friends.filter(u => f.people.includes(u.id)).map(u => u.name).join(', '), f.group && gg.groups.find(g => g.id === +f.group)?.name, f.year && f.year + '년'].filter(Boolean).join(' · ');
  const chipsUi = tab !== 'today' && active ? `<div class="chips" aria-label="적용 중인 필터">${f.people.map(id => `<button class="chip on" data-act="rm-filter" data-k="people" data-v="${id}">${esc(pp.friends.find(u => u.id === id)?.name || '')} ${I('x', 's')}</button>`).join('')}${f.group ? `<button class="chip on" data-act="rm-filter" data-k="group">${esc(gg.groups.find(g => g.id === +f.group)?.name || '')} ${I('x', 's')}</button>` : ''}${f.year ? `<button class="chip on" data-act="rm-filter" data-k="year">${f.year}년 ${I('x', 's')}</button>` : ''}</div>` : '';
  const hint = f.people.length > 1 ? `<p class="cap">${f.mode === 'and' ? '선택한 사람이 모두 함께한 추억만 보여줘요.' : '선택한 사람 중 누구든 함께한 추억을 보여줘요.'}</p>` : '';
  let body = '';
  if (tab === 'list') {
    const { posts } = await api('GET', '/api/posts?' + qs);
    const byYear = {}; posts.forEach(p => (byYear[(p.occurred_on || '날짜 미상').slice(0, 4)] ||= []).push(p));
    body = posts.length ? `<p class="cap" style="margin:16px 0 12px">${active ? '조건에 맞는 추억 ' : '추억 '}${posts.length}개 · 최근 순</p><div class="feed">${posts.map(postCard).join('')}</div>` : (active ? empty('선택한 조건의 추억이 없어요', `선택한 조건: ${esc(sumTxt)}. 필터를 바꾸거나 해제해 보세요.`, '<button class="btn" data-act="clear-filter">필터 해제</button>') : empty('아직 남긴 추억이 없어요.', '함께했던 하루를 첫 번째 추억으로 남겨보세요.', '<a class="btn" href="#/new-post">첫 추억 만들기</a>'));
  } else if (tab === 'cal') {
    const { posts } = await api('GET', '/api/posts?' + qs);
    const cal = S.cal ||= { ym: (posts[0]?.occurred_on || localDate()).slice(0, 7), day: '' };
    const [Y, M] = cal.ym.split('-').map(Number), first = new Date(Y, M - 1, 1).getDay(), days = new Date(Y, M, 0).getDate(), by = {};
    posts.forEach(p => p.occurred_on && (by[p.occurred_on] ||= []).push(p));
    const inMonth = posts.filter(p => (p.occurred_on || '').startsWith(cal.ym)), list = cal.day ? by[cal.day] || [] : inMonth;
    const cells = Array.from({ length: first }, () => '<span></span>').concat(Array.from({ length: days }, (_, i) => { const d = `${cal.ym}-${String(i + 1).padStart(2, '0')}`, c = (by[d] || []).length; return `<button class="cal-d${cal.day === d ? ' on' : ''}" data-act="cal-day" data-v="${d}" aria-pressed="${cal.day === d}" aria-label="${M}월 ${i + 1}일${c ? ', 추억 ' + c + '개' : ''}"><span class="n">${i + 1}</span><i class="${c ? 'mk' : ''}"></i></button>`; }));
    body = `<div class="card cal"><div class="cal-h"><button class="icon-btn" data-act="cal-move" data-v="-1" aria-label="이전 달">${I('back')}</button><span><b>${Y}년 ${M}월</b><span class="cap">추억 ${inMonth.length}개</span></span><button class="icon-btn" data-act="cal-move" data-v="1" aria-label="다음 달">${I('chev')}</button></div><div class="cal-g">${['일', '월', '화', '수', '목', '금', '토'].map((w, i) => `<span class="w${i === 0 ? ' su' : ''}">${w}</span>`).join('')}${cells.join('')}</div></div>
      <h2 class="cal-t">${cal.day ? fmtDate(cal.day) : `${M}월의 추억`}</h2>${list.length ? `<div class="feed">${list.map(postCard).join('')}</div>` : '<p class="sub body2">이 날 남긴 추억이 없어요.</p>'}`;
  } else if (tab === 'map') {
    const m = await api('GET', '/api/map?' + qs);
    window._map = m;
    body = m.total ? `<p class="cap" style="margin-top:12px">내가 볼 수 있는 추억의 대표 사진을 장소별로 모았어요. 기록한 장소를 모은 것이라 실제 이동 경로와 다를 수 있어요. 목록 탭에서 같은 기록을 볼 수 있어요.</p>` + m.countries.map((c, ci) => `<section class="sec"><h2>${esc(c.country)} <span class="sub body2">· ${c.count}개의 추억</span></h2><div class="markers">${c.cities.map((city, i) => { const cv = city.items.find(x => x.cover)?.cover; return `<button class="marker" data-act="marker" data-c="${ci}" data-i="${i}" aria-pressed="false" aria-label="${esc(city.city)} 추억 ${city.count}개 보기"><span class="mk-ph">${cv ? `<img loading="lazy" src="/media/${cv}" alt="">` : KNOT}<b class="badge">${city.count}</b></span><span class="body2">${esc(city.city)}</span></button>`; }).join('')}</div></section>`).join('') + '<div id="preview" class="preview" hidden></div><a class="pill" href="#/memories?tab=list">' + I('list', 's') + ' 목록 보기</a>'
      : empty(active ? '선택한 조건의 추억이 없어요' : '아직 지도에 남긴 추억이 없어요', active ? `선택한 조건: ${esc(sumTxt)}. 필터를 바꾸거나 해제해 보세요.` : '추억을 만들 때 장소를 함께 남겨 보세요.', active ? '<button class="btn" data-act="clear-filter">필터 해제</button>' : '<a class="btn" href="#/new-post">새 추억 만들기</a>');
  } else {
    const t = await api('GET', '/api/today?date=' + localDate());
    body = !t.enabled ? `<div class="card pad stack" style="margin-top:12px"><h2>1년 전 오늘</h2><p class="sub body2">켜면 앱 안에서 오늘과 같은 날의 지난 추억을 보여줘요. 알림은 보내지 않아요. 숨기거나 다시 추천하지 않을 수 있고, 언제든 끌 수 있어요. 끈다고 기록이 삭제되지는 않아요.</p><button class="btn" data-act="mem" data-v="1">켜기</button></div>`
      : t.items.length ? `<section class="sec"><h2 style="margin-bottom:12px">그날의 우리가 여기 있어요.</h2><p class="cap" style="margin-bottom:12px">함께 남긴 사진과 이야기를 다시 살펴보세요.</p><div class="feed">${t.items.map(p => `<div>${postCard(p)}<div class="row" style="margin-top:8px;flex-wrap:wrap"><a class="btn sm sec2" href="#/post/${p.id}?add=1">${I('plus', 's')} 기억 더하기</a><button class="btn sm line" data-act="save" data-id="${p.id}">${p.saved ? '저장함' : '저장'}</button><button class="btn sm line" data-act="hide-post" data-id="${p.id}">다시 추천하지 않기</button></div></div>`).join('')}</div></section>`
        : empty('오늘과 연결된 추억이 없어요.', '기록은 그대로 안전하게 보관되어 있어요.');
  }
  return `<header class="top"><h1>추억</h1><a class="btn sm sec2 only-pc" href="#/new-post">${I('plus', 's')} 새 추억</a></header><div class="page" style="padding-top:8px"><div class="seg" role="tablist" aria-label="보기 방식">${[['list', '피드'], ['cal', '달력']].map(([k, l]) => `<button role="tab" aria-selected="${tab === k}" data-act="tab" data-v="${k}">${l}</button>`).join('')}</div><div class="stack" style="margin-top:12px">${chipsUi}${filterUi}${hint}</div>${body}</div>${tab === 'today' ? '' : `<a class="fab" href="#/new-post">${I('plus')} 새 추억</a>`}`;
};

const REGIONS = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'];
const regionOf = c => { const x = String(c || '').replace(/(특별자치시|특별자치도|특별시|광역시|도)$/, ''); return { 충청북: '충북', 충청남: '충남', 전라북: '전북', 전라남: '전남', 경상북: '경북', 경상남: '경남' }[x] || x.slice(0, 2); };
P.foot = async () => {
  const f = S.foot ||= { mode: 'all', people: [], region: '' };
  const pp = await api('GET', '/api/people'), withMode = f.mode === 'with';
  const m = await api('GET', '/api/map?' + new URLSearchParams({ people: withMode ? f.people.join(',') : '', mode: 'and' }));
  const by = {}; m.countries.forEach(c => c.cities.forEach(ct => { const k = regionOf(ct.city); (by[k] ||= { items: [] }).items.push(...ct.items); }));
  const n = REGIONS.filter(r => by[r]).length;
  const stamp = r => { const it = by[r]?.items[0]; return `<button class="stamp${by[r] ? ' on' : ''}" data-act="foot-region" data-v="${r}" aria-pressed="${f.region === r}" aria-label="${r}${by[r] ? ', 추억 ' + by[r].items.length + '개' : ', 아직 기록이 없어요'}"><span class="sp">${it?.cover ? `<img loading="lazy" src="/media/${it.cover}" alt="">` : esc(r[0])}</span><span class="cap">${by[r] ? r : ''}</span></button>`; };
  const sel = by[f.region]?.items || [];
  return `<header class="top"><h1>우리의 발자국</h1></header><div class="page stack" style="padding-top:8px">
    <p class="sub body2">${m.total ? `추억 ${m.total}개가 ${n}곳에 쌓였어요.` : '추억에 지역을 연결하면 발자국이 쌓여요.'}</p>
    <div class="seg" role="tablist" aria-label="발자국 종류">${[['all', '우리의 발자국'], ['with', '함께한 발자국']].map(([k, l]) => `<button role="tab" aria-selected="${f.mode === k}" data-act="foot-mode" data-v="${k}">${l}</button>`).join('')}</div>
    ${withMode ? `<div class="chips" aria-label="함께한 사람">${pp.friends.map(u => `<button class="chip${f.people.includes(u.id) ? ' on' : ''}" aria-pressed="${f.people.includes(u.id)}" data-act="foot-person" data-v="${u.id}">${esc(u.name)}</button>`).join('') || '<span class="cap">연결된 사람이 없어요</span>'}</div>` : ''}
    <div class="foot-stats"><div><span class="cap">기록된 지역</span><b>${n}<small> / 17곳</small></b></div><div><span class="cap">연결된 추억</span><b>${m.total}<small>개</small></b></div></div>
    <div class="stamps">${REGIONS.map(stamp).join('')}</div>
    ${f.region ? `<section class="stack" aria-label="${f.region}의 추억"><h2>${f.region}의 추억</h2>${sel.length ? sel.map(p => `<a class="mrow" href="#/post/${p.id}"><span class="th">${p.cover ? `<img loading="lazy" src="/media/${p.cover}" alt="">` : KNOT}</span><span><b>${esc(p.title)}</b><span class="cap">${fmtDate(p.occurred_on)}${p.label ? ' · ' + esc(p.label) : ''}</span></span>${I('chev', 's')}</a>`).join('') : '<p class="sub body2">아직 이 지역에 남긴 추억이 없어요.</p>'}</section>` : ''}
    <p class="cap">발자국은 추억을 볼 수 있는 사람에게만 보여요.</p></div>`;
};

P.meetups = async () => {
  const { meetups } = await api('GET', '/api/meetups'), now = new Date().toISOString();
  const up = meetups.filter(m => m.starts_at >= now && m.status === 'active').reverse(), past = meetups.filter(m => !(m.starts_at >= now && m.status === 'active'));
  return `${top('약속', { right: `<a class="btn sm" href="#/new-meetup">${I('plus', 's')} 새 약속</a>` })}<div class="page">
    <section><h2 style="margin-bottom:12px">다가오는 약속</h2>${up.length ? `<div class="stack" style="gap:12px">${up.map(planCard).join('')}</div>` : empty('예정된 약속이 없어요', '함께할 사람을 초대해 약속을 잡아 보세요.', '<a class="btn" href="#/new-meetup">새 약속 만들기</a>')}</section>
    ${past.length ? `<section class="sec"><h2 style="margin-bottom:12px">지난 약속</h2><div class="stack" style="gap:12px">${past.map(planCard).join('')}</div></section>` : ''}</div>`;
};

P.newMeetup = async () => {
  const [pp, gg] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/groups')]); window._groups = gg.groups;
  if (!pp.friends.length) return `${top('새 약속')}${empty('함께할 사람을 먼저 연결해 주세요', '연결된 사람을 약속에 초대할 수 있어요.', '<a class="btn" href="#/people">사람 연결하기</a>')}`;
  return `${top('새 약속 만들기')}<form class="page stack" data-form="newmeetup">
    <label class="field"><span>약속 이름</span><input type="text" name="title" maxlength="40" required></label>
    <label class="field"><span>일시</span><input type="datetime-local" name="when" required><small>${esc(localTz)} 기준으로 저장하고, 보는 사람의 시간대에 맞춰 보여줘요.</small></label>
    <label class="field"><span>장소 (선택)</span><input type="text" name="place" maxlength="60"></label>
    <label class="field"><span>설명 (선택)</span><textarea name="descr" maxlength="500"></textarea></label>
    <div class="field"><span>누구를 초대할까요?</span>${pick(pp.friends, 'm')}
      ${gg.groups.length ? `<label class="field" style="margin-top:12px"><span class="cap">그룹으로 빠르게 고르기 (선택)</span><select name="group" data-fillgroup><option value="">그룹 없이 사람만 고를게요</option>${gg.groups.map(g => `<option value="${g.id}">${esc(g.name)}</option>`).join('')}</select><small>초대 시점의 그룹 멤버만 초대돼요. 이후 멤버가 바뀌어도 초대는 바뀌지 않아요.</small></label>` : ''}</div>
    <p class="err" role="alert"></p><button class="btn block">약속 만들기</button></form>`;
};

const RS = { yes: I('check', 's') + ' 참석', no: I('x', 's') + ' 불참', maybe: I('help', 's') + ' 미정', invited: I('clock', 's') + ' 응답 대기' };
P.meetup = async id => {
  const m = await api('GET', '/api/meetups/' + id), isOrg = m.organizer_id === S.me.id, started = Date.parse(m.starts_at) <= Date.now(), cancelled = m.status === 'cancelled';
  window._m = m;
  const rs = m.mine.rsvp;
  return `${top('약속', { right: isOrg && !cancelled ? `<button class="icon-btn" data-act="meetup-menu" aria-label="더 보기">${I('more')}</button>` : '' })}<div class="page stack" style="padding-top:8px">
    <div><h1${cancelled ? ' style="text-decoration:line-through"' : ''}>${esc(m.title)}</h1>${cancelled ? '<span class="tag warn">취소된 약속</span>' : ''}<p class="sub body2">${I('clock', 's')} ${fmtDT(m.starts_at, m.tz)}<br>${I('pin', 's')} ${m.place ? esc(m.place) : '장소 미정'}<br>주최 ${esc(m.organizer)}</p>${m.descr ? `<p style="margin-top:8px;white-space:pre-wrap">${esc(m.descr)}</p>` : ''}</div>
    ${m.changed && !cancelled ? `<div class="note">${esc(m.changed)}</div>` : ''}
    ${isOrg && started && !cancelled ? `<div class="note stack"><span>약속이 끝났어요. 실제로 함께한 사람을 확인하면 추억을 만들 때 바로 고를 수 있어요.</span><button class="btn" data-act="att-open">실제 함께한 사람 확인하기</button></div>` : ''}
    ${!cancelled && !isOrg && !started ? `<section><h3 style="margin-bottom:12px">참석할 수 있나요?</h3>${rs === 'invited' ? '<p class="cap" style="margin-bottom:12px">일정이 새로 정해졌거나 바뀌었어요. 다시 응답해 주세요.</p>' : ''}<div class="rsvp">${[['yes', '참석'], ['maybe', '미정'], ['no', '불참']].map(([k, l]) => `<button data-act="rsvp" data-v="${k}" aria-pressed="${rs === k}">${l}</button>`).join('')}</div></section>` : ''}
    <section><h2 style="margin-bottom:12px">함께하는 사람 ${m.participants.length}명</h2><div class="card list">${m.participants.map(p => `<div>${av(p.name)}<span class="grow">${esc(p.name)}${p.id === m.organizer_id ? ' <span class="tag">주최</span>' : ''}</span>${started ? `<span class="tag">${p.attended ? '실제 참석 확인' : '참석 미확인'}</span>` : ''}<span class="body2">${RS[p.rsvp]}</span></div>`).join('')}</div><p class="cap" style="margin-top:8px">응답은 약속이고, 실제 참석은 약속 뒤에 주최자가 확인해요.</p></section>
    ${cancelled || (!m.posts.length && !started) ? '' : `<section><h2 style="margin-bottom:12px">${m.posts.length ? '함께한 추억' : '이 약속의 추억'}</h2>${m.posts.length ? `<div class="feed">${m.posts.map(postCard).join('')}</div><a class="btn block" style="margin-top:12px" href="#/post/${m.posts[0].id}">함께한 추억 보기</a>` : `<p class="sub body2" style="margin-bottom:12px">아직 남긴 추억이 없어요.</p><button class="btn block" data-act="meetup-post">${I('photo', 's')} 이 약속을 추억으로 남기기</button>`}<p class="cap" style="margin-top:8px">추억은 직접 고른 사람에게만 초대가 가요. 약속에 초대된 것만으로 볼 수 있지 않아요.</p></section>`}
    <section><div class="row between" style="margin-bottom:12px"><h2>정산</h2>${cancelled ? '' : `<button class="btn sm sec2" data-act="settle-new">${I('plus', 's')} 정산 만들기</button>`}</div>
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
    <div class="card pad stack"><div class="row between"><b>초대 링크로 연결하기</b><button class="btn sm sec2" data-act="link-new">${I('link', 's')} 링크 만들기</button></div><ol class="steps"><li>링크를 만들어 연결하고 싶은 사람에게 보내요</li><li>받은 사람이 로그인한 뒤 연결을 확인해요</li><li>연결되면 함께 추억을 만들 수 있어요</li></ol><p class="cap">링크는 한 번만 쓸 수 있고 7일 뒤 만료돼요. 연결만으로 서로의 추억을 볼 수는 없어요.</p>
      ${d.links.map(l => { const u = `${location.origin}/#/join/${l.code}`, days = Math.max(1, Math.ceil((Date.parse(l.expires_at) - Date.now()) / 864e5)); return `<div class="codecard"><span class="cap">내 초대 링크 · ${days}일 뒤 만료 · 1회용</span><code>${esc(u)}</code><div class="row"><button class="btn grow" data-act="share" data-v="${esc(u)}">${I('link', 's')} 공유하기</button><button class="btn line" data-act="copy" data-v="${esc(u)}">복사</button><button class="btn dline" data-act="link-del" data-id="${esc(l.code)}">회수</button></div></div>`; }).join('')}</div>
    ${d.incoming.length ? `<section><h2 style="margin-bottom:12px">받은 요청</h2><div class="card list">${d.incoming.map(u => `<div>${av(u.name)}<span class="grow"><b>${esc(u.name)}</b><br><span class="cap">@${esc(u.username)}</span></span><button class="btn sm" data-act="accept-friend" data-id="${u.id}">수락</button><button class="btn sm line" data-act="decline-friend" data-id="${u.id}">거절</button></div>`).join('')}</div></section>` : ''}
    <section><h2 style="margin-bottom:12px">연결된 사람 ${d.friends.length}명</h2>${d.friends.length ? `<div class="card list">${d.friends.map(u => `<div>${av(u.name)}<span class="grow"><b>${esc(u.name)}</b><br><span class="cap">@${esc(u.username)}</span></span><button class="icon-btn" data-act="friend-menu" data-id="${u.id}" data-name="${esc(u.name)}" aria-label="${esc(u.name)} 관리">${I('more')}</button></div>`).join('')}</div>` : '<p class="sub body2">아직 연결된 사람이 없어요.</p>'}</section>
    ${d.outgoing.length ? `<section><h2 style="margin-bottom:12px">보낸 요청</h2><div class="card list">${d.outgoing.map(u => `<div>${av(u.name)}<span class="grow">${esc(u.name)}</span><button class="btn sm line" data-act="decline-friend" data-id="${u.id}">취소</button></div>`).join('')}</div></section>` : ''}</div>`;
};

P.groups = async () => {
  const { groups } = await api('GET', '/api/groups');
  return `${top('그룹', { right: '<button class="btn sm" data-act="group-new">새 그룹</button>' })}<div class="page stack"><p class="cap">그룹은 사람을 빠르게 고르기 위한 묶음이에요. 그룹이 있어도 추억은 직접 초대한 사람만 볼 수 있어요.</p>
    ${groups.length ? groups.map(g => `<div class="card pad stack"><div class="row between"><b>${esc(g.name)}</b>${g.type_hint ? `<span class="tag">${{ friend: '친구', family: '가족', couple: '연인' }[g.type_hint]}</span>` : ''}</div><div class="row" style="flex-wrap:wrap;gap:8px">${g.members.map(m => `<span class="chip" style="cursor:default">${esc(m.name)}${g.owner_id === S.me.id && m.id !== S.me.id ? ` <button class="icon-btn" style="width:24px;height:24px" data-act="group-kick" data-g="${g.id}" data-u="${m.id}" aria-label="${esc(m.name)} 내보내기">${I('x', 's')}</button>` : ''}</span>`).join('')}</div>
      <div class="row">${g.owner_id === S.me.id ? `<button class="btn sm sec2" data-act="group-add" data-g="${g.id}">사람 추가</button><button class="btn sm dline" data-act="group-del" data-g="${g.id}" data-name="${esc(g.name)}">그룹 삭제</button>` : `<button class="btn sm dline" data-act="group-leave" data-g="${g.id}">그룹 나가기</button>`}</div></div>`).join('') : empty('아직 그룹이 없어요', '자주 함께하는 사람들을 그룹으로 묶어 두면 빠르게 고를 수 있어요. 그룹 없이도 모든 기능을 쓸 수 있어요.')}</div>`;
};
P.blocks = async () => { const { blocks } = await api('GET', '/api/blocks'); return `${top('차단한 사람')}<div class="page stack"><p class="sub body2">차단하면 서로 새 초대·댓글·알림이 중단되고 연결이 해제돼요. 상대에게 알리지 않아요.</p>${blocks.length ? `<div class="card list">${blocks.map(u => `<div>${av(u.name)}<span class="grow">${esc(u.name)}</span><button class="btn sm line" data-act="unblock" data-id="${u.id}">차단 해제</button></div>`).join('')}</div>` : empty('차단한 사람이 없어요', '')}</div>`; };
P.hidden = async () => { const h = await api('GET', '/api/hides'); const none = !h.posts.length && !h.users.length; return `${top('숨긴 추억')}<div class="page stack"><p class="sub body2">숨긴 추억은 목록과 지도, 오늘의 추억에 나타나지 않아요. 설정에서 언제든 바꿀 수 있어요.</p>${none ? empty('숨긴 추억이 없어요', '') : `<div class="card list">${h.posts.map(p => `<div><span class="grow">${esc(p.title)}</span><button class="btn sm line" data-act="unhide" data-t="post" data-id="${p.id}">다시 보기</button></div>`).join('')}${h.users.map(u => `<div><span class="grow">${esc(u.name)}님과의 추억 추천 안 함</span><button class="btn sm line" data-act="unhide" data-t="user" data-id="${u.id}">되돌리기</button></div>`).join('')}</div>`}</div>`; };
const CAT = { privacy: '동의 없는 사진/사생활 침해', harass: '괴롭힘·스토킹·위협', sexual_minor: '성적 콘텐츠·미성년자 안전', impersonation: '사칭·계정 도용', illegal: '불법·유해 콘텐츠', rights: '저작권/초상권 등 권리 침해', spam: '스팸·사기', other: '기타' };
const ST = { RECEIVED: '접수됨', TRIAGED: '분류됨', UNDER_REVIEW: '검토 중', ACTIONED: '조치됨', NO_ACTION: '조치 없음', APPEALED: '이의제기', FINAL: '종료' };
P.reports = async () => { const { reports } = await api('GET', '/api/reports'); return `${top('내 신고 내역')}<div class="page">${reports.length ? `<div class="card list">${reports.map(r => `<div><span class="grow"><b>${CAT[r.category]}</b><br><span class="cap">${r.created_at.slice(0, 10)} · ${{ post: '추억', note: '글', media: '사진', user: '사용자' }[r.target_type]}</span></span><span class="tag">${ST[r.status]}</span></div>`).join('')}</div><p class="cap" style="margin-top:8px">신고자의 신원은 상대에게 공개되지 않아요.</p>` : empty('신고한 내역이 없어요', '')}</div>`; };

P.me = async () => {
  const u = S.me;
  const row = (h, i, t, s = '') => `<a href="${h}">${I(i)}<span class="grow">${t}${s ? `<br><span class="cap">${s}</span>` : ''}</span>${I('chev', 's')}</a>`;
  return `<header class="top"><h1>나</h1></header><div class="page stack"><div class="card pad row">${av(u.name)}<span class="grow"><b>${esc(u.name)}</b><br><span class="cap">@${esc(u.username)}</span></span><button class="btn sm line" data-act="rename">닉네임 변경하기</button></div>
    <div class="card list">${row('#/people', 'users', '사람', '연결·초대 링크')}${row('#/groups', 'star', '그룹')}</div>
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
const routes = [[/^\/(terms|privacy-policy|help)$/, async () => docPage(location.hash.slice(1).split('?')[0]), 'me'], [/^\/$/, P.home, 'home'], [/^\/meetups$/, P.meetups, 'meetups'], [/^\/memories$/, P.memories, 'memories'], [/^\/foot$/, P.foot, 'foot'], [/^\/me$/, P.me, 'me'], [/^\/post\/(\d+)$/, P.post, 'home'], [/^\/new-post$/, P.newPost, 'home'], [/^\/new-meetup$/, P.newMeetup, 'meetups'], [/^\/meetup\/(\d+)$/, P.meetup, 'meetups'], [/^\/people$/, P.people, 'me'], [/^\/groups$/, P.groups, 'me'], [/^\/blocks$/, P.blocks, 'me'], [/^\/hidden$/, P.hidden, 'me'], [/^\/reports$/, P.reports, 'me'], [/^\/join\/([\w-]+)$/, P.join, 'me'], [/^\/saved$/, P.saved, 'me'], [/^\/privacy$/, P.privacy, 'me']];
let seq = 0;
async function route() {
  const my = ++seq, view = $('#view');
  if (!S.me) { try { S.me = await api('GET', '/api/me'); } catch { } }
  const [path, qs] = (location.hash.slice(1) || '/').split('?'); S.q = Object.fromEntries(new URLSearchParams(qs || ''));
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
  if (S.join) { const j = S.join; S.join = null; S.joinFrom = undefined; try { sessionStorage.removeItem('ws_join'); } catch { } if (path !== j) return go(j); }
  const r = routes.find(x => x[0].test(path)) || routes[0], args = r[0].exec(path).slice(1);
  const tabs = $('#tabs'); tabs.hidden = false;
  const T = [['home', '홈', 'home', '#/'], ['memories', '추억', 'photo', '#/memories'], ['new', '만들기', 'plus'], ['foot', '발자국', 'pin', '#/foot'], ['me', '나', 'user', '#/me']];
  $('#app').classList.add('authed');
  tabs.innerHTML = '<div class="brand"><img src="/logo.svg" alt=""><span class="wordmark">우리사이</span></div>' + T.map(([k, l, i, h]) => k === 'new' ? `<button data-act="create" data-k="new" aria-label="만들기"><span class="mk">${I('plus')}</span>${l}</button>` : `<a href="${h}" data-k="${k}" ${r[2] === k ? 'aria-current="page"' : ''}><span class="nv-ic">${I(i)}</span>${l}</a>`).join('') + '<div class="side-label l1">둘러보기</div><div class="side-label l2">함께하기</div><div class="side-label l3">내 공간</div>' + `<a class="side-user" href="#/me" data-k="user">${av(S.me.name, 's')}<span><b>${esc(S.me.name)}</b><span class="cap">@${esc(S.me.username)}</span></span></a>`;
  let html; try { html = await r[1](...args); } catch (e) { if (e.status === 401) { S.me = null; return route(); } html = gone(e); }
  if (my !== seq) return;
  view.innerHTML = html; document.querySelectorAll('form[data-form]').forEach(f => f.noValidate = true); if (S.q.add) $('#story-ta')?.focus(); updSel(); updCounters(); initSignup(); if (!/^\/post\//.test(path) || true) { window.scrollTo(0, 0); }
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
  'del-note': async d => { if (await ask({ title: '내 글을 삭제할까요?', body: '삭제하면 모두에게서 사라지고 되돌릴 수 없어요.', ok: '삭제하기', danger: true })) act(() => api('DELETE', `/api/notes/${d.id}`), '삭제했어요.'); },
  report: d => REPORT_UI(d.t, d.id),
  photo: d => {
    const b = sheet(`<div class="lb"><img src="/media/${d.id}" alt="함께 남긴 사진"></div><div class="actions"><button class="btn sec2" data-a="cover">대표 사진으로 정하기</button>${d.mine === '1' ? '<button class="btn dline" data-a="del">내 사진 삭제하기</button>' : '<button class="btn line" data-a="rep">신고하기</button>'}<button class="btn line" data-a="x">닫기</button></div>`);
    b.addEventListener('click', async e => {
      const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return;
      closeSheet(); const pid = $('[data-post]')?.dataset.post;
      if (a === 'cover') act(() => api('POST', `/api/posts/${pid}/cover`, { media_id: +d.id }), '대표 사진을 바꿨어요.');
      if (a === 'rep') REPORT_UI('media', d.id);
      if (a === 'del' && await ask({ title: '사진을 삭제할까요?', body: '내가 올린 사진이 이 추억과 지도, 회상에서 모두 사라져요. 되돌릴 수 없어요.', ok: '삭제하기', danger: true })) act(() => api('DELETE', `/api/media/${d.id}`), '사진을 삭제했어요.');
    });
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
  'add-more': () => { const b = sheet(`<h2>무엇을 더할까요?</h2><div class="menu" style="margin-top:8px"><button data-a="photo">${I('photo')}<span><b>사진 고르기</b><br><span class="cap">여러 장을 한 번에 올릴 수 있어요</span></span></button><button data-a="text">${I('star')}<span><b>기억 쓰기</b><br><span class="cap">내가 기억하는 그날을 남겨요</span></span></button></div>`); b.addEventListener('click', e => { const a = e.target.closest('[data-a]')?.dataset.a; if (!a) return; closeSheet(); if (a === 'photo') $('#pf')?.click(); else { const t = $('#story-ta'); t?.scrollIntoView({ block: 'center' }); t?.focus(); } }); },
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
  'clear-filter': () => { S.filter = { people: [], mode: 'and', group: '', year: '' }; route(); },
  tab: d => go('/memories?tab=' + d.v),
  'cal-move': d => { const [y, m] = S.cal.ym.split('-').map(Number), x = new Date(y, m - 1 + +d.v, 1); S.cal = { ym: `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`, day: '' }; route(); },
  'cal-day': d => { S.cal.day = S.cal.day === d.v ? '' : d.v; route(); },
  'foot-mode': d => { S.foot.mode = d.v; route(); },
  'foot-person': d => { const id = +d.v, p = S.foot.people; S.foot.people = p.includes(id) ? p.filter(x => x !== id) : [...p, id]; route(); },
  'foot-region': d => { S.foot.region = S.foot.region === d.v ? '' : d.v; route(); },
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
      if (a === 'edit') sheet(`<h2>일정 수정하기</h2><form data-form="meetup-edit" class="stack" style="margin-top:12px"><label class="field"><span>약속 이름</span><input type="text" name="title" maxlength="40" required value="${esc(m.title)}"></label><label class="field"><span>일시</span><input type="datetime-local" name="when" required value="${new Date(m.starts_at).toLocaleString('sv').slice(0, 16).replace(' ', 'T')}"></label><label class="field"><span>장소</span><input type="text" name="place" maxlength="60" value="${esc(m.place || '')}"></label><p class="cap">일시나 장소를 바꾸면 참석자들에게 다시 응답을 요청해요.</p><p class="err" role="alert"></p><button class="btn">저장하기</button></form>`);
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
  'group-new': async () => { const pp = await api('GET', '/api/people'); sheet(`<h2>새 그룹</h2><form data-form="group" class="stack" style="margin-top:12px"><label class="field"><span>그룹 이름</span><input type="text" name="name" maxlength="20" required></label><label class="field"><span>관계 (선택)</span><select name="hint"><option value="">선택 안 함</option><option value="friend">친구</option><option value="family">가족</option><option value="couple">연인</option></select><small>이름표일 뿐, 볼 수 있는 사람을 바꾸지 않아요.</small></label><div class="field"><span>사람 선택</span>${pick(pp.friends, 'm')}</div><p class="err" role="alert"></p><button class="btn">그룹 만들기</button></form>`); },
  'group-add': async d => { const [pp, gg] = await Promise.all([api('GET', '/api/people'), api('GET', '/api/groups')]); const cur = gg.groups.find(g => g.id === +d.g).members.map(m => m.id); sheet(`<h2>사람 추가</h2><form data-form="group-add" data-g="${d.g}" class="stack" style="margin-top:12px">${pick(pp.friends.filter(f => !cur.includes(f.id)), 'm')}<p class="err" role="alert"></p><button class="btn">추가하기</button></form>`); },
  'group-kick': d => act(() => api('DELETE', `/api/groups/${d.g}/members/${d.u}`)),
  'group-leave': async d => { if (await ask({ title: '그룹에서 나갈까요?', body: '이미 함께한 추억에는 영향이 없어요.', ok: '나가기', danger: true })) act(() => api('DELETE', `/api/groups/${d.g}/members/${S.me.id}`)); },
  'group-del': async d => { if (await ask({ title: `‘${d.name}’ 그룹을 삭제할까요?`, body: '그룹만 사라지고, 연결된 추억과 약속은 삭제되지 않아요.', ok: '그룹 삭제', danger: true })) act(() => api('DELETE', `/api/groups/${d.g}`), '그룹을 삭제했어요.'); },
  rename: () => sheet(`<h2>닉네임 변경하기</h2><form data-form="rename" class="stack" style="margin-top:12px" novalidate>${nickField('rn-nick', '닉네임', S.me.name)}<p class="err" role="alert"></p><button class="btn">변경사항 저장하기</button></form>`),
  export: () => { const a = document.createElement('a'); a.href = '/api/me/export'; a.download = 'woorisai-my-data.json'; a.click(); },
  logout: () => act(async () => { await api('POST', '/api/logout'); S.me = null; S.authMode = 'intro'; }, '우리사이에서 로그아웃했어요. 카카오·네이버·Google 계정에서는 로그아웃되지 않았어요.'),
  'delete-account': () => sheet(`<h2>계정을 삭제할까요?</h2><p class="sub body2">계정을 삭제하면 일부 추억에 다시 접근할 수 없어요. 삭제하면 로그인할 수 없고 연결·그룹·내 약속이 정리돼요. 함께 만든 추억에 남긴 사진과 글은 이름이 ‘탈퇴한 사용자’로 바뀐 채 남아요. 함께 지우려면 아래를 선택해 주세요. <b>되돌릴 수 없어요.</b></p><form data-form="delete-account" class="stack" style="margin-top:12px"><label class="row"><input type="checkbox" name="dc" style="width:20px;height:20px"><span class="body2">내가 올린 사진과 글도 모두 삭제</span></label>${S.me.has_password ? '<label class="field"><span>비밀번호 확인</span><input type="password" name="password" required autocomplete="current-password"></label>' : `<label class="field"><span>탈퇴 확인: 내 이름을 입력해 주세요</span><input type="text" name="password" required autocomplete="off" placeholder="${esc(S.me.username)}"></label>`}<p class="err" role="alert"></p><button class="btn danger">계정 삭제하기</button></form>`),
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
const placeOf = fd => fd.get('pcity') || fd.get('pcountry') || fd.get('pname') ? { name: fd.get('pname'), area: fd.get('parea'), city: fd.get('pcity'), country: fd.get('pcountry'), precision: fd.get('pprec') } : null;

// ---------- 폼 ----------
const F = {
  async login(fd) { S.me = await api('POST', '/api/login', { username: fd.get('username'), password: fd.get('password') }); },
  async signup(fd) { const r = validateNickname(fd.get('nickname')); if (!r.ok) throw new Error(r.message); S.me = await api('POST', '/api/signup', { username: fd.get('username'), nickname: r.value, password: fd.get('password'), consents: { terms: fd.get('c_terms') === 'on', privacy: fd.get('c_privacy') === 'on', marketing: fd.get('c_marketing') === 'on' } }); try { sessionStorage.removeItem('ws_nick'); } catch { } },
  async note(fd, f) { await api('POST', `/api/posts/${f.dataset.id}/notes`, { kind: f.dataset.kind, text: fd.get('text') }); },
  async request(fd) { await api('POST', '/api/people/request', { username: fd.get('username') }); toast('연결 요청을 보냈어요. 상대가 수락하면 연결돼요.'); },
  async rename(fd) { const r = validateNickname(fd.get('nickname')); if (!r.ok) throw new Error(r.message); S.me = await api('PATCH', '/api/me', { nickname: r.value }); closeSheet(); toast('닉네임을 바꿨어요.'); },
  async 'oauth-consent'(fd) { S.oauthConsents = { terms: true, privacy: true, marketing: fd.get('c_marketing') === 'on' }; S.oauthStep = 'profile'; },
  async 'oauth-signup'(fd) { const r = validateNickname(fd.get('nickname')); if (!r.ok) throw new Error(r.message); S.me = await api('POST', '/api/signup/oauth', { token: S.q.t, nickname: r.value, username: fd.get('username'), consents: S.oauthConsents }); S.oauthStep = null; history.replaceState(null, '', '#/'); },
  async 'delete-account'(fd) { await api('DELETE', '/api/me', { password: fd.get('password'), deleteContent: fd.get('dc') === 'on' }); S.me = null; S.authMode = 'intro'; closeSheet(); toast('탈퇴가 완료됐어요.'); },
  async group(fd) { const r = await api('POST', '/api/groups', { name: fd.get('name'), type_hint: fd.get('hint'), member_ids: fd.getAll('m').map(Number) }); closeSheet(); if (r.duplicateOf) toast(`같은 사람으로 만든 ‘${r.duplicateOf}’ 그룹이 이미 있어요.`, 4000); },
  async 'group-add'(fd, f) { await api('POST', `/api/groups/${f.dataset.g}/members`, { user_ids: fd.getAll('m').map(Number) }); closeSheet(); },
  async report(fd, f) { await api('POST', '/api/reports', { target_type: f.dataset.t, target_id: +f.dataset.id, category: fd.get('category'), detail: fd.get('detail'), hide: fd.get('hide') === 'on' }); closeSheet(); toast('신고가 접수됐어요. 처리 상태는 ‘나 › 내 신고 내역’에서 확인할 수 있어요.', 4500); },
  async 'post-invite'(fd, f) { await api('POST', `/api/posts/${f.dataset.id}/invite`, { user_ids: fd.getAll('m').map(Number) }); closeSheet(); toast('초대를 보냈어요.'); },
  async 'post-edit'(fd, f) { await api('PATCH', `/api/posts/${f.dataset.id}`, { title: fd.get('title'), occurred_on: fd.get('date'), place: placeOf(fd) }); closeSheet(); },
  async newmeetup(fd) { const r = await api('POST', '/api/meetups', { title: fd.get('title'), starts_at: new Date(fd.get('when')).toISOString(), tz: localTz, place: fd.get('place'), descr: fd.get('descr'), user_ids: fd.getAll('m').map(Number), group_id: fd.get('group') || null }); location.hash = '#/meetup/' + r.id; return 'noroute'; },
  async 'meetup-edit'(fd) { const r = await api('PATCH', `/api/meetups/${window._m.id}`, { title: fd.get('title'), starts_at: new Date(fd.get('when')).toISOString(), tz: localTz, place: fd.get('place') }); closeSheet(); if (r.reconfirm) toast('참석자들에게 다시 응답을 요청했어요.'); },
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
    const ok = await ask({ title: `볼 수 있는 사람 ${names.length + 1}명`, body: `<b>나, ${esc(names.join(', '))}</b><br>이 추억에 초대된 사람만 볼 수 있어요. 초대받은 사람이 수락하면 사진과 글을 함께 남길 수 있어요.`, ok: '추억 만들기' });
    if (!ok) return 'noroute';
    const g = fd.get('group'), r = await api('POST', '/api/posts', { title: fd.get('title'), occurred_on: fd.get('date'), member_ids: fd.getAll('m').map(Number), group_id: g || null, meetup_id: f.dataset.meetup || null, place: placeOf(fd), text: fd.get('text') });
    const files = [...f.photos.files]; if (files.length) await upload(r.id, files);
    try { localStorage.removeItem('ws_draft'); } catch { }
    location.hash = '#/post/' + r.id; return 'noroute';
  },
  async privacy(fd) { await api('POST', '/api/privacy', { kind: fd.get('kind'), detail: fd.get('detail') }); toast('요청이 접수됐어요.'); },
};

// 새 추억: 선택한 사람 고정 표시 + 초안 자동 저장 (제목·날짜·사람·글만, 사진은 저장하지 않음)
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
const whenOk = v => !v ? '일시를 선택해 주세요.' : isNaN(new Date(v)) ? '일시가 올바르지 않아요.' : null;
const pickOk = m => fd => [['m', fd.getAll('m').length ? null : m]];
const VALID = {
  login: fd => [['username', need(fd.get('username'), '이름을 입력해 주세요.')], ['password', need(fd.get('password'), '비밀번호를 입력해 주세요.')]],
  request: fd => { const v = String(fd.get('username') || '').trim().replace(/^@/, ''); return [['username', !v ? '연결할 이름을 입력해 주세요.' : !/^[a-z0-9_]{3,20}$/i.test(v) ? '이름은 영문, 숫자, _ 로 3–20자예요.' : null]]; },
  note: fd => [['text', need(fd.get('text'), '내용을 입력해 주세요.')]],
  newpost: fd => [['title', need(fd.get('title'), '추억 제목을 입력해 주세요.')], ['m', fd.getAll('m').length ? null : '함께한 사람을 한 명 이상 선택해 주세요.'], ['date', pastOk(fd.get('date'))], ['pcity', (fd.get('pname') || fd.get('parea')) && !fd.get('pcity') && !fd.get('pcountry') ? '도시나 국가를 입력해 주세요.' : null]],
  newmeetup: fd => [['title', need(fd.get('title'), '약속 이름을 입력해 주세요.')], ['when', whenOk(fd.get('when'))]],
  'meetup-edit': fd => [['title', need(fd.get('title'), '약속 이름을 입력해 주세요.')], ['when', whenOk(fd.get('when'))]],
  'post-edit': fd => [['title', need(fd.get('title'), '추억 제목을 입력해 주세요.')], ['date', pastOk(fd.get('date'))]],
  group: fd => [['name', need(fd.get('name'), '그룹 이름을 입력해 주세요.')]],
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
document.addEventListener('change', e => {
  const t = e.target;
  if (t.closest('[data-form=newpost]')) { updSel(); saveDraft(t.closest('form')); }
  if (t.matches('[data-upload]')) { const files = [...t.files]; t.value = ''; upload(+t.dataset.upload, files).then(() => route()); }
  else if (t.matches('[data-filter=people]')) { const id = +t.value; S.filter.people = t.checked ? [...S.filter.people, id] : S.filter.people.filter(x => x !== id); route(); }
  else if (t.matches('[data-filter]')) { S.filter[t.dataset.filter] = t.value; route(); }
  else if (t.matches('[data-fillgroup]')) { const g = (window._groups || []).find(x => x.id === +t.value); if (g) g.members.forEach(m => { const i = t.form.querySelector(`input[name=m][value="${m.id}"]`); if (i) i.checked = true; }); updSel(); saveDraft(t.form); }
  else if (t.matches('[data-method]')) t.form.querySelectorAll('.custom').forEach(i => i.style.display = t.value === 'custom' ? '' : 'none');
});

window.addEventListener('pageshow', e => { if (e.persisted) { S.snsBusy = false; route(); } });
route();
