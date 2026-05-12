import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { query, sources } = await req.json()
  if (!query) return NextResponse.json({ error: 'query is required' }, { status: 400 })

  return NextResponse.json({ message: 'Research run coming in Day 5', params: { query, sources } })
}
