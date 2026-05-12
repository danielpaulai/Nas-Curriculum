const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings'
const VOYAGE_MODEL = 'voyage-3-large'

if (!process.env.VOYAGE_API_KEY) {
  // Warn but don't throw — embedding features degrade gracefully
  console.warn('VOYAGE_API_KEY is not set — embedding features will be unavailable')
}

export async function embed(text: string): Promise<number[]> {
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY is not set')
  }
  const res = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: [text], model: VOYAGE_MODEL }),
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Voyage API error: ${res.status} ${error}`)
  }
  const data = await res.json()
  return data.data[0].embedding as number[]
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (!process.env.VOYAGE_API_KEY) {
    throw new Error('VOYAGE_API_KEY is not set')
  }
  const res = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({ input: texts, model: VOYAGE_MODEL }),
  })
  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Voyage API error: ${res.status} ${error}`)
  }
  const data = await res.json()
  return data.data.map((d: { embedding: number[] }) => d.embedding)
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  if (magA === 0 || magB === 0) return 0
  return dot / (Math.sqrt(magA) * Math.sqrt(magB))
}
