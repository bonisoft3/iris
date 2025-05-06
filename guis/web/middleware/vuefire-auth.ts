/* eslint-disable node/prefer-global/process */ // We are using process.server from NuxtJS which is injected into our code, eslint thinks we're trying to use https://nodejs.org/api/process.html
export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (process.server)
    return
  const user = await getCurrentUser()

  if (!user) {
    return navigateTo({
      path: '/login',
      query: {
        redirect: to.fullPath,
      },
    })
  }
})
