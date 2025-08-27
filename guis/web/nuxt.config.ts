// https://nuxt.com/docs/api/configuration/nuxt-config
import { join as pathjoin } from 'node:path'
import process from 'node:process'
import mkcert from 'vite-plugin-mkcert'
import pkg from './package.json'
import { defineNuxtConfig } from 'nuxt/config'

const services_tracker_url_prefix = process.env.SERVICES_TRACKER_URL_PREFIX || 'http://localhost:18080/'
const services_pgrst_url_prefix = process.env.SERVICES_PGRST_URL_PREFIX || 'http://localhost:28080/'
const geolocation_url_prefix = process.env.GEOLOCATION_URL_PREFIX || 'http://localhost:38080/'

export default defineNuxtConfig({
  compatibilityDate: '2025-08-17',
  app: {
    head: {
      link: [
        { rel: "manifest", href: "/manifest.webmanifest" },
      ]
    }
  },
  buildDir: process.env.NUXT_BUILD_DIR || '.nuxt',
  sourcemap: {
    // let nitro generate sourcemap and inject then, for some reason also needed in production firebase
    server: true,
    // during development client sourcemaps are duplicate and non-functional, but are required in production.
    client: process.env.NODE_ENV !== 'development',
    // if neither client or server are true, nuxt generates broken sourcemaps :-(
  },
  nitro: {
    compressPublicAssets: true,
    preset: process.env.NITRO_PRESET || 'node-server',
    output: {
      dir: process.env.NUXT_OUTPUT_DIR || pathjoin(__dirname, '.output'),
      serverDir: process.env.NUXT_OUTPUT_DIR ? (`${process.env.NUXT_OUTPUT_DIR}/server`) : pathjoin(__dirname, '.output/server'),
      publicDir: process.env.NUXT_OUTPUT_DIR ? (`${process.env.NUXT_OUTPUT_DIR}/public`) : pathjoin(__dirname, '.output/public'),
    },
    experimental: {
      wasm: true,
    },
  },
  ssr: true,
  routeRules: { // not enough to make it work, but will try more later
    '/': { ssr: false },
    '/pt': { ssr: false },
    '/es': { ssr: false },
    '/tips': { ssr: false },
    '/es/consejos': { ssr: false },
    '/pt/dicas': { ssr: false },
    '/gallery': { ssr: false },
    '/pt/galeria': { ssr: false },
    '/es/galeria': { ssr: false },
    '/login': { ssr: false },
    '/logout': { ssr: false },
    '/dropout': { ssr: false },
    '/camera': { ssr: false },
    '/es/camara': { ssr: false },
    '/pt/camera': { ssr: false },
    '/intro': { ssr: false },
    '/support': { ssr: false },
    '/pt/suporte': { ssr: false },
    '/es/suporte': { ssr: false },
    '/your_disposal_places': { ssr: false },
    '/profile': { ssr: false },
    '/es/perfil': { ssr: false },
    '/pt/perfil': { ssr: false },
    '/images/**': { ssr: false },
    '/es/imagenes/**': { ssr: false },
    '/pt/imagens/**': { ssr: false },
  },
  typescript: {
    shim: false
  },
  css: [
    'vuetify/styles', // vuetify ships precompiled css, no need to import sass
    '/assets/styles/global.css',
    '/assets/styles/transitions.css',
  ],
  vite: {
    plugins: (process.env.APP_ENV === 'preview')
      ? []
      : [mkcert({ hosts: ['localhost', '127.0.0.1', '10.0.2.2'], source: 'coding' })],
    ssr: {
      noExternal: ['vuetify'], // alternatively, look at https://github.com/nuxt-alt/vuetify
    },
    build: {
      chunkSizeWarningLimit: 2048,
    },
    optimizeDeps: {
      exclude: ['vuetify'], // https://stackoverflow.com/a/75922488
    },
  },
  runtimeConfig: {
    public: {
      logRocket: {
        id: 'v8rkrf/iris',
        dev: false,
      },
      IRIS_VERSION: pkg.version + ((process.env.APP_ENV !== 'production') ? ' ' : (`-${process.env.APP_ENV}`)),
      FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
      ELECTRIC_SQL_URL: process.env.ELECTRIC_SQL_URL,
      SERVICES_TRACKER_URL_PREFIX: services_tracker_url_prefix,
      SERVICES_PGRST_URL_PREFIX: services_pgrst_url_prefix,
      GEOLOCATION_URL_PREFIX: geolocation_url_prefix,
      GOOGLE_MAPS_API_KEY: process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_API_KEY : process.env.GOOGLE_MAPS_API_KEY,
      MAPS_EMBED_API_KEY: process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_API_KEY : process.env.MAPS_EMBED_API_KEY,
      PLACES_API_KEY: process.env.NODE_ENV === 'development' ? process.env.DEVELOPMENT_API_KEY : process.env.PLACES_API_KEY,
    },
  },
  modules: [
    // this adds the vuetify vite plugin
    // also produces type errors in the current beta release
    // async (options, nuxt) => {
    //   // @ts-ignore
    //   nuxt.hooks.hook('vite:extendConfig', config => config.plugins.push(
    //     vuetify()
    //   ))
    // },
    // '@nuxtjs/google-adsense',
    'nuxt-gtag',
    'nuxt-vuefire',
    '@nuxtjs/google-fonts',
    '@nuxt/test-utils/module',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@nuxt/image',
  ],
  googleFonts: {
    families: {
      Roboto: [300, 400, 500, 700],
    },
    display: 'swap',
  },
  // Disabled until I figure out how to prevent adsense from adding auto ads:
  // https://www.oneminuteinfo.com/2019/03/should-you-use-google-adsense-auto-ads.html
  // 'google-adsense' : {
  //    id: 'ca-pub-1689943351276462',
  //    test: true,
  //    onPageLoad: true
  // },
  vuefire: {
    auth: {
      enabled: true,
    },
    config: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: 'iris.cleaning',
      // Notice we use redirect based login, which is needed for IOS.
      // Hence, the following domains also need to be authorized when
      // using pwabuilder to create native apps:
      // iris.cleaning
      // trash-362115.firebaseapp.com
      // accounts.google.com
      // accounts.youtube.com
      // appleid.apple.com
      // www.facebook.com
    },
    // Needed to prerender password protected pages,
    // even when firebase auth itself is not in SSR
    // admin: {
    //     config: {},
    //     serviceAccount: resolve(
    //      fileURLToPath(new URL('./service-account.json', import.meta.url))
    //    ),
    // }
  },
  gtag: {
    id: 'GTM-PV65H75F',
  },
  pwa: {
    strategies: 'generateSW',
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    manifest: {
      id: 'com.iris.recycling.app',
      name: 'Iris - AI Recycling Assistant',
      short_name: 'Iris',
      description: 'See through the waste with AI-powered recycling assistance. Identify recyclable materials instantly using computer vision.',
      theme_color: '#2196f3',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait-primary',
      scope: '/',
      start_url: '/?utm_source=pwa',
      categories: ['lifestyle', 'utilities', 'productivity', 'education'],
      lang: 'en',
      dir: 'ltr',
      shortcuts: [
        {
          name: 'Scan Item',
          short_name: 'Scan',
          description: 'Take a photo to identify recyclable materials',
          url: '/camera?utm_source=pwa_shortcut',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'View Gallery',
          short_name: 'Gallery',
          description: 'Browse your scanned items',
          url: '/gallery?utm_source=pwa_shortcut',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'Recycling Tips',
          short_name: 'Tips',
          description: 'Learn recycling best practices',
          url: '/tips?utm_source=pwa_shortcut',
          icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
      ],
      screenshots: [
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          form_factor: 'narrow',
          label: 'Main app interface',
        },
      ],
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
        {
          src: 'apple-touch-icon-180x180.png',
          sizes: '180x180',
          type: 'image/png',
        },
      ],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },
  i18n: {
    locales: [
      {
        code: 'en',
        name: 'English',
        file: 'i18n_en.json'
      },
      {
        code: 'es',
        name: 'Español',
        file: 'i18n_es.json'
      },
      {
        code: 'pt',
        name: 'Português',
        file: 'i18n_pt.json'
      },
    ],
    defaultLocale: 'en',
    langDir: 'i18n_messages',
    lazy: true,
    vueI18n: './i18n.config.ts',
    strategy: 'prefix_except_default',
    customRoutes: 'config',
    pages: {
      'tips/index': {
        en: '/tips',
        es: '/consejos',
        pt: '/dicas',
      },
      'gallery/index': {
        en: '/gallery',
        es: '/galeria',
        pt: '/galeria',
      },
      'profile/index': {
        en: '/profile',
        es: '/perfil',
        pt: '/perfil',
      },
      'camera/index': {
        en: '/camera',
        es: '/camara',
        pt: '/camera',
      },
      'intro/index': {
        en: '/intro',
        es: '/introduccion',
        pt: '/introducao',
      },
      'posts/index': {
        en: '/learn_more',
        es: '/aprende_mas',
        pt: '/saiba_mais',
      },
      'images/index': {
        en: '/images/:id',
        es: '/imagenes/:id',
        pt: '/imagens/:id',
      },
      'dropout/index': {
        en: '/dropout',
        es: '/dropout',
        pt: '/dropout',
      },
      'support/index': {
        en: '/support',
        es: '/suporte',
        pt: '/suporte',
      },
      'settings/index': {
        en: '/settings',
        es: '/configuracion',
        pt: '/configuracoes'
      },
      'your_disposal_places/index': {
        en: '/your_disposal_places',
        es: '/sus_lugares_de_disposicion',
        pt: '/seus_locais_de_descarte',
      },
    },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  } as any,
  image: {
    cloudflare: {
      baseURL: process.env.CLOUDFLARE_BASE_URL,
    },
    dir: 'assets/images',
  },
})
