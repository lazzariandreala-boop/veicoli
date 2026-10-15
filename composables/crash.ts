import { Capacitor } from '@capacitor/core'

// Segnalazione errori con Firebase Crashlytics (solo nell'app Android/iOS).
// Gli arresti nativi li raccoglie da sé; qui aggiungo gli errori JavaScript.

/** Converte lo stack di Chrome/WebView ("at fn (file:riga:col)") nel formato che vuole il plugin. */
function frames(stack = '') {
  return stack.split('\n').slice(1, 30).map((l) => {
    const m = l.match(/at (?:(.+?) \()?(.+?):(\d+):\d+\)?$/)
    return m ? { functionName: m[1] || '<anonima>', fileName: m[2]!.replace(/^.*\/_nuxt\//, ''), lineNumber: Number(m[3]) } : null
  }).filter(Boolean) as { functionName: string; fileName: string; lineNumber: number }[]
}

let last = ''
export async function reportCrash(e: unknown, where = '') {
  if (!Capacitor.isNativePlatform()) return
  const err = e instanceof Error ? e : new Error(typeof e === 'string' ? e : JSON.stringify(e))
  const sig = err.message + where
  if (sig === last) return // lo stesso errore a raffica conta una volta
  last = sig
  try {
    const { FirebaseCrashlytics } = await import('@capacitor-firebase/crashlytics')
    if (where) await FirebaseCrashlytics.log({ message: where })
    await FirebaseCrashlytics.recordException({ message: err.message.slice(0, 500), stacktrace: frames(err.stack) })
  } catch {}
}

export async function setCrashUser(uid: string) {
  if (!Capacitor.isNativePlatform()) return
  try {
    const { FirebaseCrashlytics } = await import('@capacitor-firebase/crashlytics')
    await FirebaseCrashlytics.setUserId({ userId: uid })
  } catch {}
}
