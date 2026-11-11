// 배포 산출물 생성: Claude Design 원본 프로젝트(mobile-prototype-review-checklist/project)를 수정 없이 그대로 dist-ux-test/ 로 복사한다.
// - 원본 파일(.dc.html, support.js, 디자인 시스템 _ds/, 폰트, 토큰, 로고 SVG, lucide-icon.js)은 바이트 단위로 같게 복사하고 sha256 으로 검사한다.
// - index.html 만 예외: '인터랙티브 프로토타입' 원본에 GA4 연결용 <head> 태그 두 줄을 더한 사본이다. 화면(마크업·CSS·JS)은 그대로다.
// - 사진은 원본처럼 images.unsplash.com 에서, 아이콘은 원본처럼 unpkg 의 lucide@0.469.0 에서 불러온다.
// 이전의 직접 구현 앱 빌드는 ux-test/build-app.mjs(브랜치 ux-test-vercel-app-backup).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'mobile-prototype-review-checklist', 'project');
const out = path.join(root, 'dist-ux-test');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const PROTO = '우리사이 인터랙티브 프로토타입.dc.html';
const COPY = ['_ds', 'brand', 'support.js', 'image-slot.js', 'lucide-icon.js', PROTO, '우리사이 모바일 시안 모음.dc.html', '우리사이 모바일 프로토타입.dc.html', '우리사이 실사용 목업.dc.html'];
for (const n of COPY) fs.cpSync(path.join(src, n), path.join(out, n), { recursive: true });
fs.cpSync(path.join(root, 'ux-test'), path.join(out, 'ux-test'), { recursive: true, filter: s => /(analytics\.js|original-[a-z]+\.(js|css))$/.test(s) || fs.statSync(s).isDirectory() && s.endsWith('ux-test') });

// 측정 ID: 기본값 또는 UX_GA_ID 환경변수(빈 값이면 GA4 끔)
const DEFAULT_GA_ID = 'G-1L7TN9K6GM';
const gaId = (process.env.UX_GA_ID === undefined ? DEFAULT_GA_ID : process.env.UX_GA_ID).trim();
if (gaId && !/^G-[A-Z0-9]{4,}$/.test(gaId)) throw new Error('UX_GA_ID 형식이 올바르지 않아요: G-XXXXXXXXXX');

// index.html = 인터랙티브 프로토타입 + GA4 태그(<head> 끝)
let html = fs.readFileSync(path.join(src, PROTO), 'utf8');
if (!html.includes('</head>')) throw new Error('원본에 </head> 가 없어요.');
html = html.replace('</head>', `<link rel="stylesheet" href="/ux-test/original-consent.css">\n<script>window.__UX_GA_ID=${JSON.stringify(gaId)};</script>\n<script type="module" src="/ux-test/original-ga.js"></script>\n</head>`);
fs.writeFileSync(path.join(out, 'index.html'), html);

// 검사: 원본 파일이 바이트 단위로 같은지
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let n = 0;
for (const name of COPY) for (const f of (fs.statSync(path.join(src, name)).isDirectory() ? walk(path.join(src, name)) : [path.join(src, name)])) {
  const rel = path.relative(src, f);
  if (sha(f) !== sha(path.join(out, rel))) throw new Error('원본과 달라요: ' + rel);
  n++;
}
const need = ['index.html', 'support.js', 'lucide-icon.js', PROTO, 'ux-test/analytics.js', 'ux-test/original-ga.js', 'ux-test/original-consent.css'];
const miss = need.filter(f => !fs.existsSync(path.join(out, f)));
if (miss.length) throw new Error('산출물에 빠진 파일: ' + miss.join(', '));
console.log(`dist-ux-test 생성 완료: 원본 ${n}개 파일 sha256 일치, index.html=인터랙티브 프로토타입+GA4 태그 (GA4: ${gaId ? '측정 ID 설정됨' : '미설정, 전송 없음'})`);
