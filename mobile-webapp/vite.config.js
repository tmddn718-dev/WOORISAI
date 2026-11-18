import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 카카오톡 인앱 브라우저(구형 WebView 포함)를 위해 빌드 타깃을 넉넉하게 둔다.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { target: ['es2020', 'safari14', 'chrome87'] },
});
