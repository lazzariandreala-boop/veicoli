// Pre-elaborazione dell'immagine del libretto prima dell'OCR: il fondo
// verde con il motivo di sicurezza confonde Tesseract, quindi si binarizza
// con una soglia adattiva (media locale) calcolata sul canale più chiaro.

export function binarize(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number, opts: { k?: number; cap?: number } = {}) {
  const k = opts.k ?? 0.28
  const cap = opts.cap ?? 150
  const n = width * height
  const lum = new Uint8Array(n)
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2]
    lum[i] = r > g ? (r > b ? r : b) : (g > b ? g : b)
  }
  // immagine integrale per la media locale
  const W = width + 1
  const integral = new Float64Array(W * (height + 1))
  for (let y = 0; y < height; y++) {
    let row = 0
    for (let x = 0; x < width; x++) {
      row += lum[y * width + x]
      integral[(y + 1) * W + x + 1] = integral[y * W + x + 1] + row
    }
  }
  const r = Math.max(8, Math.round(Math.min(width, height) / 40))
  const out = new Uint8ClampedArray(n * 4)
  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(height, y + r + 1)
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(width, x + r + 1)
      const sum = integral[y1 * W + x1] - integral[y0 * W + x1] - integral[y1 * W + x0] + integral[y0 * W + x0]
      const mean = sum / ((y1 - y0) * (x1 - x0))
      const v = lum[y * width + x]
      const ink = v < mean * (1 - k) && v < cap
      const o = (y * width + x) * 4
      const c = ink ? 0 : 255
      out[o] = out[o + 1] = out[o + 2] = c
      out[o + 3] = 255
    }
  }
  return out
}

/** Soglia globale di Otsu sul canale più chiaro: ottima per scansioni pulite. */
export function binarizeOtsu(rgba: Uint8ClampedArray | Uint8Array, width: number, height: number) {
  const n = width * height
  const lum = new Uint8Array(n)
  const hist = new Float64Array(256)
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2]
    const v = r > g ? (r > b ? r : b) : (g > b ? g : b)
    lum[i] = v
    hist[v]++
  }
  let sum = 0
  for (let t = 0; t < 256; t++) sum += t * hist[t]
  let sumB = 0, wB = 0, best = 0, th = 128
  for (let t = 0; t < 256; t++) {
    wB += hist[t]
    if (!wB) continue
    const wF = n - wB
    if (!wF) break
    sumB += t * hist[t]
    const mB = sumB / wB, mF = (sum - sumB) / wF
    const between = wB * wF * (mB - mF) ** 2
    if (between > best) { best = between; th = t }
  }
  // l'inchiostro è molto più scuro del fondo: si stringe un po' la soglia
  th = Math.min(th, 125)
  const out = new Uint8ClampedArray(n * 4)
  for (let i = 0; i < n; i++) {
    const c = lum[i] < th ? 0 : 255
    const o = i * 4
    out[o] = out[o + 1] = out[o + 2] = c
    out[o + 3] = 255
  }
  return { data: out, threshold: th }
}
