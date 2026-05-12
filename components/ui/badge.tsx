import * as React from 'react'
import { cn } from '@/lib/utils'

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & {
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive'
  }
>(({ className, variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-indigo-600/20 text-indigo-400 border-indigo-600/30',
    secondary: 'bg-gray-700 text-gray-300 border-gray-600',
    success: 'bg-green-600/20 text-green-400 border-green-600/30',
    warning: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30',
    destructive: 'bg-red-600/20 text-red-400 border-red-600/30',
  }
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = 'Badge'

export { Badge }
