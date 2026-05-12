import Link from 'next/link'
import EmptyState from '@/components/empty-state'

export default function CampaignsPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Campaign Drafter</h1>
          <p className="text-sm text-gray-400 mt-1">Draft email and social copy in Nas voice</p>
        </div>
        <Link
          href="/campaigns/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          + New campaign
        </Link>
      </div>
      <EmptyState
        icon="📣"
        title="No campaigns yet"
        description="Draft a new campaign — email, social post, WhatsApp, or in-app notification. All in Nas voice."
        cta={{ label: 'Draft first campaign', href: '/campaigns/new' }}
      />
    </div>
  )
}
