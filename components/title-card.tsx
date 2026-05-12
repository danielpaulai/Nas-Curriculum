'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface TitleCardProps {
  title: string
  framework?: string
  ruleScore?: number
  slopProb?: number
  noveltyOverlap?: number
  verdict?: 'pass' | 'warn' | 'reject'
  rationale?: string
  onAccept?: () => void
  onReject?: () => void
  onRewrite?: () => void
  onCopy?: () => void
  className?: string
}

export default function TitleCard({
  title,
  framework,
  ruleScore,
  slopProb,
  noveltyOverlap,
  verdict = 'pass',
  rationale,
  onAccept,
  onReject,
  onRewrite,
  onCopy,
  className,
}: TitleCardProps) {
  const verdictVariant = verdict === 'pass' ? 'success' : verdict === 'warn' ? 'warning' : 'destructive'

  return (
    <div className={cn('rounded-xl border border-gray-800 bg-gray-900 p-5 space-y-3', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-base font-semibold text-white leading-snug">{title}</p>
        <Badge variant={verdictVariant} className="shrink-0 capitalize">{verdict}</Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        {framework && <Badge variant="secondary">{framework}</Badge>}
        {ruleScore != null && <Badge variant="secondary">Rules: {ruleScore}/5</Badge>}
        {slopProb != null && (
          <Badge variant={slopProb > 0.5 ? 'warning' : 'secondary'}>
            Slop: {(slopProb * 100).toFixed(0)}%
          </Badge>
        )}
        {noveltyOverlap != null && (
          <Badge variant={noveltyOverlap > 0.8 ? 'warning' : 'secondary'}>
            Overlap: {(noveltyOverlap * 100).toFixed(0)}%
          </Badge>
        )}
      </div>

      {rationale && <p className="text-xs text-gray-400">{rationale}</p>}

      <div className="flex gap-2 pt-1">
        {onAccept && (
          <Button size="sm" onClick={onAccept}>Accept</Button>
        )}
        {onReject && (
          <Button size="sm" variant="outline" onClick={onReject}>Reject</Button>
        )}
        {onRewrite && (
          <Button size="sm" variant="ghost" onClick={onRewrite}>Rewrite</Button>
        )}
        {onCopy && (
          <Button size="sm" variant="ghost" onClick={onCopy}>Copy</Button>
        )}
      </div>
    </div>
  )
}
