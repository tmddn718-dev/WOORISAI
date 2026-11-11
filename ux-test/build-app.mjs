// UX 테스트용 정적 산출물 생성: public/ 을 dist-ux-test/ 로 복사하고 테스트 스크립트를 끼워 넣는다.
// public/ 과 server.js 는 수정하지 않는다. 외부 의존성 없음. 사용: node ux-test/build.mjs
// GA4: 기본 측정 ID 를 쓰고, UX_GA_ID 환경변수로 바꾸거나(빈 값이면 끔) 덮어쓸 수 있다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'dist-ux-test');
fs.rmSync(out, { recursive: true, force: true });
fs.cpSync(path.join(root, 'public'), out, { recursive: true });
fs.cpSync(path.join(root, 'ux-test'), path.join(out, 'ux-test'), { recursive: true, filter: s => !/(build\.mjs|README\.md)$/.test(s) });

// 측정 ID는 공개 값이라 기본값을 코드에 둔다. 환경변수 UX_GA_ID 가 있으면 그 값이 우선하고, 빈 문자열이면 GA4를 끈다.
const DEFAULT_GA_ID = 'G-1L7TN9K6GM';
const gaId = (process.env.UX_GA_ID === undefined ? DEFAULT_GA_ID : process.env.UX_GA_ID).trim();
if (gaId && !/^G-[A-Z0-9]{4,}$/.test(gaId)) throw new Error('UX_GA_ID 형식이 올바르지 않아요: G-XXXXXXXXXX');

const file = path.join(out, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const css = '<link rel="stylesheet" href="/ux-test/ux-test.css">';
const cfg = `<script>window.__UX_GA_ID=${JSON.stringify(gaId)};</script>`;
const flow = '<script src="/ux-test/flow.js" type="module"></script>';
const robots = '<meta name="robots" content="noindex,nofollow">';
if (!html.includes('<script src="/app.js" type="module"></script>')) throw new Error('index.html 구조가 바뀌어 스크립트를 끼워 넣지 못했어요.');
html = html.replace('</head>', `${robots}\n${css}\n</head>`).replace('<script src="/app.js" type="module"></script>', `${cfg}\n${flow}\n<script src="/app.js" type="module"></script>`);
fs.writeFileSync(file, html);

// 산출물 검사: 필수 파일이 모두 있는지
const need = ['index.html', 'app.js', 'nickname.js', 'style.css', 'logo.svg', 'ux-test/flow.js', 'ux-test/mock-api.js', 'ux-test/seed.js', 'ux-test/analytics.js', 'ux-test/ux-test.css', 'ux-test/media/seed-1.svg'];
const miss = need.filter(f => !fs.existsSync(path.join(out, f)));
if (miss.length) throw new Error('산출물에 빠진 파일: ' + miss.join(', '));
console.log('dist-ux-test 생성 완료 (GA4: ' + (gaId ? '측정 ID 설정됨' : '미설정, 전송 없음') + ')');
