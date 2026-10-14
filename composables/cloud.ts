import { Capacitor } from '@capacitor/core'
import type { Auth } from 'firebase/auth'
import type { Firestore, QueryDocumentSnapshot } from 'firebase/firestore'
import { SYNC_TABLES, applyRemote, db, markDirty, onOutboxChange, outboxClear, outboxDone, outboxHas, outboxSnapshot, type SyncTable } from '~/composables/db'

// Account Google e copia dei dati su Firestore: users/{uid}/{tabella}/{id}.
// I file (foto, PDF) stanno in users/{uid}/media (dati) + users/{uid}/mediaChunks (contenuto a pezzi da ~600 KB),
// perché Firebase Storage richiede il piano a pagamento.
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyBCZDcFg5eo0r0zLNgU6jFYObaJEwf40tg',
  authDomain: 'veicoli-personali.firebaseapp.com',
  projectId: 'veicoli-personali',
  storageBucket: 'veicoli-personali.firebasestorage.app',
  messagingSenderId: '968907722695',
  appId: '1:968907722695:web:be94b7f34c926674c353e2',
}

const LINKED_KEY = 'veicoli.cloud' // uid dell'account collegato su questo telefono
const TS_KEY = 'veicoli.cloud.ts' // ultima versione nota di ogni record
const CHUNK = 600_000
const MAX_MEDIA = 15 * 1024 * 1024

type Status = 'off' | 'connecting' | 'syncing' | 'ok' | 'offline' | 'error'
export const cloud = reactive({
  user: null as null | { uid: string; email?: string; name?: string; photo?: string },
  status: 'off' as Status,
  lastSync: 0,
  error: '',
  pending: 0,
})

let fb: {
  auth: Auth
  fs: Firestore
  a: typeof import('firebase/auth')
  f: typeof import('firebase/firestore')
} | null = null

async function load() {
  if (fb) return fb
  const [{ initializeApp }, a, f] = await Promise.all([import('firebase/app'), import('firebase/auth'), import('firebase/firestore')])
  const app = initializeApp(FIREBASE_CONFIG)
  const auth = Capacitor.isNativePlatform()
    ? a.initializeAuth(app, { persistence: a.indexedDBLocalPersistence })
    : a.initializeAuth(app, { persistence: [a.indexedDBLocalPersistence, a.browserLocalPersistence], popupRedirectResolver: a.browserPopupRedirectResolver })
  const fs = f.initializeFirestore(app, { localCache: f.persistentLocalCache(), ignoreUndefinedProperties: true })
  // Solo per le prove automatiche con l'emulatore Firebase
  const emu = localStorage.getItem('veicoli.cloud.emulator')
  if (emu) { a.connectAuthEmulator(auth, `http://${emu}:9099`, { disableWarnings: true }); f.connectFirestoreEmulator(fs, emu, 8080) }
  fb = { auth, fs, a, f }
  a.onAuthStateChanged(auth, (u) => {
    if (u) {
      cloud.user = { uid: u.uid, email: u.email ?? undefined, name: u.displayName ?? undefined, photo: u.photoURL ?? undefined }
      localStorage.setItem(LINKED_KEY, u.uid)
      startSync(u.uid).catch(fail)
    } else {
      cloud.user = null
      stopSync()
      cloud.status = 'off'
    }
  })
  return fb
}

function fail(e: unknown) {
  console.error('cloud', e)
  cloud.status = 'error'
  cloud.error = e instanceof Error ? e.message : String(e)
}

/** All'avvio: se l'account era collegato riprende la sincronizzazione. */
export function initCloud() {
  if (localStorage.getItem(LINKED_KEY)) {
    cloud.status = 'connecting'
    load().catch(fail)
  }
}

