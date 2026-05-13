import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/client'
import { kbEntries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const { category, fact, confidence, status } = await req.json()

  const updates: Partial<typeof kbEntries.$inferInsert> = {}
  if (category !== undefined) updates.category = category
  if (fact !== undefined) updates.fact = fact
  if (confidence !== undefined) updates.confidence = String(confidence)
  if (status !== undefined) updates.status = status

  const [entry] = await db.update(kbEntries).set(updates).where(eq(kbEntries.id, id)).returning()
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json({ entry })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(kbEntries).where(eq(kbEntries.id, id))
  return NextResponse.json({ ok: true })
}
