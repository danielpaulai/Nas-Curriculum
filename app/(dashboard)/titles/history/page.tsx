import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db/client'
import { titles, titleFeedback } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import { Badge } from '@/components/ui/badge'

const VERDICT_COLOR: Record<string, 'success' | 'warning' | 'destructive'> = {
  pass: 'success',
  warn: 'warning',
  reject: 'destructive',
}

export default async function TitlesHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  let rows: Array<{id: string; generatedTitle: string; topic: string; framework: string | null; verdict: string | null; ruleScore: number | null; slopProb: string | null; noveltyOverlap: string | null; createdAt: Date | null}> = []
  let feedbackMap = new Map<string, {action: string; titleId: string | null}>()

  try {
    rows = await db.select().from(titles).orderBy(desc(titles.createdAt)).limit(100)
    const feedbacks = await db.select().from(titleFeedback)
    feedbackMap = new Map(feedbacks.map((f) => [f.titleId ?? '', f]))
  } catch {
    // DB not connected in dev — show empty state
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Title History</h1>
          <p className="text-sm text-gray-400 mt-1">{rows.length} titles generated</p>
        </div>
        <Link href="/titles" className="text-sm text-gray-400 hover:text-white transition-colors">
          ← Generate new
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <p className="text-4xl mb-4">✏️</p>
          <p className="font-semibold text-white mb-1">No titles yet</p>
          <p className="text-sm">Generate your first session title to see history here.</p>
          <Link href="/titles" className="mt-4 inline-block text-indigo-400 hover:underline text-sm">
            Go to generator →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm text-left">
            <thead className="border-b border-gray-800 bg-gray-900">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-400">Title</th>
                <th className="px-4 py-3 font-medium text-gray-400">Topic</th>
                <th className="px-4 py-3 font-medium text-gray-400">Framework</th>
                <th className="px-4 py-3 font-medium text-gray-400">Verdict</th>
                <th className="px-4 py-3 font-medium text-gray-400">Scores</th>
                <th className="px-4 py-3 font-medium text-gray-400">Feedback</th>
                <th className="px-4 py-3 font-medium text-gray-400">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-900/50">
              {rows.map((row) => {
                const fb = feedbackMap.get(row.id)
                return (
                  <tr key={row.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-white font-medium max-w-xs">
                      <p className="truncate" title={row.generatedTitle}>{row.generatedTitle}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-[140px]">
                      <p className="truncate" title={row.topic}>{row.topic}</p>
                    </td>
                    <td className="px-4 py-3">
                      {row.framework && <Badge variant="secondary">{row.framework}</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      {row.verdict && (
                        <Badge variant={VERDICT_COLOR[row.verdict] ?? 'secondary'}>
                          {row.verdict}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs space-x-2">
                      {row.ruleScore != null && <span>R:{row.ruleScore}/5</span>}
                      {row.slopProb != null && <span>S:{(Number(row.slopProb) * 100).toFixed(0)}%</span>}
                      {row.noveltyOverlap != null && <span>N:{(Number(row.noveltyOverlap) * 100).toFixed(0)}%</span>}
                    </td>
                    <td className="px-4 py-3">
                      {fb && (
                        <Badge variant={fb.action === 'accepted' ? 'success' : fb.action === 'rejected' ? 'destructive' : 'secondary'}>
                          {fb.action}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
