/**
 * Title quality checks — TS port of checks.py
 * - Rule-based scorer (5 points)
 * - Novelty overlap (n-gram corpus check)
 * - Batch diversity
 * - fullCheck (combines all three)
 */

import corpusJson from './corpus.json'
import { classify } from './classifier'

// ---------------------------------------------------------------------------
// Banned words / structures (from generate.py BANNED_WORDS)
// ---------------------------------------------------------------------------
const BANNED_WORDS = new Set([
  'unlock', 'unleash', 'harness', 'leverage', 'embark', 'delve', 'dive into',
  'empower', 'navigate', 'foster', 'cultivate', 'elevate', 'revolutionize',
  'streamline', 'synergize', 'supercharge', 'cutting-edge', 'state-of-the-art',
  'next-gen', 'next-level', 'revolutionary', 'transformative', 'game-changing',
  'game-changer', 'unprecedented', 'paradigm', 'comprehensive', 'holistic',
  'seamless', 'robust', 'innovative', 'groundbreaking', 'pioneering',
  'ever-evolving', 'multifaceted', 'in today\'s fast-paced', 'in the age of ai',
  'the world of', 'take your', 'boost your', 'demystify', 'the ultimate guide',
  'everything you need to know', 'a beginner\'s guide', 'mastering the art',
  'with ease', 'effortlessly', 'the future of', 'the new era',
])

const BANNED_STRUCTURES = [
  /^the .* guide to/i,
  /^a beginner's guide/i,
  /^introduction to/i,
  /^everything about/i,
  /^mastering the art/i,
  /\b101\b\s*$/i,
  /^demystifying/i,
  /^discover the power/i,
  /^exploring the world/i,
]

const ACTION_VERB_PATTERN =
  /^(Build|Create|Turn|Launch|Master|Make|Find|Use|Design|Sell|Get|Write|Replace|Package|Ship|Vibe|Roast|Walk|Describe|Go|Scale|Connect|How|From|Why|What|Market|Drive|Earn|Land|Open|Run|Generate|Show|Give)/i

const SPECIFICITY_PATTERN =
  /(\$\d|[0-9]+\s*(min|hour|day|week|second|month|session|weekend)|\b(Claude|ChatGPT|Lovable|Replit|Canva|Veo|Sora|n8n|Zapier|Manychat|Nano Banana|Seedance|Notion|TikTok Shop|TikTok|Instagram|Etsy|Amazon|Shopify|Facebook|Pinterest|LinkedIn|YouTube|print-on-demand|dropshipping|high-ticket|handmade)\b)/i

// ---------------------------------------------------------------------------
// Rule scorer
// ---------------------------------------------------------------------------
export function score(title: string): { score: number; flags: string[]; length: number } {
  const flags: string[] = []
  let s = 5
  const tl = title.toLowerCase()

  // Banned words
  for (const w of BANNED_WORDS) {
    if (tl.includes(w)) {
      flags.push(`banned:${w}`)
      s -= 2
    }
  }

  // Banned structures
  for (const pat of BANNED_STRUCTURES) {
    if (pat.test(tl)) {
      flags.push(`struct:${pat.source}`)
      s -= 2
    }
  }

  // Length
  const L = title.length
  if (L < 25) { flags.push('too-short'); s -= 1 }
  if (L > 110) { flags.push('too-long'); s -= 1 }

  // Action verb
  if (!ACTION_VERB_PATTERN.test(title)) {
    flags.push('no-action-verb')
    s -= 1
  }

  // Specificity
  if (!SPECIFICITY_PATTERN.test(title)) {
    flags.push('no-specificity')
    s -= 1
  }

  return { score: Math.max(0, s), flags, length: L }
}

// ---------------------------------------------------------------------------
// Normalizer + n-gram helpers (used for novelty check)
// ---------------------------------------------------------------------------
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function ngrams(text: string, n: number): Set<string> {
  const words = normalizeText(text).split(' ')
  if (words.length < n) return new Set()
  const result = new Set<string>()
  for (let i = 0; i <= words.length - n; i++) {
    result.add(words.slice(i, i + n).join(' '))
  }
  return result
}

// Build corpus n-gram set once (lazy)
let _corpusNgrams: Set<string> | null = null
function getCorpusNgrams(n = 4): Set<string> {
  if (_corpusNgrams) return _corpusNgrams
  const corpus = corpusJson as string[]
  _corpusNgrams = new Set<string>()
  for (const title of corpus) {
    for (const gram of ngrams(title, n)) _corpusNgrams.add(gram)
  }
  return _corpusNgrams
}

