import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Preferences } from '@capacitor/preferences'
import { scheduleVehicleNotifications, cancelVehicleNotifications } from '../composables/useNotifications'
import { pullFromGist, pushToGist } from '../composables/useGistSync'
import { useSettingsStore } from './settings'

const STORAGE_KEY = 'veicoli_app_vehicles'

export const useVehiclesStore = defineStore('vehicles', () => {
  const vehicles = ref([])
  const loaded = ref(false)

  // ─── Computed ───────────────────────────────────────────────────────────────

  const vehiclesSortedByUrgency = computed(() =>
    [...vehicles.value].sort((a, b) => {
      const minA = getMinDays(a)
      const minB = getMinDays(b)
      return minA - minB
    })
  )

  const upcomingDeadlines = computed(() => {
    const items = []
    vehicles.value.forEach(v => {
      const deadlines = [
        { label: 'Bollo', key: 'bollo', date: v.bollo },
        { label: 'Assicurazione', key: 'assicurazione', date: v.assicurazione },
        { label: 'Revisione', key: 'revisione', date: v.revisione }
      ]
      deadlines.forEach(d => {
        if (d.date) {
          items.push({
            vehicleId: v.id,
            vehicleName: v.name,
            vehiclePlate: v.plate,
            vehicleType: v.type,
            label: d.label,
            key: d.key,
            date: d.date,
            days: daysUntil(d.date)
          })
        }
      })
    })
    return items.sort((a, b) => a.days - b.days)
  })

  const stats = computed(() => {
    let ok = 0, warn = 0, danger = 0
    vehicles.value.forEach(v => {
      const min = getMinDays(v)
      if (min < 0 || min <= 15) danger++
      else if (min <= 30) warn++
      else ok++
    })
    return { ok, warn, danger, total: vehicles.value.length }
  })

  // ─── Helpers ────────────────────────────────────────────────────────────────

  function daysUntil(dateStr) {
    if (!dateStr) return Infinity
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(dateStr); d.setHours(0, 0, 0, 0)
    return Math.round((d - today) / 86400000)
  }

  function getMinDays(vehicle) {
    const dates = [vehicle.bollo, vehicle.assicurazione, vehicle.revisione].filter(Boolean)
    if (!dates.length) return Infinity
    return Math.min(...dates.map(daysUntil))
  }

  // ─── Persistence ────────────────────────────────────────────────────────────

  async function saveLocal() {
    try {
      await Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(vehicles.value) })
    } catch (e) {
      console.warn('Errore salvataggio locale:', e)
    }
  }

  async function load() {
    // 1. Load from local storage first (fast)
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEY })
      if (value) vehicles.value = JSON.parse(value)
    } catch (e) {
      console.warn('Errore caricamento locale:', e)
    }

    // 2. Try Gist sync (merge: use newer data)
    const settings = useSettingsStore()
    if (settings.gistToken && settings.gistId) {
      try {
        settings.syncStatus = 'syncing'
        const remote = await pullFromGist(settings.gistToken, settings.gistId)
        if (remote && Array.isArray(remote.vehicles)) {
          const localMax = vehicles.value.reduce((max, v) => {
            const d = new Date(v.updatedAt || v.createdAt || 0).getTime()
            return d > max ? d : max
          }, 0)
          const remoteUpdated = remote.updatedAt ? new Date(remote.updatedAt).getTime() : 0
          if (remoteUpdated > localMax || vehicles.value.length === 0) {
            vehicles.value = remote.vehicles
            await saveLocal()
          }
        }
        settings.syncStatus = 'ok'
        settings.lastSync = new Date().toISOString()
        await settings.save()
      } catch (e) {
        settings.syncStatus = 'error'
        settings.lastError = e.message
        console.warn('Errore Gist sync:', e)
      }
    }

    loaded.value = true
  }

  async function save() {
    await saveLocal()
    // Push to Gist in background
    const settings = useSettingsStore()
    if (settings.gistToken && settings.gistId) {
      try {
        settings.syncStatus = 'syncing'
        await pushToGist(settings.gistToken, settings.gistId, vehicles.value)
        settings.syncStatus = 'ok'
        settings.lastSync = new Date().toISOString()
        await settings.save()
      } catch (e) {
        settings.syncStatus = 'error'
        settings.lastError = e.message
        console.warn('Errore push Gist:', e)
      }
    }
  }

  // ─── Actions ────────────────────────────────────────────────────────────────

  async function addVehicle(vehicleData) {
    const vehicle = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...vehicleData
    }
    vehicles.value.push(vehicle)
    await save()
    await scheduleVehicleNotifications(vehicle)
    return vehicle
  }

  async function updateVehicle(id, vehicleData) {
    const idx = vehicles.value.findIndex(v => v.id === id)
    if (idx === -1) return null
    vehicles.value[idx] = { ...vehicles.value[idx], ...vehicleData, updatedAt: new Date().toISOString() }
    await save()
    await cancelVehicleNotifications(id)
    await scheduleVehicleNotifications(vehicles.value[idx])
    return vehicles.value[idx]
  }

  async function deleteVehicle(id) {
    await cancelVehicleNotifications(id)
    vehicles.value = vehicles.value.filter(v => v.id !== id)
    await save()
  }

  function getVehicleById(id) {
    return vehicles.value.find(v => v.id === id)
  }

  return {
    vehicles,
    loaded,
    vehiclesSortedByUrgency,
    upcomingDeadlines,
    stats,
    load,
    save,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicleById,
    daysUntil
  }
})
