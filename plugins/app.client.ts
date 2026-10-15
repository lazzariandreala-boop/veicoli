import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { LocalNotifications } from '@capacitor/local-notifications'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { liveQuery } from 'dexie'

export default defineNuxtPlugin((nuxtApp) => {
  applyTheme(useTheme())
  ;(window as any).__veicoliOcr = { readLibrettoOffline, ocrTexts }
  const router = useRouter()
  initCloud()

  // Errori JavaScript → Crashlytics (nell'app); gli arresti nativi li raccoglie il plugin
  nuxtApp.vueApp.config.errorHandler = (e, _vm, info) => { console.error(e); reportCrash(e, 'vue: ' + info) }
  window.addEventListener('error', (ev) => reportCrash(ev.error ?? ev.message, 'window'))
  window.addEventListener('unhandledrejection', (ev) => reportCrash(ev.reason, 'promise'))
  watch(() => cloud.user?.uid, (u) => setCrashUser(u ?? ''))

  // Riprogramma i promemoria ogni volta che cambiano veicoli, bollo, polizze o revisioni.
  let timer: ReturnType<typeof setTimeout> | undefined
  liveQuery(() => loadAllVehicleData()).subscribe({
    next: () => {
      clearTimeout(timer)
      timer = setTimeout(() => syncReminders().catch((e) => console.error('promemoria', e)), 400)
    },
  })

  // abbonamento attivato o scaduto: riprogrammo (o tolgo) i promemoria
  watch(isPremium, () => syncReminders().catch(() => {}))

  if (Capacitor.isNativePlatform()) {
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {})
    StatusBar.setBackgroundColor({ color: '#060818' }).catch(() => {})
    LocalNotifications.addListener('localNotificationActionPerformed', (e) => {
      const id = e.notification.extra?.vehicleId
      if (id) router.push(`/veicoli/${id}`)
    })
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack && router.currentRoute.value.path !== '/') router.back()
      else App.minimizeApp()
    })
    App.addListener('resume', () => syncReminders().catch(() => {}))
    nuxtApp.hook('app:mounted', () => {
      setTimeout(() => SplashScreen.hide().catch(() => {}), 150)
      // il permesso lo chiedo solo a chi può usare le notifiche
      checkPermission().then((p) => { if (p === 'prompt' && isPremium.value) requestPermission() })
    })
  }
})
