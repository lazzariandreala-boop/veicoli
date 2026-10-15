<template>
  <div v-if="page" class="page lock-page" :class="{ 'no-nav': back }">
    <header class="topbar">
      <button v-if="back" class="icon-btn" aria-label="Indietro" @click="goBack"><ChevronLeft :size="22" /></button>
      <h1>{{ title }}</h1>
    </header>
    <div class="lock-hero">
      <div class="lock-ico"><Lock :size="34" /></div>
      <h2>Funzione Premium</h2>
      <p>{{ FEATURE_TEXT[feature] }}.</p>
      <p class="faint">Con il piano gratuito puoi registrare un veicolo con libretto e foto. Premium sblocca tutto il resto a {{ premium.price }}.</p>
      <button class="btn primary block" @click="openPaywall(feature)"><Crown :size="19" /> Scopri Premium</button>
    </div>
  </div>
  <button v-else class="card flat lock-card" type="button" @click="openPaywall(feature)">
    <div class="icon-bubble accent"><Lock :size="19" /></div>
    <div class="grow">
      <strong>{{ title }} <span class="badge">Premium</span></strong>
      <div class="faint">{{ FEATURE_TEXT[feature] }}</div>
    </div>
    <ChevronRight :size="18" class="faint" />
  </button>
</template>

<script setup lang="ts">
import { ChevronLeft, ChevronRight, Crown, Lock } from 'lucide-vue-next'
import type { PremiumFeature } from '~/composables/premium'

defineProps<{ feature: PremiumFeature; title: string; page?: boolean; back?: boolean }>()
const router = useRouter()
const goBack = () => (window.history.length > 1 ? router.back() : navigateTo('/'))
</script>

<style scoped>
.lock-hero { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 36px 8px 0; max-width: 420px; margin: 0 auto; }
.lock-ico { width: 84px; height: 84px; border-radius: 28px; display: grid; place-items: center; color: #fff; background: var(--grad-primary); box-shadow: var(--grad-primary-glow); margin-bottom: 8px; }
.lock-hero h2 { margin: 0; font-size: 22px; color: var(--title); }
.lock-hero p { margin: 0; font-size: 15px; color: var(--text-2); }
.lock-hero .faint { font-size: 13.5px; color: var(--text-3); margin-bottom: 12px; }
.lock-card { display: flex; align-items: center; gap: 12px; width: 100%; text-align: left; cursor: pointer; color: inherit; font: inherit; }
.lock-card strong { font-size: 15px; display: flex; align-items: center; gap: 8px; }
.lock-card .faint { font-size: 13px; margin-top: 2px; }
.badge { font-size: 10.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; color: #fff; padding: 2px 7px; border-radius: 6px; background: var(--grad-primary); }
</style>
