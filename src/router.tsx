import { lazy } from 'react'

export interface ChapterInfo {
  number: number
  slug: string
  title: string
  part: string
}

export const chapters: ChapterInfo[] = [
  { number: 1, slug: 'ch01-introduction', title: 'Introduction', part: 'Foundations' },
  { number: 2, slug: 'ch02-bandits', title: 'Multi-Armed Bandits', part: 'Tabular Methods' },
  { number: 3, slug: 'ch03-mdps', title: 'Finite Markov Decision Processes', part: 'Tabular Methods' },
  { number: 4, slug: 'ch04-dynamic-programming', title: 'Dynamic Programming', part: 'Tabular Methods' },
  { number: 5, slug: 'ch05-monte-carlo', title: 'Monte Carlo Methods', part: 'Tabular Methods' },
  { number: 6, slug: 'ch06-td-learning', title: 'Temporal-Difference Learning', part: 'Tabular Methods' },
  { number: 7, slug: 'ch07-nstep', title: 'n-step Bootstrapping', part: 'Tabular Methods' },
  { number: 8, slug: 'ch08-planning', title: 'Planning and Learning', part: 'Tabular Methods' },
  { number: 9, slug: 'ch09-approx-prediction', title: 'On-policy Prediction with Approximation', part: 'Approximate Methods' },
  { number: 10, slug: 'ch10-approx-control', title: 'On-policy Control with Approximation', part: 'Approximate Methods' },
  { number: 11, slug: 'ch11-offpolicy-approx', title: 'Off-policy Methods with Approximation', part: 'Approximate Methods' },
  { number: 12, slug: 'ch12-eligibility-traces', title: 'Eligibility Traces', part: 'Approximate Methods' },
  { number: 13, slug: 'ch13-policy-gradient', title: 'Policy Gradient Methods', part: 'Approximate Methods' },
  { number: 14, slug: 'ch14-psychology', title: 'Psychology', part: 'Looking Deeper' },
  { number: 15, slug: 'ch15-neuroscience', title: 'Neuroscience', part: 'Looking Deeper' },
  { number: 16, slug: 'ch16-applications', title: 'Applications and Case Studies', part: 'Looking Deeper' },
  { number: 17, slug: 'ch17-frontiers', title: 'Frontiers', part: 'Looking Deeper' },
]

// Lazy-load chapter pages
export const chapterComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  'ch02-bandits': lazy(() => import('./chapters/ch02-bandits')),
}
