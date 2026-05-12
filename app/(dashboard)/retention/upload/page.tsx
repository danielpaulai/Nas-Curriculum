import EmptyState from '@/components/empty-state'

export default function RetentionUploadPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Upload Retention Data</h1>
      <p className="text-sm text-gray-400 mb-8">Drag & drop your Failed Renewals & Unsub xlsx</p>
      <EmptyState
        icon="📂"
        title="Coming in Day 7"
        description="Module 3 (Retention) is scheduled for Day 7. The xlsx upload and Claude clustering will be implemented then."
      />
    </div>
  )
}
