export default function DashboardPage() {
  const modules = [
    {
      title: 'Knowledge Base',
      href: '/knowledge',
      icon: '📚',
      stat: '—',
      label: 'facts pending review',
    },
    {
      title: 'Title Generator',
      href: '/titles',
      icon: '✏️',
      stat: '—',
      label: 'titles generated this week',
    },
    {
      title: 'Analytics',
      href: '/analytics',
      icon: '📊',
      stat: '—',
      label: 'avg attendance (last 30d)',
    },
    {
      title: 'Research',
      href: '/research',
      icon: '🔍',
      stat: '—',
      label: 'trending topics today',
    },
    {
      title: 'Campaigns',
      href: '/campaigns',
      icon: '📣',
      stat: '—',
      label: 'drafts ready',
    },
    {
      title: 'Retention',
      href: '/retention',
      icon: '🔄',
      stat: '—',
      label: 'churn rate',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Nas.com School — internal operations</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {modules.map((m) => (
          <a
            key={m.href}
            href={m.href}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5 hover:border-indigo-500 transition-colors group"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{m.icon}</span>
              <span className="text-sm font-semibold text-white group-hover:text-indigo-400 transition-colors">
                {m.title}
              </span>
            </div>
            <div className="text-3xl font-bold text-white mb-0.5">{m.stat}</div>
            <div className="text-xs text-gray-500">{m.label}</div>
          </a>
        ))}
      </div>
    </div>
  )
}
