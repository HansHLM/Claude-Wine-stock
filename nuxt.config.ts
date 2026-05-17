export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  modules: ['@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  ssr: true,
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL || '/',
    head: {
      htmlAttrs: { lang: 'nl' },
      title: 'Wijnkelder',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Een rustige plek om uw wijnvoorraad bij te houden.' },
      ],
    },
  },
  nitro: {
    prerender: {
      routes: ['/', '/overzicht'],
      crawlLinks: false,
    },
  },
  devtools: { enabled: false },
})
