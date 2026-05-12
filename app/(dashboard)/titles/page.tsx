'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface GeneratedTitle {
  id?: string
  title: string
  framework: string
  why: string
  ruleScore: number
  slopProb: number
  noveltyOverlap: number
  verdict: 'PASS' | 'WARN' | 'REJECT'
  reasons: string[]
  ruleFlags: string[]
}

interface DiversityResult {
  issues: string[]
  diverse: boolean
}

type Chip = { label: string; value: string }

const DURATION_CHIPS: Chip[] = [
  { label: '45 min', value: '45 minutes' },
  { label: '60 min', value: '60 minutes' },
  { label: '90 min', value: '90 minutes' },
  { label: 'Weekend', value: 'weekend' },
]

const AUDIENCE_CHIPS: Chip[] = [
  { label: 'E-comm owners', value: 'Nas.com store owners' },
  { label: 'Entrepreneurs', value: 'entrepreneurs' },
  { label: 'Beginners', value: 'beginners' },
]

const VERDICT_COLOR: Record<string, 'success' | 'warning' | 'destructive'> = {
  PASS: 'success',
  WARN: 'warning',
  REJECT: 'destructive',
}

export default function TitlesPage() {
  const [topic, setTopic] = useState('')
  const [tool, setTool] = useState('')
  const [duration, setDuration] = useState('60 minutes')
  const [audience, setAudience] = useState('Nas.com store owners')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GeneratedTitle[]>([])
  const [diversity, setDiversity] = useState<DiversityResult | null>(null)
  const [rewriting, setRewriting] = useState<string | null>(null)

  async function generate() {
    if (!topic.trim()) { toast.error('Enter a topic first'); return }
    setLoading(true)
    setResults([])
    setDiversity(null)
    try {
      const res = await fetch('/api/titles/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ topic, tool: tool || undefined, duration, audience, n: 10 }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')
      setResults(data.titles)
      setDiversity(data.diversity)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleFeedback(titleId: string | undefined, titleText: string, action: 'accepted' | 'rejected') {
    try {
      await fetch('/api/titles/feedback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title_id: titleId, title: titleText, action }),
      })
      toast.success(action === 'accepted' ? 'Accepted ✓' : 'Rejected')
    } catch {
      // silent
    }
  }

  async function handleRewrite(titleText: string, idx: number) {
    setRewriting(titleText)
    try {
      const res = await fetch('/api/titles/rewrite', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ title: titleText, n: 5, llm: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Rewrite failed')
      // Replace the card with rewrites
      const newResults = [...results]
      const top = data.rewrites?.[0]
      if (top) {
        newResults[idx] = { ...newResults[idx], title: top.title, verdict: top.verdict, ruleScore: top.ruleScore, slopProb: top.slopProb, noveltyOverlap: top.noveltyOverlap, reasons: top.reasons }
        setResults(newResults)
      }
      toast.success('Rewritten')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Rewrite failed')
    } finally {
      setRewriting(null)
    }
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Title Generator</h1>
          <p className="text-sm text-gray-400 mt-1">10-framework Nas-voice engine + slop detector</p>
        </div>
        <Link href="/titles/history" className="text-sm text-gray-400 hover:text-white transition-colors">
          History →
        </Link>
      </div>

      {/* Input form */}
      <div className="space-y-5 bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <div>
          <Label htmlFor="topic" className="mb-2 block">Topic / session concept</Label>
          <Textarea
            id="topic"
            placeholder="e.g. Build an AI store with Lovable in 60 minutes"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[80px]"
            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate() }}
          />
        </div>

        <div>
          <Label htmlFor="tool" className="mb-2 block">Tool <span className="text-gray-500">(optional)</span></Label>
          <Input
            id="tool"
            placeholder="Claude, n8n, Lovable, Canva…"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
          />
        </div>

        <div>
          <Label className="mb-2 block">Duration</Label>
          <div className="flex gap-2 flex-wrap">
            {DURATION_CHIPS.map((c) => (
              <button
                key={c.value}
                onClick={() => setDuration(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  duration === c.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Audience</Label>
          <div className="flex gap-2 flex-wrap">
            {AUDIENCE_CHIPS.map((c) => (
              <button
                key={c.value}
                onClick={() => setAudience(c.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  audience === c.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={generate}
          disabled={loading || !topic.trim()}
          className="w-full"
          size="lg"
        >
          {loading ? 'Generating…' : 'Generate titles ⌘↵'}
        </Button>
      </div>

      {/* Diversity warning */}
      {diversity && !diversity.diverse && (
        <div className="mb-4 rounded-lg bg-yellow-900/30 border border-yellow-700/50 p-4">
          <p className="text-sm font-semibold text-yellow-400 mb-1">Batch diversity warning</p>
          {diversity.issues.map((issue, i) => (
            <p key={i} className="text-xs text-yellow-300">⚠ {issue}</p>
          ))}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Top {results.length} titles</p>
          {results.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <p className="text-base font-semibold text-white leading-snug">{item.title}</p>
                <Badge variant={VERDICT_COLOR[item.verdict]} className="shrink-0 capitalize">
                  {item.verdict}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{item.framework}</Badge>
                <Badge variant="secondary">Rules: {item.ruleScore}/5</Badge>
                <Badge variant={item.slopProb > 0.3 ? 'warning' : 'secondary'}>
                  Slop: {(item.slopProb * 100).toFixed(0)}%
                </Badge>
                <Badge variant={item.noveltyOverlap > 0.35 ? 'warning' : 'secondary'}>
                  Overlap: {(item.noveltyOverlap * 100).toFixed(0)}%
                </Badge>
              </div>

              {item.why && <p className="text-xs text-gray-400 mb-4">{item.why}</p>}

              {item.reasons.length > 0 && (
                <p className="text-xs text-amber-400 mb-3">⚠ {item.reasons.join(' · ')}</p>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => { handleFeedback(item.id, item.title, 'accepted'); }}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleFeedback(item.id, item.title, 'rejected')}
                >
                  Reject
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={rewriting === item.title}
                  onClick={() => handleRewrite(item.title, idx)}
                >
                  {rewriting === item.title ? 'Rewriting…' : 'Rewrite'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(item.title)}
                >
                  Copy
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && results.length === 0 && (
        <p className="text-center text-sm text-gray-600 mt-12">
          Enter a topic above and hit Generate. Cmd+Enter also works.
        </p>
      )}
    </div>
  )
}
