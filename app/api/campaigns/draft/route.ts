import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, audience, brief, sequence_length } = await req.json()
  if (!type || !brief) {
    return NextResponse.json({ error: 'type and brief are required' }, { status: 400 })
  }

  return NextResponse.json({ message: 'Campaign draft coming in Day 6', params: { type, audience, brief, sequence_length } })
}
