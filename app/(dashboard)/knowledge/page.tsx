import Link from 'next/link'
import EmptyState from '@/components/empty-state'

export default function KnowledgePage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Knowledge Base</h1>
          <p className="text-sm text-gray-400 mt-1">Meeting transcripts, extracted facts, semantic search</p>
        </div>
        <Link
          href="/knowledge/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          + New meeting
        </Link>
      </div>
      <EmptyState
        icon="📚"
        title="No meetings yet"
        description="Upload a transcript or paste meeting notes to extract strategic facts and update your knowledge base."
        cta={{ label: 'Upload first meeting', href: '/knowledge/new' }}
      />
    </div>
  )
}
