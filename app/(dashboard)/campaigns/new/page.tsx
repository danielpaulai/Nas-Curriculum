import EmptyState from '@/components/empty-state'

export default function CampaignsNewPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">New Campaign</h1>
      <p className="text-sm text-gray-400 mb-8">Brief → Claude generates assets in Nas voice</p>
      <EmptyState
        icon="✍️"
        title="Coming in Day 6"
        description="Module 4 (Campaign Drafter) is scheduled for Day 6. The brief form and Claude draft endpoint will be implemented then."
      />
    </div>
  )
}
