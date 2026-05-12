export default function CampaignDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-2">Campaign</h1>
      <p className="text-sm text-gray-400">ID: {params.id}</p>
      <p className="text-sm text-gray-500 mt-8">Full campaign view coming in Day 6.</p>
    </div>
  )
}