export async function signInWithGoogle() {
  const { auth, a } = await load()
  cloud.error = ''
  const emu = localStorage.getItem('veicoli.cloud.emulator')
  if (emu) {
    await a.signInWithCredential(auth, a.GoogleAuthProvider.credential(JSON.stringify({ sub: 'prova', email: 'prova@example.com', name: 'Prova' })))
  } else if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    let r
    try {
      r = await FirebaseAuthentication.signInWithGoogle()
    } catch (e: any) {
      const msg = String(e?.message ?? e)
      if (/cancel/i.test(msg)) return false
      throw new Error(/default_web_client_id|WILL_BE_OVERRIDDEN|DEVELOPER_ERROR|10:|No credentials/i.test(msg)
        ? 'Accesso Google non ancora configurato in questa versione dell\'app (manca google-services.json o l\'impronta SHA-1).'
        : msg)
    }
    const idToken = r.credential?.idToken
    if (!idToken) throw new Error('Google non ha restituito le credenziali')
    await a.signInWithCredential(auth, a.GoogleAuthProvider.credential(idToken))
  } else {
    await a.signInWithPopup(auth, new a.GoogleAuthProvider())
  }
  return true
}

export async function signOutCloud() {
  const { auth, a } = await load()
  await flush().catch(() => {})
  stopSync()
  if (Capacitor.isNativePlatform()) {
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    await FirebaseAuthentication.signOut().catch(() => {})
  }
  await a.signOut(auth)
  localStorage.removeItem(LINKED_KEY)
  localStorage.removeItem(TS_KEY)
  outboxClear()
}

// ---------- sincronizzazione ----------

let unsubs: (() => void)[] = []
let uid = ''
let known: Record<string, number> = {}
let flushTimer: ReturnType<typeof setTimeout> | undefined
let flushing: Promise<void> | null = null
const saveKnown = () => { try { localStorage.setItem(TS_KEY, JSON.stringify(known)) } catch {} }

function stopSync() {
  unsubs.forEach((u) => u())
  unsubs = []
  uid = ''
  clearTimeout(flushTimer)
}

const userCol = (t: string) => fb!.f.collection(fb!.fs, 'users', uid, t)

async function startSync(u: string) {
  if (uid === u) return
  stopSync()
  uid = u
  cloud.status = 'syncing'
  try { known = JSON.parse(localStorage.getItem(TS_KEY) ?? '{}') } catch { known = {} }
  const { f } = fb!
  // Primo collegamento su questo telefono: scarico tutto, poi invio solo quello che il cloud non ha ancora
  const firstKey = `veicoli.cloud.linked.${u}`
  if (!localStorage.getItem(firstKey)) {
    for (const t of SYNC_TABLES) {
      const snap = await f.getDocs(userCol(t))
      const remote = new Set(snap.docs.map((d) => d.id))
      await applyDocs(t, snap.docs)
      const local = await (db() as any)[t].toCollection().primaryKeys() as string[]
      markDirty(t, local.filter((id) => !remote.has(id)))
    }
    localStorage.setItem(firstKey, '1')
  }
  // Modifiche fatte su altri dispositivi
  for (const t of SYNC_TABLES) {
    unsubs.push(f.onSnapshot(userCol(t), (snap) => {
      const changed = snap.docChanges().filter((c) => c.type !== 'removed' && !c.doc.metadata.hasPendingWrites).map((c) => c.doc)
      if (changed.length) applyDocs(t, changed).catch(fail)
      if (!snap.metadata.fromCache && !cloud.pending) { cloud.status = 'ok'; cloud.lastSync = Date.now() }
    }, fail))
  }
  unsubs.push(onOutboxChange(scheduleFlush))
  const online = () => scheduleFlush()
  window.addEventListener('online', online)
  unsubs.push(() => window.removeEventListener('online', online))
  await flush()
}

async function applyDocs(t: SyncTable, docs: QueryDocumentSnapshot[]) {
  const puts: any[] = []
  const dels: string[] = []
  for (const d of docs) {
    const key = `${t}:${d.id}`
    const { _ts = 0, _deleted, ...rec } = d.data() as any
    if (outboxHas(key) || _ts <= (known[key] ?? -1)) continue
    known[key] = _ts
    if (_deleted) dels.push(d.id)
    else if (t === 'media') {
      if (!(await db().media.get(d.id))) {
        const blob = await downloadMedia(d.id, rec.type, rec.chunks)
        if (blob) puts.push({ id: d.id, blob, type: rec.type, name: rec.name, createdAt: rec.createdAt })
      }
    } else puts.push(rec)
  }
  if (puts.length || dels.length) {
    await applyRemote(async () => {
      const table = (db() as any)[t]
      if (puts.length) await table.bulkPut(puts)
      if (dels.length) await table.bulkDelete(dels)
    })
  }
  saveKnown()
}

