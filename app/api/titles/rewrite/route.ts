import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rewriteAndRank } from '@/lib/titles/rewrite'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, n = 5, llm = false, context = '' } = await req.json()
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  const result = await rewriteAndRank(title, n, llm, context)
  return NextResponse.json(result)
}
