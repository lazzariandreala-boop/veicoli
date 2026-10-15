<template>
  <div class="page no-nav legal">
    <header class="topbar">
      <button class="icon-btn" aria-label="Indietro" @click="back"><ChevronLeft :size="22" /></button>
      <h1 class="title-sm">{{ title }}</h1>
    </header>
    <p class="faint upd">Ultimo aggiornamento: {{ LEGAL.updated }}</p>
    <section v-for="s in sections" :key="s.h">
      <h2>{{ s.h }}</h2>
      <p v-for="(t, n) in s.p" :key="n" :class="{ li: t.startsWith('• ') }">{{ t.replace(/^• /, '') }}</p>
    </section>
  </div>
</template>
<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import { LEGAL, type LegalSection } from '~/utils/legal'

defineProps<{ title: string; sections: LegalSection[] }>()
const router = useRouter()
const back = () => (window.history.length > 1 ? router.back() : navigateTo('/'))
</script>
<style scoped>
.legal { max-width: 680px; }
.upd { margin: -6px 0 18px; font-size: 13px; }
section { margin-bottom: 20px; }
h2 { font-size: 17px; margin: 0 0 8px; color: var(--title); }
p { margin: 0 0 8px; font-size: 14.5px; line-height: 1.55; color: var(--text); }
p.li { position: relative; padding-left: 16px; }
p.li::before { content: ''; position: absolute; left: 3px; top: .65em; width: 5px; height: 5px; border-radius: 50%; background: var(--violet); }
</style>
