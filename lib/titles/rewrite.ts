/**
 * Title rewriter — TS port of rewrite.py
 * Two modes:
 *  - heuristic: regex/template fixes, no API
 *  - llm: calls Claude with SKILL voice rules
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { claudeJSON } from '@/lib/anthropic'
import { fullCheck, type CheckResult } from './checks'

const ROOT = join(process.cwd(), 'lib/titles')

const ACTION_VERBS = [
  'Build', 'Create', 'Turn', 'Launch', 'Make', 'Find', 'Use', 'Design',
  'Generate', 'Replace', 'Show', 'Land', 'Get', 'Sell', 'Write', 'Roast',
  'Walk', 'Package', 'Ship', 'Master', 'Scale',
]

const SLOP_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bunlock\b/gi, 'Build'],
  [/\bunleash\b/gi, 'Build'],
  [/\bharness\b/gi, 'Use'],
  [/\bleverage\b/gi, 'Use'],
  [/\bdelve into\b/gi, 'Master'],
  [/\bdive into\b/gi, 'Master'],
  [/\bnavigate\b/gi, 'Master'],
  [/\bembark on\b/gi, 'Start'],
  [/\bempower\b/gi, 'Help'],
  [/\bstreamline\b/gi, 'Speed up'],
  [/\bsupercharge\b/gi, 'Boost'],
  [/\brevolutionize\b/gi, 'Rebuild'],
  [/\bdemystif(y|ying)\b/gi, 'Master'],
  [/\bcutting-edge\b/gi, 'modern'],
  [/\bstate-of-the-art\b/gi, 'modern'],
  [/\bnext-?gen\b/gi, 'modern'],
  [/\bnext-?level\b/gi, 'advanced'],
  [/\brevolutionary\b/gi, 'fresh'],
  [/\btransformative\b/gi, 'powerful'],
  [/\bgame-?changing\b/gi, 'powerful'],
  [/\bunprecedented\b/gi, 'rare'],
  [/\bcomprehensive\b/gi, 'complete'],
  [/\bholistic\b/gi, 'complete'],
  [/\bseamless\b/gi, 'smooth'],
  [/\brobust\b/gi, 'solid'],
  [/\binnovative\b/gi, 'fresh'],
  [/\bgroundbreaking\b/gi, 'fresh'],
  [/\bever-evolving\b/gi, 'changing'],
  [/\bboost your\b/gi, 'Build a'],
  [/in today's fast-paced world,?\s*/gi, ''],
  [/in the age of AI[,:]?\s*/gi, ''],
  [/the world of\b/gi, ''],
  [/take your (.+?) to the next level\b/gi, 'build a stronger $1'],
  [/the ultimate guide to\b/gi, 'Master'],
  [/everything you need to know about\b/gi, 'Master'],
  [/a beginner's guide to\b/gi, 'Build Your First'],
  [/mastering the art of\b/gi, 'Master'],
  [/demystifying\b/gi, 'Master'],
]

