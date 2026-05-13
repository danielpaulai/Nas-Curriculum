import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTitles } from '@/lib/titles/generate'
import { db } from '@/lib/db/client'
import { titles } from '@/lib/db/schema'

interface BatchItem {
  slotId: string
  topic: string
  tool?: string
  duration?: string
  audience?: string
  notes?: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { items, audience = 'Nas.com store owners', duration = '60 minutes' } = await req.json() as {
    items: BatchItem[]
    audience?: string
    duration?: string
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'items array is required' }, { status: 400 })
  }
  if (items.length > 14) {
    return NextResponse.json({ error: 'Max 14 items per batch' }, { status: 400 })
  }

  const results = await Promise.allSettled(
    items.map(async (item) => {
      if (!item.topic?.trim()) return { slotId: item.slotId, titles: [], error: 'No topic' }

      // Append any research notes to the topic for richer context
      const enrichedTopic = item.notes?.trim()
        ? `${item.topic}\n\nContext: ${item.notes}`
        : item.topic

      const candidates = await generateTitles({
        topic: enrichedTopic,
        tool: item.tool,
        duration: item.duration ?? duration,
        audience: item.audience ?? audience,
        n: 7,
      })

      const top3 = candidates.slice(0, 3)

      // Persist to DB
      const inserted = await db.insert(titles).values(
        top3.map((c) => ({
          topic: item.topic,
          generatedTitle: c.title,
          framework: c.framework,
          ruleScore: c.ruleScore,
          slopProb: String(c.slopProb),
          noveltyOverlap: String(c.noveltyOverlap),
          verdict: c.verdict.toLowerCase(),
          rationale: c.why,
        }))
      ).returning()

      return {
        slotId: item.slotId,
        titles: top3.map((c, i) => ({ ...c, id: inserted[i]?.id })),
      }
    })
  )

  const output = results.map((r, i) => {
    if (r.status === 'fulfilled') return r.value
    return { slotId: items[i].slotId, titles: [], error: String(r.reason) }
  })

  return NextResponse.json({ results: output })
}
