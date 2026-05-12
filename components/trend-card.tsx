'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TrendCardProps {
  topic: string
  source: string
  velocityScore?: number
  surfacedAt?: string
  onInvestigate?: () => void
}

export default function TrendCard({ topic, source, velocityScore, surfacedAt, onInvestigate }: TrendCardProps) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-4 flex items-center justify-between gap-4">
      <div className="space-y-1.5">
        <p className="text-sm font-semibold text-white">{topic}</p>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{source}</Badge>
          {velocityScore != null && (
            <span className="text-xs text-gray-400">velocity: {velocityScore.toFixed(1)}</span>
          )}
          {surfacedAt && (
            <span className="text-xs text-gray-500">
              {new Date(surfacedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      {onInvestigate && (
        <Button size="sm" variant="outline" onClick={onInvestigate}>
          Investigate →
        </Button>
      )}
    </div>
  )
}
