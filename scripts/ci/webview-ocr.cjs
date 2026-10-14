// Prova la lettura OCR dentro la WebView dell'APK (emulatore) via Chrome DevTools Protocol "a mano"
// (Playwright non supporta connectOverCDP sulle WebView Android).
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
;(async () => {
  let target
  for (let i = 0; i < 40 && !target; i++) {
    try { target = (await (await fetch('http://127.0.0.1:9222/json')).json()).find((t) => t.type === 'page') } catch {}
    if (!target) await sleep(1000)
  }
  if (!target) throw new Error('nessuna pagina WebView')
  console.log('TARGET', target.url)
  const ws = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j })
  let id = 0
  const pending = new Map()
  const send = (method, params = {}, sessionId) => new Promise((res, rej) => {
    const m = { id: ++id, method, params }
    if (sessionId) m.sessionId = sessionId
    pending.set(m.id, { res, rej })
    ws.send(JSON.stringify(m))
  })
  const fmt = (args) => args.map((a) => a.value ?? a.description ?? a.type).join(' ')
  ws.onmessage = async (ev) => {
    const m = JSON.parse(ev.data)
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(JSON.stringify(m.error))) : p.res(m.result); return }
    const tag = m.sessionId ? '[worker]' : '[page]'
    if (m.method === 'Runtime.consoleAPICalled') console.log(tag, m.params.type, fmt(m.params.args))
    else if (m.method === 'Runtime.exceptionThrown') console.log(tag, 'EXCEPTION', JSON.stringify(m.params.exceptionDetails).slice(0, 800))
    else if (m.method === 'Log.entryAdded') console.log(tag, 'LOG', m.params.entry.level, m.params.entry.text, m.params.entry.url || '')
    else if (m.method === 'Network.loadingFailed') console.log(tag, 'REQFAIL', m.params.errorText, m.params.requestId)
    else if (m.method === 'Network.responseReceived') {
      const r = m.params.response
      if (/ocr\/|pdf/.test(r.url)) console.log(tag, 'RESP', r.status, r.url, r.headers['Content-Type'] || r.headers['content-type'], r.headers['Content-Encoding'] || r.headers['content-encoding'] || '')
    } else if (m.method === 'Target.attachedToTarget') {
      const s = m.params.sessionId
      console.log('[attach]', m.params.targetInfo.type, m.params.targetInfo.url)
      for (const d of ['Runtime.enable', 'Log.enable', 'Network.enable']) send(d, {}, s).catch((e) => console.log('[attach err]', d, e.message))
      send('Runtime.runIfWaitingForDebugger', {}, s).catch(() => {})
    }
  }
  await send('Runtime.enable'); await send('Log.enable'); await send('Network.enable')
  await send('Target.setAutoAttach', { autoAttach: true, waitForDebuggerOnStart: false, flatten: true }).catch((e) => console.log('autoattach', e.message))
  for (let i = 0; i < 30; i++) {
    const r = await send('Runtime.evaluate', { expression: '!!window.__veicoliOcr', returnByValue: true })
    if (r.result.value) break
    await sleep(1000)
  }
  const evalAsync = async (expr) => (await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true })).result.value
  console.log('UA', await evalAsync('navigator.userAgent'))
  console.log('PROBE', JSON.stringify(await evalAsync(`(async () => {
    const out = {}
    for (const f of ['ocr/worker.min.js', 'ocr/core/tesseract-core-simd-lstm.wasm.js', 'ocr/core/tesseract-core-relaxedsimd-lstm.wasm.js', 'ocr/lang/ita.traineddata']) {
      try { const r = await fetch(f); const b = await r.arrayBuffer(); out[f] = [r.status, r.headers.get('content-type'), r.headers.get('content-encoding'), b.byteLength, Array.from(new Uint8Array(b.slice(0, 2)))] } catch (e) { out[f] = String(e) }
    }
    out.wasmSimd = typeof WebAssembly === 'object' && WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,10,1,8,0,65,0,253,15,253,98,11]))
    return out
  })()`), null, 1))
  const res = await evalAsync(`(async () => {
    const log = []
    const c = document.createElement('canvas'); c.width = 1400; c.height = 500
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 1400, 500); g.fillStyle = '#000'; g.font = '48px sans-serif'
    g.fillText('A) FX74364   B) 30/04/2026', 40, 120); g.fillText('D.1) CFMOTO  D.3) 800MT EXPLORE', 40, 240); g.fillText('E) LCEPEYLM8S8018621', 40, 360)
    const png = await new Promise((r) => c.toBlob(r, 'image/png'))
    // PDF minimale con testo vero, come quello del libretto digitale
    const lines = ['A) FX74364   B) 30/04/2026', 'D.1) CFMOTO  D.3) 800MT EXPLORE', 'E) LCEPEYLM8S8018621']
    const content = 'BT /F1 28 Tf 40 700 Td ' + lines.map((l, i) => (i ? '0 -60 Td ' : '') + '(' + l.replace(/[()]/g, '\\\\$&') + ') Tj').join(' ') + ' ET'
    const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 842 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
      '<< /Length ' + content.length + ' >>\\nstream\\n' + content + '\\nendstream', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
    let pdf = '%PDF-1.4\\n'; const offs = []
    objs.forEach((o, i) => { offs.push(pdf.length); pdf += (i + 1) + ' 0 obj\\n' + o + '\\nendobj\\n' })
    const xref = pdf.length
    pdf += 'xref\\n0 ' + (objs.length + 1) + '\\n0000000000 65535 f \\n' + offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \\n').join('') + 'trailer\\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\\nstartxref\\n' + xref + '\\n%%EOF'
    const blob = new File([pdf], 'libretto.pdf', { type: 'application/pdf' })
    const t0 = Date.now()
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT 150s')), 150000))
    try {
      const r = await Promise.race([window.__veicoliOcr.readLibrettoOffline([blob], (s, p) => log.push(Date.now() - t0 + 'ms ' + s + ' ' + Math.round(p * 100) + '%')), timeout])
      return { ok: true, ms: Date.now() - t0, data: r.data, text: r.text.slice(0, 400), log }
    } catch (e) { return { ok: false, err: String(e && (e.stack || e)), log } }
  })()`)
  console.log('RESULT', JSON.stringify(res, null, 2))
  process.exit(res && res.ok ? 0 : 1)
})().catch((e) => { console.error(e); process.exit(1) })
