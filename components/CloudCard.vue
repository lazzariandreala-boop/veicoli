<template>
  <div class="card cloud">
    <template v-if="cloud.user">
      <UserAvatar :size="52" />
      <div class="grow">
        <strong>{{ cloud.user.name || 'Account Google' }}</strong>
        <div class="faint" style="font-size: 13px">{{ cloud.user.email }}</div>
        <div class="state" :class="cloud.status"><component :is="icon" :size="14" /> {{ statusText }}</div>
        <button v-if="cloud.status === 'error'" class="btn sm" style="margin-top: 8px" @click="retrySync">Riprova</button>
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
    <GoogleLogo />
    {{ busy ? 'Accesso in corso…' : 'Accedi con Google' }}
  </button>
</template>
<script setup lang="ts">
import { CloudAlert, CloudCheck, CloudOff, CloudUpload, LoaderCircle } from 'lucide-vue-next'

const busy = ref(false)
const icon = computed(() => ({ ok: CloudCheck, offline: CloudOff, error: CloudAlert }[cloud.status as string] ?? LoaderCircle))
const statusText = computed(() => {
  if (cloud.status === 'ok') return `Tutto salvato${cloud.lastSync ? ' · ' + new Date(cloud.lastSync).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : ''}`
  if (cloud.status === 'offline') return 'Senza rete: invio appena torna la connessione'
  if (cloud.status === 'error') return cloud.error
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
  if (!(await confirmDialog({ title: 'Uscire dall\'account?', text: 'Per usare di nuovo l\'app dovrai rifare l\'accesso con Google.', ok: 'Esci' }))) return
  await signOutCloud()
  toast('Uscito dall\'account')
  navigateTo('/')
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
