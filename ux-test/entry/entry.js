/* 테스트 진입 영역: 스플래시 → 온보딩 → (처음부터 사용해 보기: 가입/로그인) | (주요 기능 체험하기: 가이드) → 테스트 빌드 화면(/app.html).
 * 상태는 이 브라우저 탭의 sessionStorage 에만 있고, 비밀번호는 저장하지도 확인하지도 않는다. */
import { track, askConsent } from '/ux-test/analytics.js';

const $ = (s, r = document) => r.querySelector(s);
const root = $('#root');
const ss = { get: k => { try { return sessionStorage.getItem(k); } catch { return null; } }, set: (k, v) => { try { sessionStorage.setItem(k, v); } catch { } }, del: k => { try { sessionStorage.removeItem(k); } catch { } } };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const LI = (n, size = 24, sw = 1.75) => `<lucide-icon name="${n}" size="${size}" stroke-width="${sw}"></lucide-icon>`;

// ── 시나리오(안내형 체험). 단계는 화면에서 실제로 일어난 동작(wsux_ev)으로 체크된다.
const SC = [
  { n: 1, title: '친구와 함께 기록하기', icon: 'users-round', desc: '초대한 친구가 수락하면 한 추억에 각자의 사진과 이야기가 모여요.', steps: [
    ['제주 추억을 열어 보세요', 'memory_view'], ['사진을 눌러 크게 보고 좌우로 넘겨 보세요. 참여자별 갤러리도 있어요', 'photo_view'],
    ['참여자 영역에서 초대 링크를 복사해 친구를 초대해 보세요', 'invite_start'], ['잠시 뒤 친구가 수락하고 사진과 이야기를 더해요(데모)', 'invite_complete'], ['내 사진과 이야기를 더해 보세요', 'contrib_add']] },
  { n: 2, title: '함께할 약속 만들기', icon: 'calendar-days', desc: '약속을 만들고, 지난 약속은 추억으로 이어 남겨요.', steps: [
    ['다가오는 약속을 열어 참석 현황을 확인해 보세요', 'plan_view'], ['새 약속을 만들고 날짜·장소·초대할 친구를 정해 보세요', 'plan_create'],
    ['초대받은 약속에서 내 참석 여부를 답해 보세요', 'plan_rsvp'], ['지난 약속을 추억으로 남겨 보세요(‘망원 보드게임 카페’)', 'plan_to_memory'],
    ['추억을 저장하면 약속과 추억이 연결돼요', 'plan_memory_saved'], ['약속에서 ‘함께한 추억 보기’로 연결을 확인해 보세요', 'plan_memory_view']] },
  { n: 3, title: '쌓인 추억 다시 발견하기', icon: 'map-pinned', desc: '달력과 발자국으로 지난 추억을 다시 만나요.', steps: [
    ['추억 탭에서 달력으로 바꿔 날짜별 추억을 둘러보세요', 'cal_view'], ['발자국 탭에서 지역별 스탬프를 확인해 보세요', 'foot_view'],
    ['스탬프를 눌러 그 지역의 추억을 보세요', 'region_view'], ['지난 추억을 열어 다시 보세요', 'memory_view']] }
];
const done = n => { try { return JSON.parse(ss.get('wsux_ev:' + n) || '{}'); } catch { return {}; } };
const prog = n => { const d = done(n), t = SC[n - 1].steps; return [t.filter(s => d[s[1]]).length, t.length]; };

const cfg = () => { try { return JSON.parse(ss.get('wsux_cfg') || '{}'); } catch { return {}; } };
const setCfg = o => ss.set('wsux_cfg', JSON.stringify(o));
const account = () => { try { return JSON.parse(ss.get('wsux_account') || 'null'); } catch { return null; } };
const clearKeys = pre => { try { Object.keys(sessionStorage).filter(k => k.startsWith(pre)).forEach(k => sessionStorage.removeItem(k)); } catch { } };
const resetScenario = n => { clearKeys('wsux_state:demo:' + n + ':'); ss.del('wsux_ev:' + n); track('scenario_reset', { scenario: n }); };
const resetAll = () => { clearKeys('wsux_state:'); clearKeys('wsux_ev:'); ss.del('wsux_cfg'); ss.del('wsux_account'); ss.del('wsux_seen'); };
const goApp = () => location.assign('/app.html');
const go = h => { location.hash = h; };

