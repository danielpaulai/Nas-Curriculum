'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

// ── Types ──────────────────────────────────────────────────────────────────
interface SlotTitle {
  id?: string
  title: string
  verdict: string
  ruleScore: number
  slopProb: number
  framework: string
}

interface Slot {
  slotId: string
  date: Date
  topic: string
  tool: string
  notes: string
  titles: SlotTitle[]
  selectedTitle: string
  loading: boolean
  error?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────
function getNextTwoWeeks(): Date[] {
  const days: Date[] = []
  const today = new Date()
  // Start from next Monday
  const start = new Date(today)
  const dayOfWeek = today.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : (8 - dayOfWeek) % 7 || 7
  start.setDate(today.getDate() + daysUntilMonday)

  for (let i = 0; i < 14; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    // Monday–Saturday only (skip Sunday)
    if (d.getDay() !== 0) days.push(d)
    if (days.length >= 12) break
  }
  return days
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

const VERDICT_STYLES: Record<string, string> = {
  PASS: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  WARN: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  REJECT: 'bg-red-500/10 text-red-400 border border-red-500/20',
}

const AUDIENCE_OPTIONS = ['Nas.com store owners', 'entrepreneurs', 'beginners', 'creators']
const DURATION_OPTIONS = ['45 minutes', '60 minutes', '90 minutes', 'weekend']

// ── Page ───────────────────────────────────────────────────────────────────
export default function BatchTitlesPage() {
  const dates = getNextTwoWeeks()
  const [slots, setSlots] = useState<Slot[]>(
    dates.map((d, i) => ({
      slotId: `slot-${i}`,
      date: d,
      topic: '',
      tool: '',
      notes: '',
      titles: [],
      selectedTitle: '',
      loading: false,
    }))
  )
  const [globalAudience, setGlobalAudience] = useState('Nas.com store owners')
  const [globalDuration, setGlobalDuration] = useState('60 minutes')
  const [generating, setGenerating] = useState(false)
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null)

  function updateSlot(slotId: string, updates: Partial<Slot>) {
    setSlots((prev) => prev.map((s) => s.slotId === slotId ? { ...s, ...updates } : s))
  }

  const filledSlots = slots.filter((s) => s.topic.trim())

  async function generateAll() {
    if (filledSlots.length === 0) { toast.error('Add at least one topic first'); return }
    setGenerating(true)

    // Mark all filled slots as loading
    setSlots((prev) => prev.map((s) =>
      s.topic.trim() ? { ...s, loading: true, titles: [], selectedTitle: '' } : s
    ))

    try {
      const res = await fetch('/api/titles/batch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          audience: globalAudience,
          duration: globalDuration,
          items: filledSlots.map((s) => ({
            slotId: s.slotId,
            topic: s.topic,
            tool: s.tool || undefined,
            notes: s.notes || undefined,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Generation failed')

      // Merge results back into slots
      const resultMap: Record<string, { titles: SlotTitle[]; error?: string }> = {}
      for (const r of data.results) {
        resultMap[r.slotId] = r
      }

      setSlots((prev) => prev.map((s) => {
        const r = resultMap[s.slotId]
        if (!r) return { ...s, loading: false }
        const topTitle = r.titles?.[0]
        return {
          ...s,
          loading: false,
          titles: r.titles ?? [],
          selectedTitle: topTitle?.title ?? '',
          error: r.error,
        }
      }))
      toast.success(`Generated titles for ${filledSlots.length} sessions`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
      setSlots((prev) => prev.map((s) => ({ ...s, loading: false })))
    } finally {
      setGenerating(false)
    }
  }

  async function generateSingle(slot: Slot) {
    if (!slot.topic.trim()) { toast.error('Enter a topic first'); return }
    updateSlot(slot.slotId, { loading: true, titles: [], selectedTitle: '' })

    try {
      const res = await fetch('/api/titles/batch', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          audience: globalAudience,
          duration: globalDuration,
          items: [{
            slotId: slot.slotId,
            topic: slot.topic,
            tool: slot.tool || undefined,
            notes: slot.notes || undefined,
          }],
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed')
      const r = data.results?.[0]
      const topTitle = r?.titles?.[0]
      updateSlot(slot.slotId, {
        loading: false,
        titles: r?.titles ?? [],
        selectedTitle: topTitle?.title ?? '',
      })
      toast.success('Generated!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed')
      updateSlot(slot.slotId, { loading: false })
    }
  }

  function copyCalendar() {
    const lines = slots
      .filter((s) => s.selectedTitle)
      .map((s) => `${formatDate(s.date)} — ${s.selectedTitle}`)
      .join('\n')
    if (!lines) { toast.error('No titles selected yet'); return }
    navigator.clipboard.writeText(lines)
    toast.success('Calendar copied to clipboard!')
  }

  const titledCount = slots.filter((s) => s.selectedTitle).length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-bold text-white">2-Week Title Planner</h1>
          <p className="text-sm text-gray-400 mt-1">Plan up to 12 sessions, generate titles in one batch</p>
        </div>
        <div className="flex gap-3">
          <Link href="/titles" className="text-sm text-gray-400 hover:text-white transition-colors self-center">
            ← Single
          </Link>
          <Button
            variant="outline"
            onClick={copyCalendar}
            disabled={titledCount === 0}
            className="border-gray-700 text-gray-300 hover:text-white"
          >
            Copy Calendar ({titledCount})
          </Button>
          <Button
            onClick={generateAll}
            disabled={generating || filledSlots.length === 0}
            className="bg-indigo-600 hover:bg-indigo-500"
          >
            {generating ? `Generating…` : `Generate All (${filledSlots.length})`}
          </Button>
        </div>
      </div>

      {/* Global settings */}
      <div className="flex flex-wrap gap-6 mb-8 mt-6 bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Audience (all slots)</p>
          <div className="flex gap-2 flex-wrap">
            {AUDIENCE_OPTIONS.map((a) => (
              <button key={a} onClick={() => setGlobalAudience(a)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  globalAudience === a ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}>{a}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Duration (all slots)</p>
          <div className="flex gap-2 flex-wrap">
            {DURATION_OPTIONS.map((d) => (
              <button key={d} onClick={() => setGlobalDuration(d)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  globalDuration === d ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Slots grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {slots.map((slot) => {
          const isExpanded = expandedSlot === slot.slotId
          const hasTitle = !!slot.selectedTitle
          const isWeekend = slot.date.getDay() === 6

          return (
            <div
              key={slot.slotId}
              className={`border rounded-xl transition-all ${
                hasTitle
                  ? 'border-indigo-500/40 bg-gray-900'
                  : isWeekend
                  ? 'border-gray-800 bg-gray-900/50'
                  : 'border-gray-800 bg-gray-900'
              }`}
            >
              {/* Date header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => setExpandedSlot(isExpanded ? null : slot.slotId)}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    isWeekend ? 'bg-purple-500/10 text-purple-400' : 'bg-gray-800 text-gray-400'
                  }`}>
                    {slot.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
                  </span>
                  <span className="text-sm font-medium text-gray-300">
                    {slot.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {slot.loading && <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />}
                  {hasTitle && !slot.loading && <div className="w-2 h-2 rounded-full bg-emerald-500" />}
                  <span className="text-gray-600 text-xs">{isExpanded ? '▲' : '▼'}</span>
                </div>
              </div>

              {/* Selected title preview */}
              {hasTitle && !isExpanded && (
                <div className="px-4 pb-3">
                  <p className="text-sm text-white font-medium line-clamp-2">{slot.selectedTitle}</p>
                </div>
              )}

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-800 pt-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Topic</label>
                    <Input
                      placeholder="Session concept or topic…"
                      value={slot.topic}
                      onChange={(e) => updateSlot(slot.slotId, { topic: e.target.value })}
                      className="bg-gray-950 border-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Tool <span className="text-gray-700">(optional)</span></label>
                    <Input
                      placeholder="Claude, n8n, Lovable…"
                      value={slot.tool}
                      onChange={(e) => updateSlot(slot.slotId, { tool: e.target.value })}
                      className="bg-gray-950 border-gray-700 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Research notes <span className="text-gray-700">(optional)</span></label>
                    <Textarea
                      placeholder="Paste research, insights, stats, inspiration…"
                      value={slot.notes}
                      onChange={(e) => updateSlot(slot.slotId, { notes: e.target.value })}
                      className="bg-gray-950 border-gray-700 text-sm min-h-[72px] resize-none"
                    />
                  </div>

                  <Button
                    size="sm"
                    onClick={() => generateSingle(slot)}
                    disabled={slot.loading || !slot.topic.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-sm"
                  >
                    {slot.loading ? 'Generating…' : 'Generate for this slot'}
                  </Button>

                  {/* Title options */}
                  {slot.titles.length > 0 && (
                    <div className="space-y-2 mt-1">
                      <p className="text-xs text-gray-500 font-medium">Pick a title:</p>
                      {slot.titles.map((t, i) => (
                        <button
                          key={i}
                          onClick={() => updateSlot(slot.slotId, { selectedTitle: t.title })}
                          className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all ${
                            slot.selectedTitle === t.title
                              ? 'border-indigo-500 bg-indigo-500/10 text-white'
                              : 'border-gray-700 bg-gray-950 text-gray-300 hover:border-gray-600'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${VERDICT_STYLES[t.verdict?.toUpperCase()] ?? ''}`}>
                              {t.verdict?.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-600">{t.framework}</span>
                          </div>
                          {t.title}
                        </button>
                      ))}
                    </div>
                  )}

                  {slot.error && (
                    <p className="text-xs text-red-400">{slot.error}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom summary */}
      {titledCount > 0 && (
        <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Your 2-Week Calendar</h2>
            <Button size="sm" onClick={copyCalendar} className="bg-indigo-600 hover:bg-indigo-500 text-xs">
              Copy All
            </Button>
          </div>
          <div className="space-y-2">
            {slots.filter((s) => s.selectedTitle).map((s) => (
              <div key={s.slotId} className="flex items-start gap-3">
                <span className="text-xs text-gray-500 whitespace-nowrap pt-0.5 w-28">
                  {formatDate(s.date)}
                </span>
                <span className="text-sm text-gray-200">{s.selectedTitle}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
