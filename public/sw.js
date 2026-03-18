// Service Worker — Veicoli App
const CACHE = 'veicoli-v1'

// ── Install: precache shell ──────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c =>
      c.addAll(['./', './index.html'])
        .catch(() => {}) // ignora errori su risorse non ancora presenti
    )
  )
  self.skipWaiting()
})

// ── Activate: rimuove cache vecchie ──────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch: network-first, fallback cache ─────────────────
self.addEventListener('fetch', e => {
  // Solo GET; salta chiamate API esterne
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return

  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone()
        caches.open(CACHE).then(c => c.put(e.request, clone))
        return res
      })
      .catch(() => caches.match(e.request))
  )
})

// ── Notifiche schedulate (TimestampTrigger, Chrome Android) ──
// Riceve il comando dall'app via postMessage
self.addEventListener('message', e => {
  if (e.data?.type === 'SCHEDULE_NOTIFICATIONS') {
    scheduleAll(e.data.notifications)
  }
  if (e.data?.type === 'CLEAR_NOTIFICATIONS') {
    clearForVehicle(e.data.vehicleId)
  }
})

async function scheduleAll(items) {
  if (!items?.length) return
  const supportsScheduled = 'TimestampTrigger' in self

  for (const n of items) {
    const when = new Date(n.triggerAt).getTime()
    if (when <= Date.now()) continue

    const opts = {
      body: n.body,
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: String(n.id),
      renotify: false,
      data: { url: './', vehicleId: n.vehicleId }
    }

    try {
      if (supportsScheduled) {
        // Chrome Android ≥ 80 — notifica schedulata (arriva anche a app chiusa)
        await self.registration.showNotification(n.title, {
          ...opts,
          showTrigger: new TimestampTrigger(when)
        })
      }
      // else: verrà mostrata all'apertura app (gestita in useNotifications)
    } catch (err) {
      console.warn('[SW] schedule failed:', err)
    }
  }
}

async function clearForVehicle(vehicleId) {
  try {
    const all = await self.registration.getNotifications({ includeTriggered: true })
    for (const n of all) {
      if (n.data?.vehicleId === vehicleId) n.close()
    }
  } catch (_) {}
}

// ── Click su notifica → apri app ─────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url ?? './'
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const c of clients) {
        if (c.url.includes('veicoli')) { c.focus(); return }
      }
      return self.clients.openWindow(url)
    })
  )
})
