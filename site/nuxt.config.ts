import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

// The website shares the dashboard's logo, screenshots and theme, so it reads them from the project root.
const fromRoot = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url))
const { version } = JSON.parse(readFileSync(fromRoot('package.json'), 'utf8'))

export default defineNuxtConfig({
  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  dir: {
    public: fromRoot('public'),
  },

  nitro: {
    publicAssets: [{ dir: fromRoot('docs/screenshots'), baseURL: '/screenshots' }],
    prerender: { routes: ['/', '/ar/', '/docs/accounts-and-numbers/', '/ar/docs/accounts-and-numbers/', '/docs/templates/', '/ar/docs/templates/', '/sitemap.xml', '/robots.txt', '/llms.txt'] },
  },

  app: {
    head: {
      meta: [{ name: 'theme-color', content: '#317455' }],
    },
  },

  fonts: {
    families: [
      { name: 'IBM Plex Sans Arabic', provider: 'google', weights: [400, 500, 600, 700], subsets: ['arabic', 'latin'] },
      { name: 'IBM Plex Mono', provider: 'google', weights: [400, 500], subsets: ['latin'] },
    ],
  },

  // GitHub Pages serves files only, so every icon the page uses ships with it instead of being fetched.
  // The feature icons are named in utils/content.ts, which the default scan skips.
  icon: {
    provider: 'none',
    clientBundle: { scan: { globInclude: ['**/*.{vue,ts}'] } },
  },

  runtimeConfig: {
    public: {
      version,
      siteUrl: 'https://wbm.haythamasalama.me',
      repo: 'https://github.com/Haythamasalama/whatsapp-business-monitor',
    },
  },

  devtools: { enabled: false },

  compatibilityDate: '2026-10-01',
})
