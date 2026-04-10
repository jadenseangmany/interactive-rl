import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import type { ChapterInfo } from '@/router'
import { chapters } from '@/router'

interface Props {
  chapter: ChapterInfo
  children: ReactNode
}

export default function ChapterLayout({ chapter, children }: Props) {
  const prev = chapters.find((c) => c.number === chapter.number - 1)
  const next = chapters.find((c) => c.number === chapter.number + 1)

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <header className="mb-8">
        <p className="text-sm text-text-muted uppercase tracking-wider mb-1">
          Chapter {chapter.number} &mdash; {chapter.part}
        </p>
        <h1 className="text-3xl font-bold text-text">{chapter.title}</h1>
      </header>

      <div className="mdx-content">{children}</div>

      <nav className="flex justify-between mt-16 pt-6 border-t border-border">
        {prev ? (
          <Link to={`/ch/${prev.number}`} className="text-primary hover:text-primary-dark no-underline">
            &larr; Ch {prev.number}: {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/ch/${next.number}`} className="text-primary hover:text-primary-dark no-underline">
            Ch {next.number}: {next.title} &rarr;
          </Link>
        ) : <span />}
      </nav>
    </div>
  )
}
