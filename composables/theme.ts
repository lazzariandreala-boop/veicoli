const KEY = 'veicoli.theme'
export function useTheme() {
  try { return localStorage.getItem(KEY) ?? 'auto' } catch { return 'auto' }
}
export function applyTheme(t: string) {
  try { localStorage.setItem(KEY, t) } catch {}
  if (t === 'auto') document.documentElement.removeAttribute('data-theme')
  else document.documentElement.setAttribute('data-theme', t)
}