// ---------------------------------------------------------------------------
// Novelty overlap
// ---------------------------------------------------------------------------
export function noveltyOverlap(
  title: string,
  n = 4
): { score: number; overlapping: string[]; n: number; total: number } {
  const corpusSet = getCorpusNgrams(n)
  const titleNgrams = ngrams(title, n)
  if (titleNgrams.size === 0) return { score: 0, overlapping: [], n, total: 0 }

  const overlap: string[] = []
  for (const gram of titleNgrams) {
    if (corpusSet.has(gram)) overlap.push(gram)
  }

  return {
    score: Math.round((overlap.length / titleNgrams.size) * 1000) / 1000,
    overlapping: overlap.sort(),
    n,
    total: titleNgrams.size,
  }
}

// ---------------------------------------------------------------------------
// Batch diversity
// ---------------------------------------------------------------------------
export function batchDiversity(titles: string[]): {
  issues: string[]
  diverse: boolean
  openingVerbs: Record<string, number>
  frameworks: Record<string, number>
} {
  const norm = titles.map((t) => normalizeText(t))

  const openingVerbs: Record<string, number> = {}
  for (const t of norm) {
    const v = t.split(' ')[0] || ''
    openingVerbs[v] = (openingVerbs[v] ?? 0) + 1
  }

  const frameworks: Record<string, number> = {}
  for (const t of norm) {
    if (t.startsWith('turn ')) frameworks['turn-into'] = (frameworks['turn-into'] ?? 0) + 1
    if (t.startsWith('build ')) frameworks['build-magic'] = (frameworks['build-magic'] ?? 0) + 1
    if (t.startsWith('create ')) frameworks['create-magic'] = (frameworks['create-magic'] ?? 0) + 1
    if (t.startsWith('from ')) frameworks['transformation'] = (frameworks['transformation'] ?? 0) + 1
    if (/ that sells| that converts| that closes/.test(t)) frameworks['that-sells'] = (frameworks['that-sells'] ?? 0) + 1
    if (/ without /.test(t)) frameworks['negation'] = (frameworks['negation'] ?? 0) + 1
    if (/while you sleep/.test(t)) frameworks['while-sleep'] = (frameworks['while-sleep'] ?? 0) + 1
  }

  const issues: string[] = []
  for (const [verb, ct] of Object.entries(openingVerbs)) {
    if (ct >= 3 && verb) issues.push(`verb '${verb}' used ${ct}× — too repetitive`)
  }
  for (const [sig, ct] of Object.entries(frameworks)) {
    if (ct >= 3) issues.push(`framework '${sig}' used ${ct}× — diversify`)
  }

  // Cross-title 3-gram overlap
  const title3grams = titles.map((t) => ngrams(t, 3))
  const crossOverlap: Record<string, number> = {}
  for (let i = 0; i < titles.length; i++) {
    for (let j = i + 1; j < titles.length; j++) {
      for (const gram of title3grams[i]) {
        if (title3grams[j].has(gram)) {
          crossOverlap[gram] = (crossOverlap[gram] ?? 0) + 1
        }
      }
    }
  }
  const sorted = Object.entries(crossOverlap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  for (const [phrase, ct] of sorted) {
    if (ct >= 2) issues.push(`phrase '${phrase}' shared across ${ct + 1} titles`)
  }

  return { issues, diverse: issues.length === 0, openingVerbs, frameworks }
}

// ---------------------------------------------------------------------------
// fullCheck — combines rule scorer + classifier + novelty
// ---------------------------------------------------------------------------
export interface CheckResult {
  title: string
  verdict: 'PASS' | 'WARN' | 'REJECT'
  ruleScore: number
  ruleFlags: string[]
  slopProb: number
  noveltyOverlap: number
  recycledPhrases: string[]
  reasons: string[]
}

export function fullCheck(title: string): CheckResult {
  const rules = score(title)
  const slopProb = classify(title)
  const novelty = noveltyOverlap(title)

  let verdict: 'PASS' | 'WARN' | 'REJECT' = 'PASS'
  const reasons: string[] = []

  if (rules.score < 4) {
    verdict = 'REJECT'
    reasons.push(`rule score ${rules.score}/5`)
  }
  if (slopProb > 0.5) {
    verdict = 'REJECT'
    reasons.push(`P(slop)=${slopProb.toFixed(2)}`)
  } else if (slopProb > 0.3) {
    if (verdict === 'PASS') verdict = 'WARN'
    reasons.push(`P(slop)=${slopProb.toFixed(2)}`)
  }
  if (novelty.score >= 0.6) {
    verdict = 'REJECT'
    reasons.push(`recycled ${Math.round(novelty.score * 100)}% from corpus`)
  } else if (novelty.score >= 0.35) {
    if (verdict === 'PASS') verdict = 'WARN'
    reasons.push(`recycled ${Math.round(novelty.score * 100)}%`)
  }

  return {
    title,
    verdict,
    ruleScore: rules.score,
    ruleFlags: rules.flags,
    slopProb: Math.round(slopProb * 1000) / 1000,
    noveltyOverlap: Math.round(novelty.score * 1000) / 1000,
    recycledPhrases: novelty.overlapping,
    reasons,
  }
}
