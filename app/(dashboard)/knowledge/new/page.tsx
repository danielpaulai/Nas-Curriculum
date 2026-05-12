import EmptyState from '@/components/empty-state'

export default function KnowledgeNewPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Upload Meeting</h1>
      <p className="text-sm text-gray-400 mb-8">Paste a transcript or upload .txt / .md / .pdf / .docx</p>
      <EmptyState
        icon="📝"
        title="Coming in Day 4"
        description="Module 1 (Knowledge Base) is scheduled for Day 4 of the build. The upload form and Claude extraction will be implemented then."
      />
    </div>
  )
}
