export default function KnowledgeMeetingPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Meeting</h1>
      <p className="text-sm text-gray-400">ID: {params.id}</p>
      <p className="text-sm text-gray-500 mt-8">Full meeting view coming in Day 4.</p>
    </div>
  )
}
