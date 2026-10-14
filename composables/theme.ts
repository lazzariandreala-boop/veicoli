const KEY = 'veicoli.theme'
const current = ref('auto')
const systemDark = ref(true)
let mq: MediaQueryList | undefined

export function useTheme() {
  try { return localStorage.getItem(KEY) ?? 'auto' } catch { return 'auto' }
}
export function applyTheme(t: string) {
  try { localStorage.setItem(KEY, t) } catch {}
  current.value = t
  if (t === 'auto') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', t)
}
/** true quando l'app è in tema scuro (scelto o di sistema). */
export function useIsDark() {
  if (!mq && typeof window !== 'undefined') {
    mq = window.matchMedia('(prefers-color-scheme: dark)')
    systemDark.value = mq.matches
    mq.addEventListener('change', (e) => { systemDark.value = e.matches })
    current.value = useTheme()
  }
  return computed(() => (current.value === 'auto' ? systemDark.value : current.value === 'dark'))
}
