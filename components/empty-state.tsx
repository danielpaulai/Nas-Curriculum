import Link from 'next/link'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  cta?: { label: string; href: string }
}

export default function EmptyState({ icon, title, description, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>
      {cta && (
        <Link
          href={cta.href}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          {cta.label}
        </Link>
      )}
    </div>
  )
}
