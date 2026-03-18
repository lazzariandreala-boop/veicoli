import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

const IS_NATIVE = Capacitor.isNativePlatform()

// ── Helpers ──────────────────────────────────────────────
function makeNotifId(vehicleId, deadlineKey, daysBefore) {
  const str = `${vehicleId}_${deadlineKey}_${daysBefore}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 2147483647
}

function buildItems(vehicle, now = new Date()) {
  const deadlines = [
    { label: 'Bollo',        key: 'bollo',        date: vehicle.bollo },
    { label: 'Assicurazione', key: 'assicurazione', date: vehicle.assicurazione },
    { label: 'Revisione',    key: 'revisione',    date: vehicle.revisione }
  ]
  const items = []
  for (const { label, key, date } of deadlines) {
    if (!date) continue
    const expiry = new Date(date)
    expiry.setHours(23, 59, 59, 0)
    for (const daysBefore of [30, 15, 1]) {
      const triggerAt = new Date(expiry)
      triggerAt.setDate(triggerAt.getDate() - daysBefore)
      triggerAt.setHours(9, 0, 0, 0)
      if (triggerAt <= now) continue
      items.push({
        id: makeNotifId(vehicle.id, key, daysBefore),
        vehicleId: vehicle.id,
        title: `${label} — ${vehicle.name} (${vehicle.plate})`,
        body: daysBefore === 1
          ? '⚠️ Scade domani! Rinnovalo subito.'
          : `Scade tra ${daysBefore} giorni (${expiry.toLocaleDateString('it-IT')}).`,
        triggerAt: triggerAt.toISOString(),
        channelId: 'scadenze',
        extra: { vehicleId: vehicle.id, deadlineKey: key, daysBefore }
      })
    }
  }
  return items
}

// ── Permessi ──────────────────────────────────────────────
async function requestPermissions() {
  if (IS_NATIVE) {
    try {
      const { display } = await LocalNotifications.requestPermissions()
      return display === 'granted'
    } catch { return false }
  }
  // Web
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const perm = await Notification.requestPermission()
  return perm === 'granted'
}

// ── Scheduling ────────────────────────────────────────────
export async function scheduleVehicleNotifications(vehicle) {
  const granted = await requestPermissions()
  if (!granted) return

  const items = buildItems(vehicle)
  if (!items.length) return

  if (IS_NATIVE) {
    // Capacitor — notifiche native Android/iOS
    try {
      await LocalNotifications.schedule({
        notifications: items.map(n => ({
          id: n.id,
          title: n.title,
          body: n.body,
          schedule: { at: new Date(n.triggerAt), allowWhileIdle: true },
          channelId: n.channelId,
          extra: n.extra
        }))
      })
    } catch (e) { console.warn('[notif] native schedule error:', e) }
    return
  }

  // Web — manda al Service Worker per TimestampTrigger (Chrome Android)
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    reg.active?.postMessage({ type: 'SCHEDULE_NOTIFICATIONS', notifications: items })
  }

  // Fallback immediato: mostra subito se scadenza entro 7 giorni
  const now = new Date()
  for (const n of items) {
    const diff = (new Date(n.triggerAt) - now) / 86400000
    if (diff <= 7 && diff >= 0) {
      new Notification(n.title, {
        body: n.body,
        icon: './icon-192.png',
        tag: String(n.id)
      })
    }
  }
}

export async function cancelVehicleNotifications(vehicleId) {
  if (IS_NATIVE) {
    const keys = ['bollo', 'assicurazione', 'revisione']
    try {
      const { notifications } = await LocalNotifications.getPending()
      const toCancel = []
      for (const key of keys) {
        for (const days of [30, 15, 1]) {
          const id = makeNotifId(vehicleId, key, days)
          if (notifications.some(n => n.id === id)) toCancel.push({ id })
        }
      }
      if (toCancel.length) await LocalNotifications.cancel({ notifications: toCancel })
    } catch {}
    return
  }
  // Web — dice al SW di chiudere le notifiche di questo veicolo
  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.ready
    reg.active?.postMessage({ type: 'CLEAR_NOTIFICATIONS', vehicleId })
  }
}

export async function createNotificationChannel() {
  if (!IS_NATIVE) return
  try {
    await LocalNotifications.createChannel({
      id: 'scadenze',
      name: 'Scadenze veicoli',
      description: 'Avvisi per bollo, assicurazione e revisione',
      importance: 4,
      visibility: 1,
      vibration: true
    })
  } catch {}
}

export async function getPendingNotifications() {
  if (IS_NATIVE) {
    try {
      const { notifications } = await LocalNotifications.getPending()
      return notifications.sort((a, b) => new Date(a.schedule?.at) - new Date(b.schedule?.at))
    } catch { return [] }
  }
  return []
}

export function buildNotificationsPreview(vehicles) {
  const now = new Date()
  return vehicles
    .flatMap(v => buildItems(v, now).map(n => ({
      ...n,
      vehicleName: v.name,
      vehiclePlate: v.plate,
      vehicleType: v.type,
      label: n.title.split(' — ')[0],
      daysBefore: n.extra.daysBefore,
      expiryDate: v[n.extra.deadlineKey],
      triggerAt: new Date(n.triggerAt)
    })))
    .sort((a, b) => a.triggerAt - b.triggerAt)
}
