import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { buildReminders, type Reminder } from '~/utils/deadlines'

const CHANNEL = 'scadenze'
export const isNative = () => Capacitor.isNativePlatform()

export const notificationState = reactive({
  permission: 'unknown' as 'granted' | 'denied' | 'prompt' | 'unknown' | 'web',
  scheduled: 0,
  lastSync: 0 as number,
  upcoming: [] as Reminder[],
})

export async function ensureChannel() {
  if (Capacitor.getPlatform() !== 'android') return
  await LocalNotifications.createChannel({
    id: CHANNEL,
    name: 'Scadenze',
    description: 'Bollo, assicurazione e revisione',
    importance: 5,
    visibility: 1,
    vibration: true,
    lights: true,
    lightColor: '#7c5cff',
  })
}

export async function checkPermission() {
  if (!isNative()) {
    notificationState.permission = 'web'
    return notificationState.permission
  }
  const p = await LocalNotifications.checkPermissions()
  notificationState.permission = p.display === 'granted' ? 'granted' : p.display === 'denied' ? 'denied' : 'prompt'
  return notificationState.permission
}

export async function requestPermission() {
  if (!isNative()) return 'web'
  const p = await LocalNotifications.requestPermissions()
  notificationState.permission = p.display === 'granted' ? 'granted' : p.display === 'denied' ? 'denied' : 'prompt'
  return notificationState.permission
}

/** Cancella e riprogramma tutti i promemoria a partire dai dati attuali. */
export async function syncReminders() {
  const data = await loadAllVehicleData()
  const reminders = buildReminders(data)
  notificationState.upcoming = reminders
  notificationState.lastSync = Date.now()
  if (!isNative()) return
  if ((await checkPermission()) !== 'granted') return
  await ensureChannel()
  const pending = await LocalNotifications.getPending()
  if (pending.notifications.length) {
    await LocalNotifications.cancel({ notifications: pending.notifications.map((n) => ({ id: n.id })) })
  }
  // Android accetta al massimo ~500 allarmi per app: teniamo i più vicini
  const batch = reminders.slice(0, 400)
  if (batch.length) {
    await LocalNotifications.schedule({
      notifications: batch.map((r) => ({
        id: r.id,
        title: r.title,
        body: r.body,
        largeBody: r.body,
        channelId: CHANNEL,
        smallIcon: 'ic_stat_veicoli',
        iconColor: '#7c5cff',
        schedule: { at: r.at, allowWhileIdle: true },
        extra: { vehicleId: r.vehicleId, kind: r.kind },
      })),
    })
  }
  notificationState.scheduled = batch.length
}

export async function sendTestNotification() {
  if (!isNative()) {
    if ('Notification' in window) {
      const p = await Notification.requestPermission()
      if (p === 'granted') new Notification('Veicoli', { body: 'Le notifiche funzionano.' })
    }
    return
  }
  if ((await requestPermission()) !== 'granted') return
  await ensureChannel()
  await LocalNotifications.schedule({
    notifications: [{ id: 1, title: 'Veicoli', body: 'Le notifiche funzionano: riceverai così i promemoria delle scadenze.', channelId: CHANNEL, smallIcon: 'ic_stat_veicoli', iconColor: '#7c5cff', schedule: { at: new Date(Date.now() + 3000), allowWhileIdle: true } }],
  })
}
