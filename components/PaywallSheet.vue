<template>
  <BottomSheet :open="paywall.open" top @close="paywall.open = false">
    <div class="pw">
      <div class="crown"><Crown :size="30" /></div>
      <h2>Veicoli Personali <span>Premium</span></h2>

      <template v-if="isPremium">
        <p class="lead">Hai già Premium: tutte le funzioni sono sbloccate.</p>
        <p v-if="premium.expires" class="faint small">Si rinnova il {{ formatDate(premium.expires.slice(0, 10)) }}</p>
        <p v-else-if="premium.grant && !premium.store" class="faint small">Attivato dal proprietario dell'app.</p>
        <a v-if="premium.store" :href="manageSubscriptionUrl()" target="_blank" class="btn block">Gestisci o disdici l'abbonamento</a>
        <button class="btn primary block" @click="paywall.open = false">Chiudi</button>
      </template>

      <template v-else>
        <p v-if="paywall.feature" class="lead"><Lock :size="15" class="lk" /> {{ LEAD[paywall.feature] }}</p>
        <p v-else class="lead">Sblocca tutto il garage con un solo abbonamento annuale.</p>

        <div class="plans">
          <div class="plan">
            <div class="eyebrow">Gratis</div>
            <ul>
              <li><Check :size="15" /> 1 veicolo</li>
              <li><Check :size="15" /> Libretto letto dalla foto</li>
              <li><Check :size="15" /> Foto del veicolo</li>
            </ul>
          </div>
          <div class="plan pro">
            <div class="eyebrow">Premium</div>
            <ul>
              <li v-for="f in LIST" :key="f" :class="{ hl: f === paywall.feature }"><Check :size="15" /> {{ SHORT[f] }}</li>
            </ul>
          </div>
        </div>

        <div class="price"><b>{{ premium.amount }}</b> all'anno</div>
        <button class="btn primary block buy" :disabled="!premium.billing || premium.busy" @click="buy">
          <LoaderCircle v-if="premium.busy" :size="19" class="spin" />
          {{ premium.billing ? 'Abbonati' : 'Abbonamenti disponibili a breve' }}
        </button>
        <button class="btn ghost block" :disabled="premium.busy" @click="restore">Ripristina acquisti</button>
        <p class="fine">
          L'abbonamento si rinnova ogni anno al prezzo indicato finché non lo disdici dalle impostazioni di {{ store }}, almeno 24 ore prima del rinnovo.
          Puoi disdirlo quando vuoi. <NuxtLink to="/termini" @click="paywall.open = false">Termini</NuxtLink> · <NuxtLink to="/privacy" @click="paywall.open = false">Privacy</NuxtLink>
        </p>
      </template>
    </div>
  </BottomSheet>
</template>

<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { Check, Crown, LoaderCircle, Lock } from 'lucide-vue-next'
import type { PremiumFeature } from '~/composables/premium'

const LIST: PremiumFeature[] = ['scadenze', 'notifiche', 'lavori', 'documenti', 'spese', 'report', 'incidenti', 'veicoli', 'foto']
const SHORT: Record<PremiumFeature, string> = {
  scadenze: 'Bollo, assicurazione, revisione',
  notifiche: 'Notifiche delle scadenze',
  lavori: 'Tagliandi e lavori',
  documenti: 'Lettura dei documenti',
  spese: 'Spese',
  report: 'Report e grafici',
  incidenti: 'Incidenti',
  veicoli: 'Veicoli illimitati',
  storia: 'Storia del veicolo',
  foto: 'Foto nel cloud',
}
const LEAD: Record<PremiumFeature, string> = {
  scadenze: 'Bollo, assicurazione e revisione sono inclusi in Premium.',
  notifiche: 'Le notifiche delle scadenze sono incluse in Premium.',
  lavori: 'Tagliandi e lavori sono inclusi in Premium.',
  documenti: 'La lettura di polizze, ricevute e fatture è inclusa in Premium.',
  spese: 'Le spese sono incluse in Premium.',
  report: 'Report e grafici sono inclusi in Premium.',
  incidenti: 'Il registro degli incidenti è incluso in Premium.',
  veicoli: 'Il piano gratuito comprende un veicolo: per aggiungerne altri passa a Premium.',
  storia: 'Storia e costi del veicolo sono inclusi in Premium.',
  foto: 'La foto nel cloud è inclusa in Premium.',
}
// cambiando pagina il foglio si chiude
const route = useRoute()
watch(() => route.fullPath, () => { paywall.open = false })
const store = Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Google Play'

async function buy() {
  try {
    if (await buyPremium()) { toast('Benvenuto in Premium!'); paywall.open = false }
  } catch (e) {
    toast(e instanceof Error ? e.message : 'Acquisto non riuscito', 'danger')
  }
}
async function restore() {
  try {
    if (await restorePremium()) { toast('Premium ripristinato'); paywall.open = false }
    else toast('Nessun abbonamento attivo su questo account', 'info')
  } catch (e) {
    toast(e instanceof Error ? e.message : 'Ripristino non riuscito', 'danger')
  }
}
</script>

<style scoped>
.pw { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 12px; padding-bottom: 6px; }
.crown { width: 64px; height: 64px; border-radius: 22px; display: grid; place-items: center; color: #fff; background: var(--grad-primary); box-shadow: var(--grad-primary-glow); margin-top: 4px; }
h2 { font-size: 23px; margin: 0; color: var(--title); }
h2 span { background: var(--grad-primary); -webkit-background-clip: text; background-clip: text; color: transparent; }
.lead { margin: 0; font-size: 15px; color: var(--text-2); max-width: 340px; }
.lk { vertical-align: -2px; margin-right: 2px; color: var(--violet); }
.small { margin: -4px 0 0; font-size: 13px; }
.plans { display: grid; grid-template-columns: 1fr 1.35fr; gap: 10px; width: 100%; text-align: left; margin-top: 4px; }
.plan { border: 1px solid var(--line-2); border-radius: 16px; padding: 12px 12px 10px; background: var(--surface-2); }
.plan.pro { border-color: transparent; background: linear-gradient(var(--surface-solid), var(--surface-solid)) padding-box, var(--grad-primary) border-box; border: 1.5px solid transparent; }
.plan ul { list-style: none; margin: 8px 0 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.plan li { display: flex; gap: 6px; align-items: flex-start; font-size: 13px; line-height: 1.25; color: var(--text); }
.plan li svg { flex: none; margin-top: 1px; color: var(--ok); }
.plan.pro li svg { color: var(--violet); }
.plan li.hl { font-weight: 700; color: var(--title); }
.price { margin-top: 6px; font-size: 15px; color: var(--text-2); }
.price b { font-family: var(--font-display); font-size: 30px; color: var(--title); }
.buy { height: 56px; font-size: 17px; }
.fine { margin: 2px 0 0; font-size: 11.5px; line-height: 1.45; color: var(--text-3); }
.fine a { color: var(--violet); font-weight: 600; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
</style>
