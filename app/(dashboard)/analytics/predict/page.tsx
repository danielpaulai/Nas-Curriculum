import EmptyState from '@/components/empty-state'

export default function AnalyticsPredictPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Predict Attendance</h1>
      <p className="text-sm text-gray-400 mb-8">Paste a draft title → see predicted signups and attendance</p>
      <EmptyState
        icon="🎯"
        title="Coming in Day 3"
        description="The prediction engine uses Voyage embeddings to find comparable historical sessions. Requires the analytics data to be populated first."
        cta={{ label: 'View analytics', href: '/analytics' }}
      />
    </div>
  )
}
