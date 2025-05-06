// https://nuxt.com/docs/api/configuration/nuxt-config
import { join as pathjoin } from 'node:path'
import process from 'node:process'
import mkcert from 'vite-plugin-mkcert'
import pkg from './package.json'

// dummy change

export default async () => {
  const services_tracker_url_prefix = process.env.SERVICES_TRACKER_URL_PREFIX || 'http://localhost:18080/'
  const services_pgrst_url_prefix = process.env.SERVICES_PGRST_URL_PREFIX || 'http://localhost:28080/'
  const geolocation_url_prefix = process.env.GEOLOCATION_URL_PREFIX || 'http://localhost:38080/'
  return defineNuxtConfig({
		compatibilityDate: '2024-11-03',
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
      shim: false,
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
      '@zadigetvoltaire/nuxt-gtm',
      'nuxt-vuefire',
      '@nuxtjs/google-fonts',
      '@nuxt/test-utils/module',
      '@nuxtjs/i18n',
      // nuxt-pwa is too slow, only enables it in prod: https://stackoverflow.com/a/74572446
      ...(((process.env.NODE_ENV !== 'development') || (process.env.APP_ENV === 'preview')) ? ['@kevinmarrec/nuxt-pwa'] : []),
      // logrocket generates too much noise on debugging
      ...(process.env.NODE_ENV !== 'development' ? ['nuxt-logrocket'] : []),
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
    logRocket: {
      id: 'v8rkrf/iris',
      dev: false,
    },
    gtm: {
      id: 'GTM-PV65H75F',
    },
    pwa: {
      meta: {
        mobileAppIOS: true,
      },
      manifest: {
        name: 'Iris',
        short_name: 'Iris - see through the waste',
        orientation: 'any',
        categories: ['lifestyle'],
        prefer_related_applications: true,
        related_applications: [
          {
            platform: 'play',
            id: 'com.trash.tracker',
            url: 'https://play.google.com/store/apps/details?id=com.trash.tracker',
          },
        ],
      },
      icon: {
        maskablePadding: 0, // hidden flag with default of 20 which breaks our icon
        // The maskable icon is used in android mostly. It is a square with no
        // transparency which gets cut at read time. As long as there is enough
        // border to cut, it will look great.
        maskableSource: 'assets/icons/maskable-icon-512x512.svg',
        // The regular icon has a transparent border, and will be used by favico, desktop
        // and other places.
        source: 'assets/icons/any-icon-512x512.png',
        // IOS in theory need a non-transparent background (https://github.com/nuxt-community/pwa-module/issues/392)
        // and this extension simply gets the last icon in the pwa manifest which happens
        // to be the 512x512 maskable icon. However, it seems newer versions of
        // IOS respect the transparency with a small glitch the moment the icon
        // is first shown before installation. Since this is almost
        // unnoticeable, we do not care fixing it.

        // https://blog.expo.dev/enabling-ios-splash-screens-for-progressive-web-apps-34f06f096e5c
        // splash: { },
        // purpose: [ "maskable" ]  not consumed by kevinmarrec/nuxt-pwa
      },
      workbox: {
        // offlineAssets: [], // https://github.com/kevinmarrec/nuxt-pwa-module/issues/95,
        // We precache critical external assets over >1MB as a rule of thumb
        preCaching: [
          'https://storage.googleapis.com/mediapipe-tasks/object_detector/efficientdet_lite0_uint8.tflite',
          'https://storage.googleapis.com/mediapipe-models/image_segmenter/deeplab_v3/float32/1/deeplab_v3.tflite',
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm/vision_wasm_internal.wasm',
        ],
        enabled: (process.env.NODE_ENV !== 'development') || (process.env.APP_ENV === 'preview'),
      },
    },
    i18n: {
      locales: [
        {
          code: 'en',
          name: 'English',
        },
        {
          code: 'es',
          name: 'Español',
        },
        {
          code: 'pt',
          name: 'Português',
        },
      ],
      defaultLocale: 'en',
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
}
