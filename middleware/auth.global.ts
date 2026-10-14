// L'accesso con Google è obbligatorio: senza account si resta sulla schermata iniziale.
export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server || to.path === '/') return
  if (!cloud.ready) await whenCloudReady()
  if (!cloud.user) return navigateTo('/')
})
