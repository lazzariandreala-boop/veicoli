// Copia worker, core WASM e dati lingua di Tesseract in public/ocr,
// così l'OCR del libretto funziona offline anche dentro l'APK.
import { cpSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const out = join(root, 'public', 'ocr')
mkdirSync(join(out, 'core'), { recursive: true })
mkdirSync(join(out, 'lang'), { recursive: true })

const nm = (p) => join(root, 'node_modules', p)
cpSync(nm('tesseract.js/dist/worker.min.js'), join(out, 'worker.min.js'))
for (const f of readdirSync(nm('tesseract.js-core'))) {
  if (/^tesseract-core(-simd|-relaxedsimd)?-lstm\.wasm\.js$/.test(f)) {
    cpSync(nm(`tesseract.js-core/${f}`), join(out, 'core', f))
  }
}
const lang = nm('@tesseract.js-data/ita/4.0.0_best_int/ita.traineddata.gz')
if (existsSync(lang)) cpSync(lang, join(out, 'lang', 'ita.traineddata.gz'))
console.log('OCR assets copiati in public/ocr')
