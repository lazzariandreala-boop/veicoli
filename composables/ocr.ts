import { binarize, binarizeOtsu } from '~/utils/imageprep'
import { parseLibrettoMulti, type LibrettoData } from '~/utils/libretto'

export type OcrProgress = (stage: string, pct: number) => void

const MAX_SIDE = 2400

async function canvasFromImage(file: Blob): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' } as any)
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height))
  // le foto piccole si ingrandiscono: Tesseract rende meglio con testo alto ~30px
  const up = Math.max(bmp.width, bmp.height) < 1400 ? 1400 / Math.max(bmp.width, bmp.height) : scale
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * up)
  c.height = Math.round(bmp.height * up)
  const ctx = c.getContext('2d')!
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close?.()
  return c
}

async function canvasesFromPdf(file: Blob): Promise<HTMLCanvasElement[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  const workerUrl = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
  const out: HTMLCanvasElement[] = []
  for (let i = 1; i <= Math.min(pdf.numPages, 4); i++) {
    const page = await pdf.getPage(i)
    const vp1 = page.getViewport({ scale: 1 })
    const scale = MAX_SIDE / Math.max(vp1.width, vp1.height)
    const vp = page.getViewport({ scale })
    const c = document.createElement('canvas')
    c.width = Math.round(vp.width)
    c.height = Math.round(vp.height)
    await page.render({ canvasContext: c.getContext('2d')!, viewport: vp } as any).promise
    out.push(c)
  }
  return out
}

/** Converte i file scelti (foto o PDF) in immagini pronte per l'OCR. */
export async function filesToCanvases(files: Blob[]): Promise<HTMLCanvasElement[]> {
  const out: HTMLCanvasElement[] = []
  for (const f of files) {
    if (f.type === 'application/pdf' || (f as File).name?.toLowerCase().endsWith('.pdf')) out.push(...(await canvasesFromPdf(f)))
    else if (f.type.startsWith('image/') || !f.type) out.push(await canvasFromImage(f))
  }
  return out
}

function variant(src: HTMLCanvasElement, mode: 'otsu' | 'adaptive') {
  const ctx = src.getContext('2d', { willReadFrequently: true })!
  const img = ctx.getImageData(0, 0, src.width, src.height)
  const data = mode === 'otsu' ? binarizeOtsu(img.data, src.width, src.height).data : binarize(img.data, src.width, src.height)
  const c = document.createElement('canvas')
  c.width = src.width
  c.height = src.height
  c.getContext('2d')!.putImageData(new ImageData(data, src.width, src.height), 0, 0)
  return c
}

let workerPromise: Promise<any> | null = null
async function getWorker(onProgress?: (p: number) => void) {
  if (!workerPromise) {
    workerPromise = (async () => {
      const { createWorker } = await import('tesseract.js')
      const base = new URL('./', window.location.href).href.replace(/#.*$/, '')
      const w = await createWorker('ita', 1, {
        workerPath: `${base}ocr/worker.min.js`,
        corePath: `${base}ocr/core`,
        langPath: `${base}ocr/lang`,
        gzip: false,
        cacheMethod: 'none',
        workerBlobURL: false,
        logger: (m: any) => {
          if (m.status === 'recognizing text') currentProgress?.(m.progress)
          else loadProgress?.(m.status, m.progress)
        },
        errorHandler: (e: any) => console.error('[ocr worker]', e),
      })
      await w.setParameters({ preserve_interword_spaces: '1' })
      return w
    })()
    // Se il lettore non parte (WebView senza supporto, file mancanti) meglio un errore chiaro che una barra ferma.
    const started = workerPromise
    workerPromise = Promise.race([
      started,
      new Promise((_, reject) => setTimeout(() => reject(new Error('Il lettore di testo non si è avviato. Riprova o usa la lettura avanzata.')), 60000)),
    ])
    workerPromise.catch(() => { workerPromise = null; started.then((w: any) => w.terminate()).catch(() => {}) })
  }
  return workerPromise
}
let currentProgress: ((p: number) => void) | undefined
let loadProgress: ((status: string, p: number) => void) | undefined

/**
 * Legge il libretto sul telefono, senza connessione: due passaggi OCR
 * (soglia globale e adattiva) su ogni pagina, poi unione dei campi.
 */
export async function readLibrettoOffline(files: Blob[], onProgress: OcrProgress = () => {}): Promise<{ data: LibrettoData; text: string }> {
  onProgress('Preparo le immagini', 0.03)
  const pages = await filesToCanvases(files)
  if (!pages.length) throw new Error('Nessuna immagine leggibile nel file scelto.')
  onProgress('Avvio il lettore di testo', 0.08)
  loadProgress = (status, p) => {
    if (/language|traineddata/.test(status)) onProgress('Carico il dizionario', 0.08 + 0.02 * (p || 0))
  }
  const worker = await getWorker().finally(() => { loadProgress = undefined })
  const passes: ('otsu' | 'adaptive')[] = ['otsu', 'adaptive']
  const total = pages.length * passes.length
  const texts: string[] = Array(passes.length).fill('')
  let done = 0
  for (const [pi, mode] of passes.entries()) {
    for (const page of pages) {
      const label = `Leggo ${pages.length > 1 ? `pagina ${pages.indexOf(page) + 1}, ` : ''}passaggio ${pi + 1} di ${passes.length}`
      currentProgress = (p) => onProgress(label, 0.1 + 0.88 * ((done + p) / total))
      onProgress(label, 0.1 + 0.88 * (done / total))
      const r = await worker.recognize(variant(page, mode))
      texts[pi] += r.data.text + '\n'
      done++
    }
  }
  currentProgress = undefined
  onProgress('Compilo i campi', 1)
  ;(window as any).__veicoliLastOcr = texts
  return { data: parseLibrettoMulti(texts), text: texts.join('\n-----\n') }
}

export async function terminateOcr() {
  if (workerPromise) (await workerPromise).terminate()
  workerPromise = null
}

/** Ridimensiona e codifica in JPEG per l'invio alla lettura AI. */
export async function canvasToJpegBase64(c: HTMLCanvasElement, maxSide = 1800) {
  const s = Math.min(1, maxSide / Math.max(c.width, c.height))
  const t = document.createElement('canvas')
  t.width = Math.round(c.width * s)
  t.height = Math.round(c.height * s)
  t.getContext('2d')!.drawImage(c, 0, 0, t.width, t.height)
  return t.toDataURL('image/jpeg', 0.88).split(',')[1]
}
