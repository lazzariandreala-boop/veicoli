import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { LocalNotifications } from '@capacitor/local-notifications'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { liveQuery } from 'dexie'

export default defineNuxtPlugin((nuxtApp) => {
  applyTheme(useTheme())
  const router = useRouter()

  // Riprogramma i promemoria ogni volta che cambiano veicoli, bollo, polizze o revisioni.
  let timer: ReturnType<typeof setTimeout> | undefined
  liveQuery(() => loadAllVehicleData()).subscribe({
    next: () => {
      clearTimeout(timer)
      timer = setTimeout(() => syncReminders().catch((e) => console.error('promemoria', e)), 400)
    },
  })

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
      checkPermission().then((p) => { if (p === 'prompt') requestPermission() })
    })
  }
})
