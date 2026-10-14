// Toast e conferme globali, senza dipendenze esterne.
interface ToastItem { id: number; text: string; tone: 'ok' | 'danger' | 'info' }
export const toasts = reactive<ToastItem[]>([])
let tid = 0
export function toast(text: string, tone: ToastItem['tone'] = 'ok') {
  const id = ++tid
  toasts.push({ id, text, tone })
  setTimeout(() => {
    const i = toasts.findIndex((t) => t.id === id)
    if (i >= 0) toasts.splice(i, 1)
  }, 2800)
}

interface ConfirmReq { title: string; text?: string; ok?: string; danger?: boolean; resolve: (v: boolean) => void }
export const confirmState = shallowRef<ConfirmReq | null>(null)
export function confirmDialog(opts: Omit<ConfirmReq, 'resolve'>) {
  return new Promise<boolean>((resolve) => { confirmState.value = { ...opts, resolve } })
}
