import Link from 'next/link'
import EmptyState from '@/components/empty-state'

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Session performance, attendance trends, what&apos;s working</p>
        </div>
        <Link
          href="/analytics/predict"
          className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:border-indigo-500 hover:text-white transition-colors"
        >
          Predict attendance →
        </Link>
      </div>
      <EmptyState
        icon="📊"
        title="Coming in Day 3"
        description="Module 5 (Analytics) is next after the Title Generator. It will pull live data from Google Sheets and show charts + a Claude narrative."
      />
    </div>
  )
}
