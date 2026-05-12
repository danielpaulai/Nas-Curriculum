import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title } = await req.json()
  if (!title) return NextResponse.json({ error: 'title is required' }, { status: 400 })

  return NextResponse.json({ message: 'Attendance prediction coming in Day 3', params: { title } })
}
