import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fullCheck } from '@/lib/titles/checks'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await req.json()
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const result = fullCheck(title)
  return NextResponse.json(result)
}
