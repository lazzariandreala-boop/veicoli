// Accesso con Google obbligatorio: senza account si resta sulla schermata iniziale.
// Informativa privacy e termini restano leggibili anche prima dell'accesso.
const PUBLIC = ['/', '/privacy', '/termini']

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (import.meta.server || PUBLIC.includes(to.path)) return
  if (!cloud.ready) await whenCloudReady()
  if (!cloud.user) return navigateTo('/')
  // Piano gratuito: un solo veicolo
  if (to.path === '/veicoli/nuovo' && !isPremium.value && (await db().vehicles.count()) >= FREE_VEHICLES) {
    openPaywall('veicoli')
    return from.path !== to.path && from.matched.length ? abortNavigation() : navigateTo('/veicoli')
  }
})