const SLIDES = [
  { icon: 'images', eyebrow: '함께 기록하기', title: '우리의 사진을\n한곳에 모아요', body: '각자 찍은 사진과 짧은 이야기가 하나의 추억이 돼요.', note: '민지 외 3명이 함께 남긴 순간', image: '/ux-test/images/onboarding-han.jpg', alt: '해 질 무렵 한강 공원에 모여 앉은 사람들', position: 'center 64%' },
  { icon: 'lock-keyhole', eyebrow: '우리만 보기', title: '초대한 사람끼리만\n기억을 이어가요', body: '사진마다 반응과 이야기를 남기고, 공개 범위는 직접 정해요.', note: '초대한 사람만 볼 수 있어요', image: '/ux-test/images/onboarding-cafe.jpg', alt: '따뜻한 조명이 켜진 아늑한 카페', position: 'center 48%' },
  { icon: 'map-pinned', eyebrow: '다시 발견하기', title: '쌓인 추억을\n발자국에서 만나요', body: '함께 다녀온 지역과 그날의 사진을 지도에서 다시 찾아요.', note: '제주 · 함께한 추억 6개', image: '/ux-test/images/onboarding-jeju.jpg', alt: '푸른 바다와 제주의 해안 산책길', position: 'center 58%' }
];

