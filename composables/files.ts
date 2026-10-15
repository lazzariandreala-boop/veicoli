import { Capacitor } from '@capacitor/core'
import { Directory, Filesystem } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'

async function blobToBase64(blob: Blob): Promise<string> {
  const buf = new Uint8Array(await blob.arrayBuffer())
  let s = ''
  const chunk = 0x8000
  for (let i = 0; i < buf.length; i += chunk) s += String.fromCharCode(...buf.subarray(i, i + chunk))
  return btoa(s)
}

/** Condivide (Android) o scarica (browser) un file. */
export async function shareBlob(blob: Blob, filename: string, title = 'Veicoli Personali') {
  if (Capacitor.isNativePlatform()) {
    const res = await Filesystem.writeFile({ path: filename, data: await blobToBase64(blob), directory: Directory.Cache })
    await Share.share({ title, url: res.uri, dialogTitle: title })
    return
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}

const TABLES = ['vehicles', 'works', 'incidents', 'bolli', 'policies', 'inspections'] as const

/** Backup completo: dati + foto/video in un unico file .zip. */
export async function exportBackup(): Promise<{ blob: Blob; filename: string }> {
  const d = db()
  const data: Record<string, unknown[]> = {}
  for (const t of TABLES) data[t] = await (d as any)[t].toArray()
  const media = await d.media.toArray()
  const files: Record<string, Uint8Array> = {}
  data.media = media.map((m) => ({ id: m.id, type: m.type, name: m.name, createdAt: m.createdAt }))
  for (const m of media) files[`media/${m.id}`] = new Uint8Array(await m.blob.arrayBuffer())
  files['veicoli.json'] = strToU8(JSON.stringify({ app: 'veicoli', version: 1, exportedAt: new Date().toISOString(), data }))
  const zipped = zipSync(files, { level: 0 })
  const stamp = new Date().toISOString().slice(0, 10)
  return { blob: new Blob([zipped], { type: 'application/zip' }), filename: `veicoli-backup-${stamp}.zip` }
}

export async function importBackup(file: Blob, mode: 'replace' | 'merge' = 'replace') {
  const entries = unzipSync(new Uint8Array(await file.arrayBuffer()))
  const json = entries['veicoli.json']
  if (!json) throw new Error('Il file non è un backup di Veicoli.')
  const parsed = JSON.parse(strFromU8(json))
  if (parsed.app !== 'veicoli') throw new Error('Il file non è un backup di Veicoli.')
  const d = db()
  await d.transaction('rw', [d.vehicles, d.works, d.incidents, d.bolli, d.policies, d.inspections, d.media], async () => {
    if (mode === 'replace') for (const t of [...TABLES, 'media']) {
      // anche nel cloud: quello che sparisce col ripristino va cancellato
      markDirty(t, await (d as any)[t].toCollection().primaryKeys())
      await (d as any)[t].clear()
    }
    for (const t of TABLES) await (d as any)[t].bulkPut(parsed.data[t] ?? [])
    for (const m of parsed.data.media ?? []) {
      const bytes = entries[`media/${m.id}`]
      if (bytes) await d.media.put({ ...m, blob: new Blob([bytes], { type: m.type }) })
    }
  })
  return { vehicles: (parsed.data.vehicles ?? []).length }
}
