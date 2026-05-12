import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title_id, action, reason, edited_version } = await req.json()
  if (!title_id || !action) {
    return NextResponse.json({ error: 'title_id and action are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('title_feedback')
    .insert({ title_id, action, reason: reason ?? null, edited_version: edited_version ?? null })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data })
}
