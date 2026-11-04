import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import type { Plugin } from 'vite'
import { DEFAULT_THEME_ID, firstPaintTable, themesCss } from './src/data/themes'

/**
 * 테마 목록(src/data/themes.ts) 하나로
 *  - 테마별 색 덮어쓰기 CSS (import 'virtual:themes.css')
 *  - index.html 첫 화면 스크립트의 색 표 (__THEME_TABLE__, __DEFAULT_THEME__ 자리)
 * 를 자동으로 만들어 줘요. 테마를 추가할 때 다른 파일은 고치지 않아도 돼요.
 */
function hannunThemes(): Plugin {
  const VIRTUAL = 'virtual:themes.css'
  const RESOLVED = '\0virtual:themes.css'
  return {
    name: 'hannun-themes',
    resolveId(id) {
      if (id === VIRTUAL) return RESOLVED
    },
    load(id) {
      if (id === RESOLVED) return themesCss()
    },
    transformIndexHtml(html) {
      return html
        .replace('__THEME_TABLE__', JSON.stringify(firstPaintTable()))
        .replace('__DEFAULT_THEME__', JSON.stringify(DEFAULT_THEME_ID))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // './' : 어느 주소(예: GitHub Pages의 /저장소이름/)에 올려도 동작하게
  base: './',
  server: { host: true },
  plugins: [
    hannunThemes(),
    react(),
    tailwindcss(),
    // PWA: 홈 화면 설치 + 인터넷 없이도 열리게 (서비스 워커가 앱 파일을 폰에 보관)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png', 'fonts/PretendardVariable.woff2'],
      manifest: {
        name: '한눈 플래너',
        short_name: '한눈 플래너',
        description: '일정, 할 일, 메모를 한눈에. 광고 없고 내 폰에만 저장되는 플래너',
        lang: 'ko',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#faf8f5',
        theme_color: '#faf8f5',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest,woff2}'],
        // 글꼴 파일(약 2MB)도 폰에 보관해서 오프라인에서도 예쁜 글꼴로 보이게
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})