const view = {
  splash() {
    track('first_visit_test');
    root.innerHTML = `<button class="center" data-a="skip" aria-label="시작하기" style="background:none;border:0;font:inherit;color:inherit;cursor:pointer"><img class="mark" src="/brand/woorisai-symbol.svg" alt=""><span class="wm">우리사이</span></button>`;
    clearTimeout(view._t); view._t = setTimeout(() => go('#/intro/0'), 1600);
  },
  intro(i) {
    i = Math.max(0, Math.min(+i || 0, SLIDES.length - 1));
    const s = SLIDES[i], last = i >= SLIDES.length - 1;
    root.className = 'onboarding';
    root.innerHTML = `<header class="intro-top"><span class="intro-brand"><img src="/brand/woorisai-symbol.svg" alt=""><b>우리사이</b></span><button class="skip" data-a="introDone" data-m="skip">건너뛰기</button></header>
      <main class="intro-slide" aria-live="polite">
        <div class="intro-visual intro-visual-${i + 1}">
          <div class="intro-photo-frame"><img src="${s.image}" alt="${esc(s.alt)}" style="object-position:${s.position}" fetchpriority="high"><span class="intro-photo-count">${i + 1} / ${SLIDES.length}</span></div>
          <div class="intro-memory-card"><span>${LI(s.icon, 18, 1.8)}</span><b>${s.note}</b></div>
        </div>
        <section class="intro-copy"><p class="intro-eyebrow">${s.eyebrow}</p><h1>${s.title.replace('\n', '<br>')}</h1><p class="sub">${s.body}</p></section>
      </main>
      <nav class="dots" aria-label="온보딩 페이지">${SLIDES.map((_, k) => `<button class="${k === i ? 'on' : ''}" data-a="jump" data-i="${k}" aria-label="${k + 1}번째 소개 보기"${k === i ? ' aria-current="page"' : ''}></button>`).join('')}</nav>
      <div class="intro-actions${i ? '' : ' single'}">${i ? `<button class="btn line" data-a="prev" data-i="${i - 1}">이전</button>` : ''}<button class="btn" data-a="${last ? 'introDone' : 'next'}" data-i="${i + 1}" data-m="finish">${last ? '시작하기' : '다음'}</button></div>`;
    let start;
    root.onpointerdown = e => { start = { x: e.clientX, y: e.clientY }; };
    root.onpointerup = e => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y; start = null;
      if (Math.abs(dx) < 48 || Math.abs(dx) <= Math.abs(dy)) return;
      if (dx > 0 && i > 0) go('#/intro/' + (i - 1));
      else if (dx < 0 && !last) go('#/intro/' + (i + 1));
    };
  },
  start() {
    root.innerHTML = `<div class="stack" style="margin-top:24px"><span class="badge" style="align-self:flex-start">사용성 테스트</span><h1>어떻게 시작해 볼까요?</h1><p class="sub">둘 중 하나를 골라 주세요. 나중에 다시 고를 수도 있어요.</p></div>
      <div class="stack" style="margin-top:24px">
        <button class="opt" data-a="modeNew"><span class="oi">${LI('square-pen')}</span><span class="t"><b>처음부터 사용해 보기</b><span>가입하고, 빈 화면에서 첫 추억을 직접 만들어 봐요.</span></span>${LI('chevron-right', 20)}</button>
        <button class="opt" data-a="modeDemo"><span class="oi">${LI('images')}</span><span class="t"><b>주요 기능 체험하기</b><span>준비된 샘플 데이터로 주요 기능을 자유롭게 둘러봐요.</span></span>${LI('chevron-right', 20)}</button>
      </div>
      <div class="stack mt"><button class="btn ghost" data-a="toLogin">이미 가입했어요 · 로그인</button><button class="btn ghost" data-a="browse">로그인 없이 둘러보기</button></div>`;
  },
  signup() {
    root.innerHTML = `<div class="top"><button data-a="toStart" aria-label="뒤로 가기">${LI('chevron-left')}</button></div>
      <form class="stack" data-f="signup" novalidate style="margin-top:4px"><h1>우리사이 시작하기</h1><p class="sub">닉네임을 정하면 바로 첫 추억을 만들 수 있어요.</p>
        <div class="field" data-fld="name"><label for="su-name">닉네임</label><input id="su-name" name="name" type="text" maxlength="16" autocomplete="off" placeholder="2~16자"><p class="err"></p></div>
        <div class="field" data-fld="pw"><label for="su-pw">비밀번호</label><input id="su-pw" name="pw" type="password" autocomplete="new-password" placeholder="8자 이상"><p class="err"></p></div>
        <p class="note">이 체험에서는 비밀번호를 저장하거나 확인하지 않아요. 입력한 내용은 이 탭에만 있고, 탭을 닫으면 사라져요.</p>
        <div class="field" data-fld="agree"><label class="chk"><input type="checkbox" name="agree"><span>이용약관과 개인정보 수집·이용에 동의해요(필수) <span class="cap">약관 문구는 임시예요</span></span></label><p class="err"></p></div>
        <button class="btn" type="submit">가입하기</button><button class="btn line" type="button" data-a="testAccount">테스트 계정으로 바로 시작</button></form>`;
    let started = false; $('form').addEventListener('focusin', () => { if (!started) { started = true; track('sign_up_start'); } });
  },
  login() {
    root.innerHTML = `<div class="top"><button data-a="toStart" aria-label="뒤로 가기">${LI('chevron-left')}</button></div>
      <form class="stack" data-f="login" novalidate><h1>다시 만나서 반가워요</h1><p class="sub">이 탭에서 가입한 닉네임으로 로그인해요.</p>
        <div class="field" data-fld="name"><label for="li-name">닉네임</label><input id="li-name" name="name" type="text" maxlength="16" autocomplete="off"><p class="err"></p></div>
        <div class="field"><label for="li-pw">비밀번호</label><input id="li-pw" type="password" autocomplete="current-password"></div>
        <p class="note">비밀번호는 확인하지 않아요. 새로고침해도 만든 추억은 이 탭에 남아 있어요.</p>
        <button class="btn" type="submit">로그인하기</button><button class="btn line" type="button" data-a="toSignup">새로 시작하기</button></form>`;
  },
  guide() {
    root.innerHTML = `<div class="top"><button data-a="toStart" aria-label="뒤로 가기">${LI('chevron-left')}</button></div>
      <div class="stack"><h1>우리사이 체험하기</h1><p class="experience-lead">친구와의 순간을 기록하고<br>다시 만나보세요.</p><p class="sub">준비된 샘플 데이터로 우리사이의 주요 기능을 자유롭게 체험할 수 있어요.</p></div>
      <section class="experience-card" aria-label="체험할 수 있는 기능">
        <div><b>함께 추억 남기기</b><span>친구의 사진에 반응하고 이야기를 더해보세요.</span></div>
        <div><b>약속 만들기</b><span>친구들과 만날 일정을 만들어보세요.</span></div>
        <div><b>지난 추억 발견하기</b><span>발자국에서 함께한 장소를 찾아보세요.</span></div>
      </section>
      <div class="stack mt"><button class="btn experience-start" data-a="startFree">체험 시작하기</button><p class="cap" style="text-align:center">순서에 상관없이 자유롭게 둘러볼 수 있어요.</p></div>`;
  },
  qa(n) {
    const c = cfg();
    if (!n) {
      root.innerHTML = `<div class="top"><button data-a="toStart" aria-label="뒤로 가기">${LI('chevron-left')}</button></div>
        <div class="stack"><span class="badge guide" style="align-self:flex-start">테스트 가이드</span><h1>주요 기능 체험</h1><p class="sub">샘플 데이터로 우리사이의 핵심 경험을 차례로 체험해요. 시나리오마다 시작 데이터가 따로 준비돼 있어요.</p></div>
        <div class="stack" style="margin-top:20px">${SC.map(s => { const [d, t] = prog(s.n); return `<button class="sc${c.sc === s.n ? ' cur' : ''}" data-a="openSc" data-n="${s.n}"><span class="row"><span style="display:flex;gap:10px;align-items:center"><span class="oi" style="width:36px;height:36px;border-radius:9999px;display:grid;place-items:center;background:var(--ws-color-bg-brand-subtle);color:var(--ws-color-fg-brand)">${LI(s.icon, 20)}</span><b style="font:var(--type-headline-2);color:var(--ws-color-fg-strong)">시나리오 ${s.n}. ${s.title}</b></span>${LI('chevron-right', 20)}</span><span class="sub" style="font:var(--type-label-1-read)">${s.desc}</span><span class="cap">${d === t ? '완료' : d ? `진행 중 · ${d}/${t}` : `${t}단계`}</span></button>`; }).join('')}</div>
        <div class="stack mt"><button class="btn line" data-a="resetAll">테스트 상태 모두 초기화</button></div>`;
      return;
    }
    const s = SC[n - 1], d = done(n), [dn, tt] = prog(n), next = SC[n];
    if (dn === tt && !ss.get('wsux_sc_done:' + n)) { ss.set('wsux_sc_done:' + n, '1'); track('scenario_complete', { scenario: n }); }
    root.innerHTML = `<div class="top"><button data-a="toQa" aria-label="목록으로">${LI('chevron-left')}</button></div>
      <div class="stack"><span class="badge guide" style="align-self:flex-start">시나리오 ${n} / ${SC.length}</span><h1>${s.title}</h1><p class="sub">${s.desc}</p></div>
      <ol class="steps" style="margin-top:20px">${s.steps.map((st, i) => `<li class="${d[st[1]] ? 'done' : ''}"><span class="n">${d[st[1]] ? '✓' : i + 1}</span><span>${st[0]}</span></li>`).join('')}</ol>
      <p class="cap" style="margin-top:12px">체험 화면에서 동작하면 단계가 자동으로 체크돼요. 돌아오려면 브라우저·스마트폰의 뒤로 가기를 눌러 주세요.</p>
      <div class="stack mt"><button class="btn" data-a="startSc" data-n="${n}">${dn ? '이어서 체험하기' : '체험 시작'}</button>
        ${dn === tt && next ? `<button class="btn" data-a="openSc" data-n="${n + 1}" data-next="1">다음 시나리오로 · ${next.title}</button>` : next ? `<button class="btn line" data-a="openSc" data-n="${n + 1}" data-next="1">다음 시나리오로</button>` : ''}
        <button class="btn line" data-a="restartSc" data-n="${n}">시작 데이터 다시 불러오기(이 시나리오 초기화)</button></div>`;
  }
};

