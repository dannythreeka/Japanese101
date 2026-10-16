import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import pack from './public/offline-manifest.json' with { type: 'json' }
import { VitePWA } from 'vite-plugin-pwa'

const base = process.env.VITE_BASE_PATH ?? '/'

export default defineConfig({
  base,
  define:{'import.meta.env.VITE_P2_REVIEW_PREVIEW':JSON.stringify(process.env.VITE_P2_REVIEW_PREVIEW ?? (process.env.VERCEL_ENV==='preview' ? '1':'0'))},
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,mp3,wav,json}'],
        runtimeCaching: [{ urlPattern: /\/(assets\/(audio|img)|stroke-svgs|sfx)\//, handler: 'CacheFirst', options: { cacheName: `japanese101-pack-${pack.version}` } }],
      },
      manifest: {
        name: '日本語101 - にほんごがくしゅう',
        short_name: 'にほんご101',
        description: '6歲兒童日語學習應用',
        theme_color: '#193b5c',
        background_color: '#fffdf7',
        display: 'standalone',
        start_url: base,
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:3001', changeOrigin: true },
    },
  },
  test: {
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/store/**'],
      thresholds: { lines: 80 },
    },
  },
})
