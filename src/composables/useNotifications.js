import { LocalNotifications } from '@capacitor/local-notifications'

// Genera un ID numerico stabile da stringa (evita collisioni tra veicoli/scadenze)
function makeNotifId(vehicleId, deadlineKey, daysBefore) {
  const str = `${vehicleId}_${deadlineKey}_${daysBefore}`
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash) % 2147483647
}

async function requestPermissions() {
  try {
    const { display } = await LocalNotifications.requestPermissions()
    return display === 'granted'
  } catch (e) {
    console.warn('Permessi notifiche non disponibili (ambiente web?):', e)
    return false
  }
}

/**
 * Pianifica le notifiche per un singolo veicolo.
 * Trigger: 30gg, 15gg, 1gg prima di ogni scadenza.
 */
export async function scheduleVehicleNotifications(vehicle) {
  const granted = await requestPermissions()
  if (!granted) return

  const deadlines = [
    { label: 'Bollo', key: 'bollo', date: vehicle.bollo },
    { label: 'Assicurazione', key: 'assicurazione', date: vehicle.assicurazione },
    { label: 'Revisione', key: 'revisione', date: vehicle.revisione }
  ]

  const notifications = []
  const now = new Date()

  for (const { label, key, date } of deadlines) {
    if (!date) continue
    const expiry = new Date(date)
    expiry.setHours(23, 59, 59, 0)

    for (const daysBefore of [30, 15, 1]) {
      const triggerAt = new Date(expiry)
      triggerAt.setDate(triggerAt.getDate() - daysBefore)
      triggerAt.setHours(9, 0, 0, 0)

      if (triggerAt <= now) continue

      let body = ''
      if (daysBefore === 1) {
        body = `⚠️ Scade domani! Assicurati di rinnovarlo in tempo.`
      } else {
        body = `Scade tra ${daysBefore} giorni (${expiry.toLocaleDateString('it-IT')}).`
      }

      notifications.push({
        id: makeNotifId(vehicle.id, key, daysBefore),
        title: `${label} — ${vehicle.name} (${vehicle.plate})`,
        body,
        schedule: { at: triggerAt, allowWhileIdle: true },
        channelId: 'scadenze',
        extra: {
          vehicleId: vehicle.id,
          deadlineKey: key,
          daysBefore
        }
      })
    }
  }

  if (!notifications.length) return

  try {
    await LocalNotifications.schedule({ notifications })
    console.log(`Pianificate ${notifications.length} notifiche per ${vehicle.name}`)
  } catch (e) {
    console.warn('Errore scheduling notifiche:', e)
  }
}

/**
 * Cancella tutte le notifiche pianificate per un veicolo.
 */
export async function cancelVehicleNotifications(vehicleId) {
  const keys = ['bollo', 'assicurazione', 'revisione']
  const daysList = [30, 15, 1]

  const pending = []
  try {
    const { notifications } = await LocalNotifications.getPending()
    pending.push(...notifications)
  } catch (e) {
    return
  }

  const toCancel = []
  for (const key of keys) {
    for (const days of daysList) {
      const id = makeNotifId(vehicleId, key, days)
      if (pending.some(n => n.id === id)) {
        toCancel.push({ id })
      }
    }
  }

  if (toCancel.length) {
    try {
      await LocalNotifications.cancel({ notifications: toCancel })
    } catch (e) {
      console.warn('Errore cancellazione notifiche:', e)
    }
  }
}

/**
 * Crea il canale notifiche Android (chiamare all'avvio dell'app).
 */
export async function createNotificationChannel() {
  try {
    await LocalNotifications.createChannel({
      id: 'scadenze',
      name: 'Scadenze veicoli',
      description: 'Avvisi per bollo, assicurazione e revisione',
      importance: 4, // HIGH
      visibility: 1,
      vibration: true
    })
  } catch (e) {
    // Canali non supportati su iOS o browser
  }
}

/**
 * Ritorna la lista delle notifiche pianificate (per la view Notifiche).
 */
export async function getPendingNotifications() {
  try {
    const { notifications } = await LocalNotifications.getPending()
    return notifications.sort((a, b) => new Date(a.schedule?.at) - new Date(b.schedule?.at))
  } catch (e) {
    return []
  }
}

/**
 * Genera la lista "virtuale" di notifiche da veicoli (per preview anche in browser).
 */
export function buildNotificationsPreview(vehicles) {
  const now = new Date()
  const items = []

  vehicles.forEach(vehicle => {
    const deadlines = [
      { label: 'Bollo', key: 'bollo', date: vehicle.bollo },
      { label: 'Assicurazione', key: 'assicurazione', date: vehicle.assicurazione },
      { label: 'Revisione', key: 'revisione', date: vehicle.revisione }
    ]

    deadlines.forEach(({ label, key, date }) => {
      if (!date) return
      const expiry = new Date(date)

      ;[30, 15, 1].forEach(daysBefore => {
        const triggerAt = new Date(expiry)
        triggerAt.setDate(triggerAt.getDate() - daysBefore)
        triggerAt.setHours(9, 0, 0, 0)

        if (triggerAt <= now) return

        items.push({
          id: makeNotifId(vehicle.id, key, daysBefore),
          vehicleName: vehicle.name,
          vehiclePlate: vehicle.plate,
          vehicleType: vehicle.type,
          label,
          key,
          daysBefore,
          triggerAt,
          expiryDate: date
        })
      })
    })
  })

  return items.sort((a, b) => a.triggerAt - b.triggerAt)
}