function render() {
  const h = (location.hash || '#/').slice(2), [r, a] = h.split('/');
  root.className = '';
  root.onpointerdown = null;
  root.onpointerup = null;
  if (!r) return view.splash();
  if (r === 'intro') view.intro(a);
  else if (r === 'start') view.start();
  else if (r === 'signup') view.signup();
  else if (r === 'login') view.login();
  else if (r === 'guide') view.guide();
  else if (r === 'qa') view.qa(+a || 0);
  else view.splash();
  window.scrollTo(0, 0);
  track('page_view', { page_path: '/' + (r || 'splash'), page_location: location.origin + '/', page_title: r || 'splash' });
}

root.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t) return;
  const a = t.dataset.a, n = +t.dataset.n;
  if (a === 'skip') { clearTimeout(view._t); go('#/intro/0'); }
  else if (a === 'next') go('#/intro/' + t.dataset.i);
  else if (a === 'prev') go('#/intro/' + t.dataset.i);
  else if (a === 'jump') go('#/intro/' + t.dataset.i);
  else if (a === 'introDone') { track('onboarding_complete', { method: t.dataset.m }); ss.set('wsux_seen', '1'); go('#/start'); }
  else if (a === 'toStart') go('#/start');
  else if (a === 'toSignup') go('#/signup');
  else if (a === 'toLogin') go('#/login');
  else if (a === 'toQa') go('#/qa');
  else if (a === 'modeNew') { track('test_start', { flow: 'new' }); go(account() ? '#/login' : '#/signup'); }
  else if (a === 'modeDemo') { track('test_start', { flow: 'demo' }); go('#/guide'); }
  else if (a === 'startFree') { setCfg({ flow: 'demo', sc: 0 }); track('test_start', { flow: 'demo_free' }); goApp(); }
  else if (a === 'browse') { setCfg({ flow: 'guest' }); goApp(); }
  else if (a === 'testAccount') { const nm = '테스트'; ss.set('wsux_account', JSON.stringify({ name: nm })); clearKeys('wsux_state:new:'); ss.del('wsux_ev:new'); setCfg({ flow: 'new', name: nm }); track('login', { method: 'test_account' }); goApp(); }
  else if (a === 'openSc') go('#/qa/' + n);
  else if (a === 'startSc') { setCfg({ flow: 'demo', sc: n }); track('scenario_start', { scenario: n }); goApp(); }
  else if (a === 'restartSc') { resetScenario(n); render(); }
  else if (a === 'resetAll') { if (confirm('이 탭의 테스트 상태(만든 추억, 진행 기록)를 모두 지울까요? 다른 사람의 기록에는 영향이 없어요.')) { resetAll(); go('#/start'); render(); } }
});

