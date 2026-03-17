const GIST_FILENAME = 'veicoli-app-data.json'

export async function pullFromGist(token, gistId) {
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json'
    }
  })
  if (!res.ok) throw new Error(`Errore lettura Gist (${res.status})`)
  const data = await res.json()
  const file = data.files[GIST_FILENAME]
  if (!file) return null
  return JSON.parse(file.content)
}

export async function pushToGist(token, gistId, vehicles) {
  const payload = { vehicles, updatedAt: new Date().toISOString() }
  const res = await fetch(`https://api.github.com/gists/${gistId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      files: { [GIST_FILENAME]: { content: JSON.stringify(payload, null, 2) } }
    })
  })
  if (!res.ok) throw new Error(`Errore scrittura Gist (${res.status})`)
}

export async function createGist(token) {
  const payload = { vehicles: [], updatedAt: new Date().toISOString() }
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: 'Veicoli App – dati sincronizzati',
      public: false,
      files: { [GIST_FILENAME]: { content: JSON.stringify(payload, null, 2) } }
    })
  })
  if (!res.ok) throw new Error(`Errore creazione Gist (${res.status})`)
  const data = await res.json()
  return data.id
}
