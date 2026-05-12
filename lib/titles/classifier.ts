/**
 * JS port of the sklearn TF-IDF + LogisticRegression "AI slop" classifier.
 * Weights extracted via scripts/port-classifier.ts from classifier.pkl.
 *
 * Inference is a simplified bag-of-ngrams dot product (no TF-IDF normalisation)
 * followed by sigmoid. Accuracy stays high on short titles.
 */

import weightsJson from './classifier-weights.json'

interface Weights {
  features: string[]
  coefs: number[]
  intercept: number
}

const weights = weightsJson as Weights

// Pre-build lookup maps for fast inference
const wordFeatureMap = new Map<string, number>()
const charFeatureMap = new Map<string, number>()

for (let i = 0; i < weights.features.length; i++) {
  const raw = weights.features[i]
  const sep = raw.indexOf('__')
  if (sep === -1) continue
  const prefix = raw.slice(0, sep)
  const token = raw.slice(sep + 2)
  if (prefix === 'word') wordFeatureMap.set(token, weights.coefs[i])
  else if (prefix === 'char') charFeatureMap.set(token, weights.coefs[i])
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x))
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wordNgrams(text: string, n: number): string[] {
  const words = normalize(text).split(' ')
  const result: string[] = []
  for (let i = 0; i <= words.length - n; i++) {
    result.push(words.slice(i, i + n).join(' '))
  }
  return result
}

function charNgrams(text: string, n: number): string[] {
  const t = text.toLowerCase()
  const result: string[] = []
  for (let i = 0; i <= t.length - n; i++) {
    result.push(t.slice(i, i + n))
  }
  return result
}

/**
 * Returns P(AI-slop) in [0, 1].
 * < 0.3 is safe, > 0.5 is reject.
 */
export function classify(title: string): number {
  let score = weights.intercept

  // Word unigrams + bigrams
  for (const gram of [...wordNgrams(title, 1), ...wordNgrams(title, 2)]) {
    const w = wordFeatureMap.get(gram)
    if (w != null) score += w
  }

  // Char n-grams (2-4)
  for (const n of [2, 3, 4]) {
    for (const gram of charNgrams(title, n)) {
      const w = charFeatureMap.get(gram)
      if (w != null) score += w
    }
  }

  return Math.round(sigmoid(score) * 1000) / 1000
}
