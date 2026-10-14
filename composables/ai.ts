import Anthropic from '@anthropic-ai/sdk'
import { LIBRETTO_LABELS, type LibrettoData } from '~/utils/libretto'
import { canvasToJpegBase64, filesToCanvases, type OcrProgress } from './ocr'

// Lettura "avanzata" facoltativa: le foto del libretto vengono inviate a Claude
// con la chiave API dell'utente, salvata solo su questo dispositivo.

const KEY = 'veicoli.anthropicKey'
const MODEL = 'claude-opus-5-5'

export const aiSettings = reactive({
  apiKey: (typeof localStorage !== 'undefined' && (() => { try { return localStorage.getItem(KEY) ?? '' } catch { return '' } })()) || '',
})
watch(() => aiSettings.apiKey, (v) => { try { v ? localStorage.setItem(KEY, v) : localStorage.removeItem(KEY) } catch {} })

const NUMERIC = new Set<keyof LibrettoData>([
  'massaMaxTecnica', 'massaMax', 'massaComplesso', 'massaInServizio', 'assi', 'massaRimorchiabileFrenata',
  'massaRimorchiabileNonFrenata', 'cilindrata', 'potenzaKw', 'rapportoPotenzaPeso', 'posti', 'postiInPiedi',
  'livelloSonoro', 'regimeGiri', 'co2', 'lunghezza', 'larghezza', 'altezza',
])

function schema() {
  const properties: Record<string, any> = {}
  for (const [k, label] of Object.entries(LIBRETTO_LABELS)) {
    if (k === 'tipoVeicolo') {
      properties[k] = { type: ['string', 'null'], enum: ['auto', 'moto', 'ciclomotore', 'furgone', 'camper', 'rimorchio', 'altro', null], description: label }
    } else {
      properties[k] = { type: [NUMERIC.has(k as keyof LibrettoData) ? 'number' : 'string', 'null'], description: label }
    }
  }
  return { type: 'object', properties, required: Object.keys(properties), additionalProperties: false }
}

const PROMPT = `Queste immagini sono una carta di circolazione italiana (libretto).
Estrai i campi usando i codici armonizzati stampati sul documento: (A) targa, (B) data di prima immatricolazione, (C.2.1) cognome, (C.2.2) nome, (C.2.3) indirizzo, (D.1) marca, (D.2) tipo/variante/versione, (D.3) denominazione commerciale, (E) telaio, (F.1)(F.2)(F.3)(G) masse in kg, (I) data immatricolazione attuale, (J) categoria, (J.1) destinazione e uso, (J.2) carrozzeria, (K) omologazione, (L) assi, (O.1)(O.2) masse rimorchiabili, (P.1) cilindrata, (P.2) potenza kW, (P.3) alimentazione, (P.5) codice motore, (Q), (S.1)(S.2) posti, (U.1)(U.2), (V.7) CO2, (V.9) direttiva. Dalle note (costruttore, misure, pneumatici, classe Euro, progressivo PRA, codice fiscale, nascita intestatario) ricava i campi restanti.
Regole: date in formato ISO yyyy-mm-dd; numeri senza unità con il punto decimale (es. "067,00" kW diventa 67); targa senza spazi in maiuscolo; alimentazione normalizzata (Benzina, Diesel, Benzina/GPL, Benzina/Metano, Ibrida, Elettrica); indirizzo su una riga con città e provincia; tipoVeicolo dedotto da categoria e uso. Se un campo è vuoto o illeggibile usa null: non inventare.`

export async function readLibrettoAI(files: Blob[], onProgress: OcrProgress = () => {}): Promise<LibrettoData> {
  if (!aiSettings.apiKey) throw new Error('Inserisci la chiave API nelle Impostazioni per usare la lettura avanzata.')
  onProgress('Preparo le immagini', 0.1)
  const canvases = await filesToCanvases(files)
  const images = await Promise.all(canvases.map((c) => canvasToJpegBase64(c)))
  onProgress('Analizzo il libretto con Claude', 0.35)
  const client = new Anthropic({ apiKey: aiSettings.apiKey, dangerouslyAllowBrowser: true })
  const response: any = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 8000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    output_config: { effort: 'low', format: { type: 'json_schema', schema: schema() } },
    messages: [{
      role: 'user',
      content: [
        ...images.map((data) => ({ type: 'image' as const, source: { type: 'base64' as const, media_type: 'image/jpeg' as const, data } })),
        { type: 'text' as const, text: PROMPT },
      ],
    }],
  } as any)
  if (response.stop_reason === 'refusal') throw new Error('La lettura avanzata non ha potuto elaborare queste immagini.')
  const text = response.content.find((b: any) => b.type === 'text')?.text
  if (!text) throw new Error('Risposta vuota dalla lettura avanzata.')
  onProgress('Compilo i campi', 1)
  const raw = JSON.parse(text) as Record<string, unknown>
  const out: any = {}
  for (const [k, v] of Object.entries(raw)) if (v !== null && v !== '' && v !== undefined) out[k] = v
  return out as LibrettoData
}

export function describeAiError(e: unknown): string {
  if (e instanceof Anthropic.AuthenticationError) return 'Chiave API non valida.'
  if (e instanceof Anthropic.RateLimitError) return 'Troppe richieste: riprova tra poco.'
  if (e instanceof Anthropic.APIConnectionError) return 'Nessuna connessione a internet.'
  if (e instanceof Anthropic.APIError) return `Errore del servizio (${e.status ?? '?'}).`
  return e instanceof Error ? e.message : String(e)
}
