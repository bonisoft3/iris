import { createVuetify } from 'vuetify'

import { mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
      sets: {
        mdi,
      },
    },
    components,
    directives,
  })

  nuxtApp.vueApp.use(vuetify)
})
