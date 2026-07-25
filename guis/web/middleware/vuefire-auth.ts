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