const bad = (form, name, msg) => { const f = $(`[data-fld=${name}]`, form); f.classList.toggle('bad', !!msg); $('.err', f).textContent = msg || ''; return !msg; };
root.addEventListener('submit', e => {
  e.preventDefault(); const f = e.target, kind = f.dataset.f, fd = new FormData(f);
  const name = String(fd.get('name') || '').trim();
  if (kind === 'signup') {
    const ok = [bad(f, 'name', name.length < 2 || name.length > 16 ? '닉네임은 2~16자로 입력해 주세요.' : /[<>]/.test(name) ? '쓸 수 없는 글자가 있어요.' : ''), bad(f, 'pw', String(fd.get('pw') || '').length < 8 ? '비밀번호는 8자 이상으로 입력해 주세요.' : ''), bad(f, 'agree', fd.get('agree') ? '' : '필수 항목에 동의해 주세요.')].every(Boolean);
    if (!ok) return;
    ss.set('wsux_account', JSON.stringify({ name })); clearKeys('wsux_state:new:'); ss.del('wsux_ev:new');
    setCfg({ flow: 'new', name }); track('sign_up', { method: 'nickname' }); goApp();
  } else if (kind === 'login') {
    const acc = account();
    if (!bad(f, 'name', !name ? '닉네임을 입력해 주세요.' : !acc || acc.name !== name ? '이 탭에서 가입한 닉네임만 로그인할 수 있어요.' : '')) return;
    setCfg({ flow: 'new', name }); track('login', { method: 'nickname' }); goApp();
  }
});

askConsent();
addEventListener('hashchange', render);
render();