export function heuristicFixes(title: string): string[] {
  const candidates: string[] = []

  // 1. Apply slop replacements
  let cleaned = title.trim()
  for (const [pat, repl] of SLOP_REPLACEMENTS) {
    cleaned = cleaned.replace(pat, repl)
  }
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  if (cleaned) cleaned = cleaned[0].toUpperCase() + cleaned.slice(1)
  if (cleaned.toLowerCase() !== title.toLowerCase()) candidates.push(cleaned)

  // 2. Add action verb if missing
  const actionVerbRe = new RegExp(
    `^(${ACTION_VERBS.join('|')})\\b`,
    'i'
  )
  if (!actionVerbRe.test(cleaned)) {
    const OPENERS = [...ACTION_VERBS, 'Get', 'Have', 'Discover', 'Learn', 'Earn']
    let tail = cleaned.replace(
      new RegExp(`^(${OPENERS.join('|')})\\s+`, 'i'),
      ''
    ).trim()
    if (tail && tail[0] === tail[0].toLowerCase()) {
      tail = tail[0].toUpperCase() + tail.slice(1)
    }
    for (const verb of ['Build', 'Create', 'Make', 'Launch', 'Find']) {
      candidates.push(`${verb} ${tail}`)
    }
  }

  // 3. Add specificity if missing
  const specifRe = /(\$\d|[0-9]+\s*(min|hour|day|week|second|month|session|weekend)|\b(Claude|ChatGPT|Lovable|n8n|Zapier|Canva|TikTok)\b)/i
  if (!specifRe.test(cleaned)) {
    for (const suffix of ['in 60 Minutes', 'in One Session', 'With Claude', 'in a Weekend']) {
      candidates.push(`${cleaned.replace(/\.$/, '')} ${suffix}`)
    }
  }

  // 4. Truncate if too long
  if (cleaned.length > 110) {
    candidates.push(cleaned.replace(/\s*[-—:].*$/, '').slice(0, 90))
  }

  // Deduplicate
  const seen = new Set<string>()
  const unique: string[] = []
  for (const c of candidates) {
    const norm = c.replace(/\s+/g, ' ').trim()
    if (!seen.has(norm.toLowerCase()) && norm.toLowerCase() !== title.toLowerCase()) {
      seen.add(norm.toLowerCase())
      unique.push(norm)
    }
  }
  return unique.slice(0, 8)
}

export async function llmRewrite(
  title: string,
  n = 5,
  context = ''
): Promise<string[]> {
  const skill = readFileSync(join(ROOT, 'skill.md'), 'utf-8')
  const curated = JSON.parse(readFileSync(join(ROOT, 'exemplars-historical.json'), 'utf-8')) as string[]
  const examples = curated.slice(0, 30).map((e) => `- ${e}`).join('\n')
  const diagnosis = fullCheck(title)

  const system = `You are the Title Rewriter for AI School for Entrepreneurs (Nuseir Yassin & Alex Dweck).
Rewrite weak/AI-slop titles into the EXACT Nas voice.

# VOICE ANCHOR (top 30 historical titles)
${examples}

# RULES
${skill}

# OUTPUT
Return JSON array of ${n} rewrites, no prose:
["rewrite 1", "rewrite 2", ...]`

  const user = `Original title: "${title}"

Diagnosis from quality system:
- Verdict: ${diagnosis.verdict}
- Rule score: ${diagnosis.ruleScore}/5
- P(AI-slop): ${diagnosis.slopProb}
- Recycled from corpus: ${Math.round(diagnosis.noveltyOverlap * 100)}%
- Issues: ${diagnosis.reasons.join('; ') || 'none'}

${context ? `Additional context: ${context}` : ''}

Generate ${n} Nas-voice rewrites that fix every diagnosed issue.
Vary frameworks across rewrites (don't use the same one twice).
Each rewrite must:
- Start with an action verb (Build/Create/Turn/Launch/Make/Find/Use/Generate/Replace/Show/Why)
- Include a specific number, named tool, OR timeframe
- Be 40-90 chars
- Contain ZERO banned words

Return JSON array only, no prose.`

  return claudeJSON<string[]>(system, user)
}

export interface RewriteResult {
  original: CheckResult
  rewrites: Array<CheckResult & { heuristic: boolean }>
  diversityIssues?: string[]
}

export async function rewriteAndRank(
  title: string,
  n = 5,
  useLlm = false,
  context = ''
): Promise<RewriteResult> {
  const originalCheck = fullCheck(title)
  const rewriteStrings: string[] = []

  if (useLlm) {
    try {
      const llm = await llmRewrite(title, n, context)
      rewriteStrings.push(...llm)
    } catch {
      rewriteStrings.push(...heuristicFixes(title))
    }
  } else {
    rewriteStrings.push(...heuristicFixes(title))
  }

  const order = { PASS: 0, WARN: 1, REJECT: 2 }
  const checked = rewriteStrings
    .map((t) => ({ ...fullCheck(t), heuristic: !useLlm }))
    .sort((a, b) => {
      const vd = order[a.verdict] - order[b.verdict]
      if (vd !== 0) return vd
      return a.slopProb - b.slopProb
    })
    .slice(0, n)

  return { original: originalCheck, rewrites: checked }
}
