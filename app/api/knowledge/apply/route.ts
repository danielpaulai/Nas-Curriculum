import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { fact_ids } = await req.json()
  if (!Array.isArray(fact_ids) || fact_ids.length === 0) {
    return NextResponse.json({ error: 'fact_ids array is required' }, { status: 400 })
  }

  // Mark facts as applied
  const { data: facts } = await supabase
    .from('kb_entries')
    .update({ status: 'applied' })
    .in('id', fact_ids)
    .select()

  // Record the change in kb_changes
  if (facts && facts.length > 0) {
    await supabase.from('kb_changes').insert(
      facts.map((f) => ({
        file_path: f.applied_to_files?.[0] ?? 'knowledge-base',
        change_summary: f.fact,
        diff_before: null,
        diff_after: f.fact,
      }))
    )
  }

  return NextResponse.json({ applied: facts?.length ?? 0, facts })
}
