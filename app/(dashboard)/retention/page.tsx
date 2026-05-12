import EmptyState from '@/components/empty-state'

export default function RetentionPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Retention Strategy</h1>
          <p className="text-sm text-gray-400 mt-1">Churn cohorts, clustering, experiments</p>
        </div>
        <a
          href="/retention/upload"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Upload data
        </a>
      </div>
      <EmptyState
        icon="🔄"
        title="No retention data yet"
        description="Upload the Failed Renewals & Unsub xlsx or pull from Google Sheet to start analyzing churn."
        cta={{ label: 'Upload xlsx', href: '/retention/upload' }}
      />
    </div>
  )
}
