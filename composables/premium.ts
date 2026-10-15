import { Capacitor } from '@capacitor/core'

// Piano gratuito: un veicolo con libretto e foto. Tutto il resto è Premium (abbonamento annuale).
// Gli acquisti passano da RevenueCat, che parla con Google Play e App Store.
// Le chiavi pubbliche si trovano nel pannello RevenueCat → Project settings → API keys: finché sono vuote
// il pulsante "Abbonati" resta disattivato con la scritta "disponibile a breve".
export const RC_KEYS = { android: '', ios: '' }
export const ENTITLEMENT = 'premium'
export const PREMIUM_PRICE = '9,99 €'
export const FREE_VEHICLES = 1

export type PremiumFeature = 'scadenze' | 'lavori' | 'incidenti' | 'documenti' | 'spese' | 'report' | 'notifiche' | 'veicoli' | 'storia' | 'foto'

export const FEATURE_TEXT: Record<PremiumFeature, string> = {
  scadenze: 'Bollo, assicurazione e revisione con le date calcolate in automatico',
  lavori: 'Tagliandi, gomme e riparazioni con foto e fatture',
  incidenti: 'Il registro degli incidenti con foto e controparte',
  documenti: 'La lettura automatica di polizze, ricevute e certificati',
  spese: 'Tutte le spese per categoria e per periodo',
  report: 'I grafici dei costi e il costo al chilometro',
  notifiche: 'I promemoria sul telefono prima di ogni scadenza',
  veicoli: 'Tutti i veicoli che vuoi, non solo uno',
  storia: 'Acquisto, vendita e storia completa del veicolo',
  foto: 'La foto dei veicoli salvata nel cloud',
}

export const premium = reactive({
  grant: false, // assegnato a mano nel database (grants/{uid}): per il proprietario e per le prove
  store: false, // abbonamento attivo su Google Play o App Store
  expires: '',
  billing: false, // acquisti disponibili su questo dispositivo
  amount: PREMIUM_PRICE, // prezzo dallo store, nella valuta dell'utente
  price: `${PREMIUM_PRICE} all'anno`,
  busy: false,
  uid: '',
})
export const isPremium = computed(() => premium.grant || premium.store)

export const paywall = reactive({ open: false, feature: '' as PremiumFeature | '' })
export function openPaywall(feature: PremiumFeature | '' = '') {
  paywall.feature = feature
  paywall.open = true
}
/** true se l'utente è Premium, altrimenti apre la schermata dell'abbonamento. */
export function requirePremium(feature: PremiumFeature) {
  if (isPremium.value) return true
  openPaywall(feature)
  return false
}

// Ricordo lo stato per partire subito giusto anche offline
const CACHE = 'veicoli.premium'
function saveCache() {
  try { localStorage.setItem(CACHE, JSON.stringify({ uid: premium.uid, grant: premium.grant, store: premium.store, expires: premium.expires })) } catch {}
}
function loadCache(uid: string) {
  try {
    const c = JSON.parse(localStorage.getItem(CACHE) ?? 'null')
    if (c?.uid !== uid) return
    premium.grant = !!c.grant
    premium.expires = c.expires ?? ''
    // un abbonamento scaduto nel frattempo non vale più, anche senza rete
    premium.store = !!c.store && (!c.expires || new Date(c.expires).getTime() > Date.now())
  } catch {}
}

export function setGrant(on: boolean) {
  premium.grant = on
  saveCache()
}

function applyInfo(info: any) {
  const e = info?.entitlements?.active?.[ENTITLEMENT]
  premium.store = !!e
  premium.expires = e?.expirationDate ?? ''
  saveCache()
}

let configured = false
let pkg: any = null
async function rc() {
  const key = RC_KEYS[Capacitor.getPlatform() as 'android' | 'ios']
  if (!Capacitor.isNativePlatform() || !key) return null
  const { Purchases } = await import('@revenuecat/purchases-capacitor')
  if (!configured) {
    await Purchases.configure({ apiKey: key, appUserID: premium.uid || undefined })
    await Purchases.addCustomerInfoUpdateListener(applyInfo)
    configured = true
  }
  return Purchases
}

/** Chiamata quando l'utente entra con Google: lega gli acquisti al suo account. */
export async function premiumLogin(uid: string) {
  if (premium.uid !== uid) { premium.grant = false; premium.store = false; premium.expires = '' }
  premium.uid = uid
  loadCache(uid)
  try {
    const P = await rc()
    if (!P) return
    const { customerInfo } = await P.logIn({ appUserID: uid })
    applyInfo(customerInfo)
    const offerings = await P.getOfferings()
    pkg = offerings.current?.annual ?? offerings.current?.availablePackages?.[0] ?? null
    if (pkg) { premium.amount = pkg.product.priceString; premium.price = `${pkg.product.priceString} all'anno` }
    premium.billing = !!pkg
  } catch (e) {
    console.error('abbonamento', e)
  }
}

export async function premiumLogout() {
  premium.uid = ''
  premium.grant = false
  premium.store = false
  premium.expires = ''
  try { localStorage.removeItem(CACHE) } catch {}
  if (!configured) return
  const { Purchases } = await import('@revenuecat/purchases-capacitor')
  await Purchases.logOut().catch(() => {})
}

/** Avvia l'acquisto dell'abbonamento annuale. Restituisce true se ora l'utente è Premium. */
export async function buyPremium() {
  const P = await rc()
  if (!P || !pkg) throw new Error('Gli abbonamenti non sono ancora disponibili in questa versione.')
  premium.busy = true
  try {
    const { customerInfo } = await P.purchasePackage({ aPackage: pkg })
    applyInfo(customerInfo)
    return isPremium.value
  } catch (e: any) {
    if (e?.userCancelled || /cancel/i.test(String(e?.code ?? e?.message ?? ''))) return false
    throw e
  } finally {
    premium.busy = false
  }
}

export async function restorePremium() {
  const P = await rc()
  if (!P) throw new Error('Il ripristino funziona nell\'app scaricata da Google Play o App Store.')
  premium.busy = true
  try {
    const { customerInfo } = await P.restorePurchases()
    applyInfo(customerInfo)
    return isPremium.value
  } finally {
    premium.busy = false
  }
}

/** Dove l'utente gestisce o disdice l'abbonamento. */
export function manageSubscriptionUrl() {
  return Capacitor.getPlatform() === 'ios'
    ? 'https://apps.apple.com/account/subscriptions'
    : 'https://play.google.com/store/account/subscriptions?package=it.veicoli.app'
}
