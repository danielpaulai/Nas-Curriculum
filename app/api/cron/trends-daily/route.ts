import { NextResponse } from 'next/server'

// Vercel Cron: runs at 8am daily
// Add to vercel.json: { "crons": [{ "path": "/api/cron/trends-daily", "schedule": "0 8 * * *" }] }
export async function GET() {
  // Validate cron secret to prevent unauthorized calls
  // In production: check Authorization header against CRON_SECRET env var

  // Stub — full implementation in Day 5
  return NextResponse.json({ message: 'Daily trends cron — coming in Day 5' })
}
