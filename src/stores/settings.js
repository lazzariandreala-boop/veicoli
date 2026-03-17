import { defineStore } from 'pinia'
import { ref } from 'vue'
import { Preferences } from '@capacitor/preferences'

const SETTINGS_KEY = 'veicoli_gist_settings'

export const useSettingsStore = defineStore('settings', () => {
  const gistToken = ref('')
  const gistId = ref('')
  const syncStatus = ref('idle') // 'idle' | 'syncing' | 'ok' | 'error'
  const lastSync = ref(null)
  const lastError = ref('')

  async function load() {
    try {
      const { value } = await Preferences.get({ key: SETTINGS_KEY })
      if (value) {
        const s = JSON.parse(value)
        gistToken.value = s.token || ''
        gistId.value = s.gistId || ''
        lastSync.value = s.lastSync || null
      }
    } catch (e) {
      console.warn('Errore caricamento impostazioni:', e)
    }
  }

  async function save() {
    await Preferences.set({
      key: SETTINGS_KEY,
      value: JSON.stringify({
        token: gistToken.value,
        gistId: gistId.value,
        lastSync: lastSync.value
      })
    })
  }

  return { gistToken, gistId, syncStatus, lastSync, lastError, load, save }
})
