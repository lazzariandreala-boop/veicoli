<template>
  <button type="button" class="autofill" @click="go">
    <span class="ico"><ScanText :size="19" /></span>
    <span class="grow"><strong>Compila da foto o PDF</strong><small>Leggo {{ what }} e riempio i campi</small></span>
    <ChevronRight :size="18" />
  </button>
</template>
<script setup lang="ts">
import { ChevronRight, ScanText } from 'lucide-vue-next'
import type { DocKind } from '~/utils/documents'

const props = defineProps<{ vehicleId: string; kind: DocKind; what: string }>()
const emit = defineEmits<{ go: [] }>()
const router = useRouter()
function go() {
  emit('go')
  router.push(`/documento?veicolo=${props.vehicleId}&tipo=${props.kind}`)
}
</script>
<style scoped>
.autofill { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px; border-radius: 16px; cursor: pointer; text-align: left; color: var(--text);
  background: var(--accent-soft); border: 1px dashed color-mix(in srgb, var(--accent) 55%, transparent); font: inherit; }
.ico { width: 38px; height: 38px; flex: none; border-radius: 12px; display: grid; place-items: center; color: #fff; background: var(--grad-primary); }
.grow { display: flex; flex-direction: column; gap: 2px; }
strong { font-size: 14.5px; }
small { font-size: 12.5px; color: var(--text-2); }
</style>
