// URL temporanei per mostrare foto e video salvati nel DB.
const cache = new Map<string, { url: string; type: string; refs: number }>()

export async function acquireMediaUrl(id: string) {
  const hit = cache.get(id)
  if (hit) { hit.refs++; return hit }
  const m = await db().media.get(id)
  if (!m) return null
  const entry = { url: URL.createObjectURL(m.blob), type: m.type, refs: 1 }
  cache.set(id, entry)
  return entry
}

export function releaseMediaUrl(id: string) {
  const hit = cache.get(id)
  if (!hit) return
  if (--hit.refs <= 0) {
    URL.revokeObjectURL(hit.url)
    cache.delete(id)
  }
}

export function useMediaUrl(id: Ref<string | undefined> | (() => string | undefined)) {
  const url = ref<string>()
  const type = ref<string>()
  let current: string | undefined
  watch(id as any, async (v: string | undefined) => {
    if (current) releaseMediaUrl(current)
    current = v
    url.value = undefined
    if (!v) return
    const e = await acquireMediaUrl(v)
    if (current === v && e) { url.value = e.url; type.value = e.type }
  }, { immediate: true })
  onScopeDispose(() => { if (current) releaseMediaUrl(current) })
  return { url, type }
}

/** Riduce le foto molto grandi per non riempire la memoria del telefono. */
export async function compressImage(file: File, maxSide = 2560, quality = 0.86): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file
  try {
    const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as any)
    const s = Math.min(1, maxSide / Math.max(bmp.width, bmp.height))
    if (s === 1 && file.size < 2_500_000) { bmp.close?.(); return file }
    const c = document.createElement('canvas')
    c.width = Math.round(bmp.width * s)
    c.height = Math.round(bmp.height * s)
    c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
    bmp.close?.()
    const blob = await new Promise<Blob | null>((r) => c.toBlob(r, 'image/jpeg', quality))
    return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : file
  } catch {
    return file
  }
}

export async function storeFiles(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files)
  const prepared: Blob[] = []
  for (const f of list) prepared.push(f.type.startsWith('image/') ? await compressImage(f) : f)
  return saveMedia(prepared)
}
