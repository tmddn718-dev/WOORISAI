/* 원본 프로토타입 위에 GA4 만 얹는다(화면·동작은 건드리지 않는다). 동의 배너 → 동의 시에만 GA 로드 → page_view 1회. */
import { track, askConsent } from '/ux-test/analytics.js';
const start = () => { askConsent(); track('page_view', { page_path: '/prototype', page_location: location.origin + '/', page_title: 'prototype' }); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
