import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateTitles } from '@/lib/titles/generate'
import { db } from '@/lib/db/client'
import { titles } from '@/lib/db/schema'
import { batchDiversity } from '@/lib/titles/checks'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { topic, tool, duration, audience, outcome, n = 10, framework } = await req.json()
  if (!topic) return NextResponse.json({ error: 'topic is required' }, { status: 400 })

  const candidates = await generateTitles({ topic, tool, duration, audience, outcome, n, framework })
  const top5 = candidates.slice(0, 5)

  // Persist to DB
  const inserted = await db.insert(titles).values(
    top5.map((c) => ({
      topic,
      generatedTitle: c.title,
      framework: c.framework,
      ruleScore: c.ruleScore,
      slopProb: String(c.slopProb),
      noveltyOverlap: String(c.noveltyOverlap),
      verdict: c.verdict.toLowerCase(),
      rationale: c.why,
    }))
  ).returning()

  // Batch diversity check
  const diversity = batchDiversity(top5.map((t) => t.title))

  return NextResponse.json({
    titles: top5.map((c, i) => ({ ...c, id: inserted[i]?.id })),
    diversity,
  })
}
