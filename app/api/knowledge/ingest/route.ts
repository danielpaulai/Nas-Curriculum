import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { claudeJSON } from '@/lib/anthropic'
import { EXTRACT_FACTS_SYSTEM, extractFactsPrompt } from '@/lib/prompts/extract-facts'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, transcript, date, participants } = await req.json()
  if (!title || !transcript) {
    return NextResponse.json({ error: 'title and transcript are required' }, { status: 400 })
  }

  // Save meeting
  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({ title, raw_transcript: transcript, meeting_date: date ?? null, participants: participants ?? [], source: 'manual_paste' })
    .select()
    .single()

  if (meetingError) return NextResponse.json({ error: meetingError.message }, { status: 500 })

  // Extract facts via Claude
  const extracted = await claudeJSON<Array<{
    category: string
    fact: string
    confidence: number
    suggestedFile: string | null
  }>>(EXTRACT_FACTS_SYSTEM, extractFactsPrompt(transcript))

  // Save extracted facts
  const { data: kbEntries } = await supabase
    .from('kb_entries')
    .insert(
      extracted.map((f) => ({
        source_meeting_id: meeting.id,
        category: f.category,
        fact: f.fact,
        confidence: f.confidence,
        applied_to_files: f.suggestedFile ? [f.suggestedFile] : [],
        status: 'pending',
      }))
    )
    .select()

  // Mark meeting as processed
  await supabase.from('meetings').update({ processed: true }).eq('id', meeting.id)

  return NextResponse.json({ meeting_id: meeting.id, extracted_facts: kbEntries })
}
