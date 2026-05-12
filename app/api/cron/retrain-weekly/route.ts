import { NextResponse } from 'next/server'

// Vercel Cron: runs weekly on Sunday at midnight
// Add to vercel.json: { "crons": [{ "path": "/api/cron/retrain-weekly", "schedule": "0 0 * * 0" }] }
export async function GET() {
  // Stub — full implementation in Day 4 (KB module)
  return NextResponse.json({ message: 'Weekly retrain cron — coming in Day 4' })
}
