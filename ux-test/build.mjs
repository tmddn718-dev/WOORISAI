// 배포 산출물 생성(dist-ux-test/).
//  1) Claude Design 원본 프로젝트 파일은 수정 없이 그대로 복사하고 sha256 으로 검사한다(원본 프로토타입·시안 모음 포함).
//  2) app.html = 원본 '인터랙티브 프로토타입'의 테스트 빌드. 화면(마크업·CSS)은 원본과 같고 데이터·상태 로직만 ux-test/proto-patch.mjs 로 고친다.
//  3) index.html = 테스트 진입 영역(스플래시·온보딩·가입·로그인·모드 선택·가이드). 실제 서비스 화면과 분리돼 있다.
// 이전 직접 구현 앱 빌드는 ux-test/build-app.mjs(브랜치 ux-test-vercel-app-backup).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { patchProto, MARKUP } from './proto-patch.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'mobile-prototype-review-checklist', 'project');
const out = path.join(root, 'dist-ux-test');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const PROTO = '우리사이 인터랙티브 프로토타입.dc.html';
const COPY = ['_ds', 'brand', 'support.js', 'image-slot.js', 'lucide-icon.js', PROTO, '우리사이 모바일 시안 모음.dc.html', '우리사이 모바일 프로토타입.dc.html', '우리사이 실사용 목업.dc.html'];
for (const n of COPY) fs.cpSync(path.join(src, n), path.join(out, n), { recursive: true });

// 테스트 전용 정적 파일(원본 파일 아님)
const UXT = path.join(out, 'ux-test');
fs.mkdirSync(path.join(UXT, 'entry'), { recursive: true });
for (const f of ['analytics.js', 'app-ga.js', 'original-consent.css']) fs.copyFileSync(path.join(root, 'ux-test', f), path.join(UXT, f));
for (const f of ['entry.js', 'entry.css']) fs.copyFileSync(path.join(root, 'ux-test', 'entry', f), path.join(UXT, 'entry', f));

// GA4 측정 ID: 기본값 또는 UX_GA_ID(빈 값이면 끔)
const DEFAULT_GA_ID = 'G-1L7TN9K6GM';
const gaId = (process.env.UX_GA_ID === undefined ? DEFAULT_GA_ID : process.env.UX_GA_ID).trim();
if (gaId && !/^G-[A-Z0-9]{4,}$/.test(gaId)) throw new Error('UX_GA_ID 형식이 올바르지 않아요: G-XXXXXXXXXX');

// 진입 영역
fs.writeFileSync(path.join(out, 'index.html'), fs.readFileSync(path.join(root, 'ux-test', 'entry', 'index.html'), 'utf8').replace('__GA_ID__', JSON.stringify(gaId)));

// 테스트 빌드 화면
const original = fs.readFileSync(path.join(src, PROTO), 'utf8');
const inject = `<link rel="stylesheet" href="/ux-test/original-consent.css">\n<script>window.__UX_GA_ID=${JSON.stringify(gaId)};</script>\n<script type="module" src="/ux-test/app-ga.js"></script>\n</head>`;
const patched = patchProto(original);
if (!patched.includes('</head>')) throw new Error('</head> 가 없어요.');
fs.writeFileSync(path.join(out, 'app.html'), patched.replace('</head>', inject));

// 검사 1: 원본 파일 sha256 일치
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
let n = 0;
for (const name of COPY) for (const f of (fs.statSync(path.join(src, name)).isDirectory() ? walk(path.join(src, name)) : [path.join(src, name)])) {
  if (sha(f) !== sha(path.join(out, path.relative(src, f)))) throw new Error('원본과 달라요: ' + path.relative(src, f));
  n++;
}
// 검사 2: app.html 의 화면(마크업) 부분이 원본과 같은지. 허용한 마크업 패치(MARKUP)를 되돌리고 </head> 앞 GA 태그를 빼면 원본과 바이트 단위로 같아야 한다.
const mk = '<script type="text/x-dc" data-dc-script';
let appHtml = fs.readFileSync(path.join(out, 'app.html'), 'utf8').replace(inject, '</head>');
for (const [a, c] of MARKUP) appHtml = appHtml.replace(c, () => a);
if (appHtml.slice(0, appHtml.indexOf(mk)) !== original.slice(0, original.indexOf(mk))) throw new Error('app.html 의 화면(마크업)이 허용한 패치 밖에서 원본과 달라요.');
const need = ['index.html', 'app.html', 'support.js', 'lucide-icon.js', PROTO, 'ux-test/analytics.js', 'ux-test/app-ga.js', 'ux-test/entry/entry.js', 'ux-test/entry/entry.css', 'ux-test/original-consent.css'];
const miss = need.filter(f => !fs.existsSync(path.join(out, f)));
if (miss.length) throw new Error('산출물에 빠진 파일: ' + miss.join(', '));
console.log(`dist-ux-test 생성 완료: 원본 ${n}개 파일 sha256 일치, app.html 화면(마크업)은 허용 패치(추억 상세 갤러리) 외 원본과 동일, 진입 영역 index.html (GA4: ${gaId ? '측정 ID 설정됨' : '미설정, 전송 없음'})`);
