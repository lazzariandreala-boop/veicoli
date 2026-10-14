// App mobile: SPA statica (nessun server), impacchettata con Capacitor.
export default defineNuxtConfig({
  compatibilityDate: '2025-10-01',
  ssr: false,
  devtools: { enabled: false },
  css: [
    '@fontsource-variable/inter',
    '@fontsource-variable/sora',
    '~/assets/css/main.css',
  ],
  app: {
    head: {
      title: 'Veicoli',
      htmlAttrs: { lang: 'it' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1' },
        { name: 'theme-color', content: '#060818' },
        { name: 'color-scheme', content: 'dark light' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' }],
    },
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  router: { options: { hashMode: true } },
  vite: {
    optimizeDeps: { include: ['dexie', 'fflate', 'pdfjs-dist'] },
    build: { target: 'es2022' },
  },
})
