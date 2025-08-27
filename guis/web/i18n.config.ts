import messages_en from './i18n/i18n_messages/i18n_en.json'
import messages_es from './i18n/i18n_messages/i18n_es.json'
import messages_pt from './i18n/i18n_messages/i18n_pt.json'

export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'en',
  messages: {
    en: messages_en,
    es: messages_es,
    pt: messages_pt,
  },
}))
