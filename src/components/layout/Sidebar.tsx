import { Link, useLocation } from 'react-router-dom'
import { chapters } from '@/router'

const partColors: Record<string, string> = {
  'Foundations': 'text-purple-500',
  'Tabular Methods': 'text-blue-500',
  'Approximate Methods': 'text-emerald-500',
  'Looking Deeper': 'text-amber-500',
}

export default function Sidebar() {
  const location = useLocation()
  const parts = [...new Set(chapters.map((ch) => ch.part))]

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-dim border-r border-border overflow-y-auto max-lg:hidden">
      <Link to="/" className="block px-6 py-5 text-lg font-bold text-text no-underline hover:text-primary">
        Interactive RL
      </Link>
      <nav className="px-3 pb-6">
        {parts.map((part) => (
          <div key={part} className="mb-4">
            <h3 className={`px-3 mb-1 text-xs font-semibold uppercase tracking-wider ${partColors[part] ?? 'text-text-muted'}`}>
              {part}
            </h3>
            {chapters
              .filter((ch) => ch.part === part)
              .map((ch) => {
                const isActive = location.pathname === `/ch/${ch.number}`
                return (
                  <Link
                    key={ch.number}
                    to={`/ch/${ch.number}`}
                    className={`block px-3 py-1.5 rounded-md text-sm no-underline transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-text-muted hover:text-text hover:bg-surface-bright'
                    }`}
                  >
                    {ch.number}. {ch.title}
                  </Link>
                )
              })}
          </div>
        ))}
      </nav>
    </aside>
  )
}
