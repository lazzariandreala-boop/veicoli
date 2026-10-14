<template>
  <div class="card cloud">
    <template v-if="cloud.user">
      <img v-if="cloud.user.photo" :src="cloud.user.photo" class="avatar" alt="" referrerpolicy="no-referrer" />
      <div v-else class="avatar"><UserRound :size="22" /></div>
      <div class="grow">
        <strong>{{ cloud.user.name || 'Account Google' }}</strong>
        <div class="faint" style="font-size: 13px">{{ cloud.user.email }}</div>
        <div class="state" :class="cloud.status"><component :is="icon" :size="14" /> {{ statusText }}</div>
      </div>
      <button class="btn sm ghost" @click="logout">Esci</button>
    </template>
    <template v-else>
      <div class="avatar"><CloudUpload :size="22" /></div>
      <div class="grow">
        <strong>Salva i dati nel cloud</strong>
        <div class="faint" style="font-size: 13px">Accedi con Google: veicoli, scadenze, spese e foto dei veicoli tornano da soli se reinstalli l'app o cambi telefono. I file dei documenti restano sul telefono.</div>
        <p v-if="cloud.error" class="err">{{ cloud.error }}</p>
      </div>
    </template>
  </div>
  <button v-if="!cloud.user" class="btn block google" :disabled="busy" @click="login">
    <svg width="19" height="19" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
    {{ busy ? 'Accesso in corso…' : 'Accedi con Google' }}
  </button>
</template>
<script setup lang="ts">
import { CloudAlert, CloudCheck, CloudOff, CloudUpload, LoaderCircle, UserRound } from 'lucide-vue-next'

const busy = ref(false)
const icon = computed(() => ({ ok: CloudCheck, offline: CloudOff, error: CloudAlert }[cloud.status as string] ?? LoaderCircle))
const statusText = computed(() => {
  if (cloud.status === 'ok') return `Tutto salvato${cloud.lastSync ? ' · ' + new Date(cloud.lastSync).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''}`
  if (cloud.status === 'offline') return 'Senza rete: invio appena torna la connessione'
  if (cloud.status === 'error') return 'Errore: ' + cloud.error
  return cloud.pending ? `Invio ${cloud.pending} modifiche…` : 'Sincronizzazione…'
})
async function login() {
  busy.value = true
  try {
    if (await signInWithGoogle()) toast('Accesso fatto: i dati vengono salvati nel cloud')
  } catch (e) {
    console.error(e)
    cloud.error = e instanceof Error ? e.message : String(e)
    toast('Accesso non riuscito', 'danger')
  } finally {
    busy.value = false
  }
}
async function logout() {
  if (!(await confirmDialog({ title: 'Uscire dall\'account?', text: 'I dati restano su questo telefono ma non vengono più salvati nel cloud.', ok: 'Esci' }))) return
  await signOutCloud()
  toast('Uscito dall\'account')
}
</script>
<style scoped>
.cloud { display: flex; gap: 14px; align-items: flex-start; }
.avatar { width: 46px; height: 46px; flex: none; border-radius: 50%; display: grid; place-items: center; color: #fff; background: var(--grad-primary); object-fit: cover; }
.state { display: inline-flex; align-items: center; gap: 6px; margin-top: 6px; font-size: 12.5px; font-weight: 600; color: var(--text-2); }
.state.ok { color: var(--ok); }
.state.error { color: var(--danger); }
.state.syncing svg, .state.connecting svg { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
.err { color: var(--danger); font-size: 13px; font-weight: 600; margin: 6px 0 0; }
.google { margin-top: 10px; background: #fff; color: #1f1f1f; border-color: rgba(0, 0, 0, .12); }
</style>
