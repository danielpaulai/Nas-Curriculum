'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: '⬛' },
  { href: '/knowledge', label: 'Knowledge Base', icon: '📚' },
  { href: '/titles', label: 'Title Generator', icon: '✏️' },
  { href: '/analytics', label: 'Analytics', icon: '📊' },
  { href: '/research', label: 'Research', icon: '🔍' },
  { href: '/campaigns', label: 'Campaigns', icon: '📣' },
  { href: '/retention', label: 'Retention', icon: '🔄' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-950">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-gray-800">
        <span className="text-sm font-semibold text-white tracking-tight">Nas School OS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => {
          const active = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-800 px-2 py-3">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <span className="text-base leading-none">⚙️</span>
          Settings
        </Link>
      </div>
    </aside>
  )
}
