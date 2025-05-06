import LogRocket from 'logrocket'

export default defineNuxtPlugin((nuxtApp) => {
  // https://nuxt.com/docs/getting-started/error-handling
  nuxtApp.hook('vue:error', (error, instance, info) => {
    console.error('sending error to logrocket', { error }, { instance }, { info })
    LogRocket.captureException(error as Error, { extra: { info } })
  })
  window.onunhandledrejection = (event) => {
    reportError(event.reason)
    LogRocket.captureException(new Error(`unhandled promise rejection: ${event.reason}`))
  }
})
