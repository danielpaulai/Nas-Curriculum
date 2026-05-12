import EmptyState from '@/components/empty-state'

export default function ResearchNewPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">New Research</h1>
      <p className="text-sm text-gray-400 mb-8">Query web search, Perplexity, or social scrapers</p>
      <EmptyState
        icon="🌐"
        title="Coming in Day 5"
        description="Module 6 (Research) is scheduled for Day 5. It will use Anthropic's web_search tool and synthesize results into ranked session ideas."
      />
    </div>
  )
}
