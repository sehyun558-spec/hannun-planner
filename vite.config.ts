import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // './' : 어느 주소(예: GitHub Pages의 /저장소이름/)에 올려도 동작하게
  base: './',
  server: { host: true },
  plugins: [
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
