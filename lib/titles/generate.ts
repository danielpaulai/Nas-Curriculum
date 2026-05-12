/**
 * Title generator — TS port of generate.py
 * Calls Claude with the SKILL.md + voice-rules.md + frameworks.md + curated examples.
 * Returns ranked, scored candidates.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { claudeJSON } from '@/lib/anthropic'
import { fullCheck, type CheckResult } from './checks'

const ROOT = join(process.cwd(), 'lib/titles')

function readAsset(filename: string): string {
  return readFileSync(join(ROOT, filename), 'utf-8')
}

function loadCurated(): string[] {
  const data = JSON.parse(readAsset('exemplars-historical.json'))
  return Array.isArray(data) ? data : data.titles ?? []
}

function buildSystemPrompt(curated: string[]): string {
  const voiceRules = readAsset('voice-rules.md')
  const frameworks = readAsset('frameworks.md')
  const examplesBlock = curated.map((t) => `- ${t}`).join('\n')

  return `You are the Title Engine for AI School for Entrepreneurs (Nuseir Yassin & Alex Dweck).
You write session titles in their EXACT voice — punchy, transformation-driven, specific, anti-AI-slop.

# THE GOLD-STANDARD HISTORICAL TITLES (your voice anchor)

${examplesBlock}

# VOICE RULES (extracted from corpus + de-AI-ify principles)

${voiceRules}

# FRAMEWORK LIBRARY

${frameworks}

# OUTPUT FORMAT

Return ONLY a JSON array of objects, no prose, no markdown fence:

[
  {"title": "...", "framework": "MAGIC|Transformation|Turn-Into|Outcome-That-Sells|Negation|Specificity|Question|Roast", "why": "one sentence"},
  ...
]

Generate the requested count. Pre-filter banned words yourself before returning.`
}

export interface GeneratedCandidate {
  title: string
  framework: string
  why: string
  ruleScore: number
  ruleFlags: string[]
  slopProb: number
  noveltyOverlap: number
  recycledPhrases: string[]
  verdict: 'PASS' | 'WARN' | 'REJECT'
  reasons: string[]
}

export interface GenerateOptions {
  topic: string
  tool?: string
  duration?: string
  audience?: string
  outcome?: string
  n?: number
  framework?: string
}

export async function generateTitles(opts: GenerateOptions): Promise<GeneratedCandidate[]> {
  const { topic, tool, duration, audience, outcome, n = 10, framework } = opts

  const curated = loadCurated()
  const system = buildSystemPrompt(curated)

  const parts = [`Topic: ${topic}`]
  if (tool) parts.push(`Tool: ${tool}`)
  if (duration) parts.push(`Duration: ${duration}`)
  if (audience) parts.push(`Audience: ${audience}`)
  if (outcome) parts.push(`Outcome: ${outcome}`)
  parts.push(`Generate ${n} candidates.`)
  if (framework) parts.push(`Force framework: ${framework}.`)
  parts.push('Return JSON array as instructed. No prose.')

  const raw = await claudeJSON<Array<{ title: string; framework: string; why: string }>>(
    system,
    parts.join('\n')
  )

  const enriched: GeneratedCandidate[] = raw.map((item) => {
    const check: CheckResult = fullCheck(item.title)
    return {
      framework: item.framework ?? 'MAGIC',
      why: item.why ?? '',
      ...check,
    }
  })

  // Sort: PASS > WARN > REJECT, then by slopProb asc
  const order = { PASS: 0, WARN: 1, REJECT: 2 }
  enriched.sort((a, b) => {
    const vd = order[a.verdict] - order[b.verdict]
    if (vd !== 0) return vd
    return a.slopProb - b.slopProb
  })

  return enriched
}

export function detectFramework(title: string): string {
  const tl = title.toLowerCase()
  if (tl.startsWith('turn ')) return 'turn-into'
  if (tl.startsWith('from ')) return 'transformation'
  if (/^(why |what |how )/.test(tl)) return 'question'
  if (tl.startsWith('roasting ')) return 'roast'
  if (/ without | \(no |even if/.test(tl)) return 'negation'
  if (/ that sells| that converts| that closes| that drives/.test(tl)) return 'outcome-that-sells'
  if (/\b\d+ /.test(tl)) return 'specificity-stack'
  return 'magic'
}
