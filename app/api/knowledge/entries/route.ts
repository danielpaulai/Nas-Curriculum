import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/client'
import { kbEntries } from '@/lib/db/schema'
import { eq, desc, ilike, or } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const category = searchParams.get('category')

  let query = db.select().from(kbEntries).orderBy(desc(kbEntries.createdAt)).$dynamic()

  if (q) {
    query = query.where(or(ilike(kbEntries.fact, `%${q}%`), ilike(kbEntries.category, `%${q}%`)))
  } else if (category && category !== 'all') {
    query = query.where(eq(kbEntries.category, category))
  }

  const rows = await query
  return NextResponse.json({ entries: rows })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { category, fact, confidence = '0.8', status = 'active' } = await req.json()
  if (!category || !fact) return NextResponse.json({ error: 'category and fact are required' }, { status: 400 })

  const [entry] = await db.insert(kbEntries).values({
    category: category.trim(),
    fact: fact.trim(),
    confidence: String(confidence),
    status,
  }).returning()

  return NextResponse.json({ entry }, { status: 201 })
}
