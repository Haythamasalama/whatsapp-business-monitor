import { readFileSync } from 'node:fs'

const { version } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  // A local tool: rendering on the client keeps the API guard simple, every /api call comes from the browser.
  ssr: false,

  css: ['~/assets/css/main.css'],

  devServer: {
    host: '127.0.0.1',
    port: 3210,
  },

  app: {
    head: {
      title: 'مراقب واتساب الأعمال',
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      meta: [
        { name: 'description', content: 'لوحة محلية لمراقبة قوالب واتساب الأعمال وأدائها وتكلفتها.' },
        { name: 'theme-color', content: '#317455' },
      ],
    },
  },

  // @nuxt/fonts skips the arabic subset by default, which left every Arabic letter in the system fallback.
  fonts: {
    families: [
      { name: 'IBM Plex Sans Arabic', provider: 'google', weights: [400, 500, 600, 700], subsets: ['arabic', 'latin'] },
      { name: 'IBM Plex Mono', provider: 'google', weights: [400, 500, 700], subsets: ['latin'] },
    ],
  },

  icon: {
    serverBundle: 'local',
  },

  runtimeConfig: {
    public: { version },
  },

  // No other site may frame the app (clickjacking), and responses are never sniffed as another type.
  routeRules: {
    '/**': { headers: { 'X-Frame-Options': 'DENY', 'Content-Security-Policy': 'frame-ancestors \'none\'', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin' } },
  },

  devtools: { enabled: false },

  compatibilityDate: '2026-10-01',
})
