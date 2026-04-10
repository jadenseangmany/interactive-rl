import { Link } from 'react-router-dom'
import { chapters } from '@/router'

export default function LandingPage() {
  const parts = [...new Set(chapters.map((ch) => ch.part))]

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-5xl font-bold text-text mb-4">
        Interactive RL
      </h1>
      <p className="text-xl text-text-muted mb-2 max-w-2xl">
        Learn Reinforcement Learning by playing with it. Adjust parameters, watch algorithms
        converge, and build intuition through interactive exploration.
      </p>
      <p className="text-sm text-text-muted mb-12">
        Based on Sutton &amp; Barto's <em>Reinforcement Learning: An Introduction</em> (2nd ed.)
      </p>

      {parts.map((part) => (
        <div key={part} className="mb-8">
          <h2 className="text-lg font-semibold text-text mb-3">{part}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {chapters
              .filter((ch) => ch.part === part)
              .map((ch) => (
                <Link
                  key={ch.number}
                  to={`/ch/${ch.number}`}
                  className="block p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors no-underline"
                >
                  <span className="text-sm text-text-muted">Chapter {ch.number}</span>
                  <h3 className="text-base font-medium text-text mt-0.5">{ch.title}</h3>
                </Link>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