async function downloadMedia(id: string, type: string, chunks: number): Promise<Blob | undefined> {
  const { f } = fb!
  const snap = await f.getDocs(f.query(userCol('mediaChunks'), f.where('mediaId', '==', id)))
  const parts = snap.docs.map((d) => d.data() as { n: number; data: string }).sort((a, b) => a.n - b.n)
  if (parts.length !== chunks) return
  const bytes = parts.map((p) => Uint8Array.from(atob(p.data), (c) => c.charCodeAt(0)))
  return new Blob(bytes, { type })
}

const toBase64 = (b: Blob) => new Promise<string>((res, rej) => {
  const r = new FileReader()
  r.onload = () => res(String(r.result).split(',')[1] ?? '')
  r.onerror = () => rej(r.error)
  r.readAsDataURL(b)
})

function scheduleFlush() {
  cloud.pending = outboxSnapshot().length
  clearTimeout(flushTimer)
  flushTimer = setTimeout(() => flush().catch(fail), 1200)
}

/** Invia al cloud le modifiche in coda. */
export async function flush() {
  if (!fb || !uid) return
  if (flushing) return flushing
  flushing = (async () => {
    const { f, fs } = fb!
    const items = outboxSnapshot()
    if (!items.length) return
    cloud.status = 'syncing'
    cloud.pending = items.length
    let batch = f.writeBatch(fs)
    let ops = 0
    let bytes = 0
    const commits: Promise<void>[] = []
    // un batch può avere al massimo 500 scritture e ~10 MB: resto ben sotto
    const add = (fn: (b: typeof batch) => void, size = 2000) => {
      if (ops + 1 > 400 || bytes + size > 6_000_000) { commits.push(batch.commit()); batch = f.writeBatch(fs); ops = 0; bytes = 0 }
      fn(batch); ops++; bytes += size
    }
    for (const [key] of items) {
      const [t, id] = key.split(':') as [SyncTable, string]
      const ts = Date.now()
      const ref = f.doc(userCol(t), id)
      const rec = await (db() as any)[t].get(id)
      if (t === 'media') {
        const old = known[key] !== undefined ? await f.getDocs(f.query(userCol('mediaChunks'), f.where('mediaId', '==', id))).catch(() => null) : null
        old?.docs.forEach((d) => add((b) => b.delete(d.ref)))
        if (rec && rec.blob.size <= MAX_MEDIA) {
          const data = await toBase64(rec.blob)
          const n = Math.ceil(data.length / CHUNK) || 1
          for (let i = 0; i < n; i++) add((b) => b.set(f.doc(userCol('mediaChunks'), `${id}_${i}`), { mediaId: id, n: i, data: data.slice(i * CHUNK, (i + 1) * CHUNK) }), CHUNK + 200)
          add((b) => b.set(ref, { type: rec.type, name: rec.name ?? null, createdAt: rec.createdAt, size: rec.blob.size, chunks: n, _ts: ts }))
        } else if (!rec) add((b) => b.set(ref, { _deleted: true, _ts: ts }))
      } else {
        add((b) => b.set(ref, rec ? { ...JSON.parse(JSON.stringify(rec)), _ts: ts } : { _deleted: true, _ts: ts }))
      }
      known[key] = ts
    }
    commits.push(batch.commit())
    saveKnown()
    // Offline Firestore tiene le scritture in coda da sé: dopo qualche secondo le considero affidate
    const ok = await Promise.race([Promise.all(commits).then(() => true), new Promise<boolean>((r) => setTimeout(() => r(false), 8000))])
    outboxDone(items)
    cloud.pending = outboxSnapshot().length
    cloud.status = ok ? 'ok' : 'offline'
    if (ok) cloud.lastSync = Date.now()
  })().finally(() => { flushing = null })
  return flushing
}
