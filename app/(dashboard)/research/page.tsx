import Link from 'next/link'
import EmptyState from '@/components/empty-state'

export default function ResearchPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Research</h1>
          <p className="text-sm text-gray-400 mt-1">Trending tools, topics, competitive moves</p>
        </div>
        <Link
          href="/research/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          + New research
        </Link>
      </div>
      <EmptyState
        icon="🔍"
        title="No research runs yet"
        description="Run a research query to discover trending AI tools and topics relevant to Nas.com store owners."
        cta={{ label: 'Start research', href: '/research/new' }}
      />
    </div>
  )
}
