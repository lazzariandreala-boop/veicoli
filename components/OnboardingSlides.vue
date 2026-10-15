<template>
  <Transition name="ob">
    <div v-if="show" class="ob" role="dialog" aria-label="Benvenuto">
      <button v-if="i < SLIDES.length - 1" class="skip" @click="done()">Salta</button>
      <div ref="track" class="track" @scroll.passive="onScroll">
        <section v-for="(s, n) in SLIDES" :key="n" class="slide">
          <div class="orb" :style="{ '--c1': s.c1, '--c2': s.c2 }"><component :is="s.icon" :size="54" :stroke-width="1.6" /></div>
          <span v-if="s.pro" class="pro">Premium</span>
          <h2>{{ s.title }}</h2>
          <p>{{ s.text }}</p>
        </section>
      </div>
      <div class="dots"><i v-for="(_, n) in SLIDES" :key="n" :class="{ on: n === i }" /></div>
      <div class="actions">
        <template v-if="i < SLIDES.length - 1">
          <button class="btn primary block big" @click="go(i + 1)">Avanti <ArrowRight :size="20" /></button>
        </template>
        <template v-else>
          <button class="btn primary block big" @click="done()">Inizia gratis</button>
          <button class="btn ghost block light" @click="done(true)"><Crown :size="18" /> Scopri Premium</button>
        </template>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ArrowRight, BellRing, Crown, ScanLine, Wallet } from 'lucide-vue-next'

const KEY = 'veicoli.onboarded'
const SLIDES = [
  { icon: ScanLine, c1: '#4f5bff', c2: '#22e5ff', title: 'Il libretto si legge da solo', text: 'Fotografa la carta di circolazione: marca, modello, targa e dati tecnici si compilano in automatico, direttamente sul telefono.' },
  { icon: BellRing, c1: '#7c4dff', c2: '#ff8a3d', pro: true, title: 'Mai più una scadenza dimenticata', text: 'Bollo, assicurazione e revisione con le date calcolate per te e una notifica prima di ogni scadenza.' },
  { icon: Wallet, c1: '#d946ef', c2: '#19e3b1', pro: true, title: 'Ogni euro sotto controllo', text: 'Tagliandi, riparazioni e spese con foto e fatture, e i report su quanto ti costa davvero ogni veicolo.' },
  { icon: Crown, c1: '#4f5bff', c2: '#d946ef', title: 'Inizia gratis', text: `Il piano gratuito comprende un veicolo con libretto e foto. Premium sblocca tutto a ${PREMIUM_PRICE} all'anno.` },
]

const seen = ref(true)
onMounted(() => { try { seen.value = !!localStorage.getItem(KEY) } catch { seen.value = true } })
const show = computed(() => !seen.value && !!cloud.user && (cloud.status === 'ok' || cloud.status === 'offline'))

const i = ref(0)
const track = ref<HTMLElement>()
function onScroll() {
  const el = track.value
  if (el) i.value = Math.round(el.scrollLeft / el.clientWidth)
}
function go(n: number) {
  const el = track.value
  if (el) el.scrollTo({ left: n * el.clientWidth, behavior: 'smooth' })
  i.value = n
}
function done(pro = false) {
  try { localStorage.setItem(KEY, '1') } catch {}
  seen.value = true
  if (pro) openPaywall()
}
</script>

<style scoped>
.ob { position: fixed; inset: 0; z-index: 70; display: flex; flex-direction: column; padding: calc(var(--safe-top) + 12px) 0 calc(var(--safe-bottom) + 20px); color: #fff;
  background: radial-gradient(90% 55% at 50% 30%, #2a2366 0%, #110d33 55%, #06061a 100%); }
.skip { position: absolute; top: calc(var(--safe-top) + 12px); right: 16px; z-index: 2; background: none; border: 0; color: rgba(230, 230, 255, .75); font: inherit; font-weight: 600; font-size: 15px; padding: 10px; cursor: pointer; }
.track { flex: 1; display: flex; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; }
.track::-webkit-scrollbar { display: none; }
.slide { flex: 0 0 100%; scroll-snap-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 0 32px; gap: 14px; }
.orb { width: 150px; height: 150px; border-radius: 50%; display: grid; place-items: center; margin-bottom: 18px; color: #fff;
  background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, .35), transparent 45%), linear-gradient(140deg, var(--c1), var(--c2));
  box-shadow: 0 0 60px -6px var(--c1), 0 0 110px -20px var(--c2), inset 0 0 0 2px rgba(255, 255, 255, .25); animation: float 5s ease-in-out infinite; }
.pro { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; padding: 4px 10px; border-radius: 8px; background: linear-gradient(90deg, #4f5bff, #d946ef); }
h2 { margin: 0; font-size: 26px; line-height: 1.15; max-width: 340px; font-family: var(--font-display); }
p { margin: 0; font-size: 16px; line-height: 1.5; color: rgba(225, 228, 255, .8); max-width: 360px; }
.dots { display: flex; justify-content: center; gap: 8px; margin: 10px 0 22px; }
.dots i { width: 8px; height: 8px; border-radius: 99px; background: rgba(255, 255, 255, .25); transition: width .25s, background .25s; }
.dots i.on { width: 26px; background: #fff; }
.actions { display: flex; flex-direction: column; gap: 8px; padding: 0 24px; max-width: 440px; width: 100%; margin: 0 auto; }
.big { height: 58px; font-size: 17px; border-radius: 18px; }
.light { color: #fff; }
@keyframes float { 50% { transform: translateY(-10px); } }
.ob-enter-active, .ob-leave-active { transition: opacity .3s ease; }
.ob-enter-from, .ob-leave-to { opacity: 0; }
</style>
