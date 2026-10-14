// Prova la lettura OCR dentro la WebView dell'APK (emulatore) via Chrome DevTools.
const { chromium } = require('playwright-core')
;(async () => {
  const browser = await chromium.connectOverCDP('http://127.0.0.1:9222')
  const ctx = browser.contexts()[0]
  let page = ctx.pages()[0]
  for (let i = 0; !page && i < 30; i++) { await new Promise((r) => setTimeout(r, 1000)); page = ctx.pages()[0] }
  console.log('URL', page.url())
  page.on('console', (m) => console.log('[page]', m.type(), m.text()))
  page.on('pageerror', (e) => console.log('[pageerror]', e.message))
  page.on('worker', (w) => { console.log('[worker start]', w.url()); w.on('console', (m) => console.log('[worker]', m.type(), m.text())) })
  page.on('requestfailed', (r) => console.log('[reqfail]', r.url(), r.failure()?.errorText))
  page.on('response', (r) => { if (/ocr\//.test(r.url())) console.log('[resp]', r.status(), r.url(), r.headers()['content-type'], r.headers()['content-encoding'] || '') })
  console.log('UA', await page.evaluate(() => navigator.userAgent))
  const res = await page.evaluate(async () => {
    const log = []
    const c = document.createElement('canvas'); c.width = 1400; c.height = 500
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 1400, 500); g.fillStyle = '#000'; g.font = '48px sans-serif'
    g.fillText('A) FX74364   B) 30/04/2026', 40, 120); g.fillText('D.1) CFMOTO  D.3) 800MT EXPLORE', 40, 240); g.fillText('E) LCEPEYLM8S8018621', 40, 360)
    const blob = await new Promise((r) => c.toBlob(r, 'image/png'))
    const t0 = Date.now()
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT 150s')), 150000))
    try {
      const r = await Promise.race([window.__veicoliOcr.readLibrettoOffline([blob], (s, p) => log.push(`${Date.now() - t0}ms ${s} ${Math.round(p * 100)}%`)), timeout])
      return { ok: true, ms: Date.now() - t0, data: r.data, log }
    } catch (e) { return { ok: false, err: String(e && (e.stack || e)), log } }
  })
  console.log(JSON.stringify(res, null, 2))
  await browser.close()
  process.exit(res.ok ? 0 : 1)
})().catch((e) => { console.error(e); process.exit(1) })
