import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  const allowed = (process.env.AUTHORIZED_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
  if (allowed.includes((email as string).trim().toLowerCase())) {
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
}
