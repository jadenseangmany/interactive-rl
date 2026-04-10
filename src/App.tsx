import { Routes, Route } from 'react-router-dom'
import { Suspense } from 'react'
import Sidebar from './components/layout/Sidebar'
import LandingPage from './components/layout/LandingPage'
import ChapterLayout from './components/layout/ChapterLayout'
import { chapters, chapterComponents } from './router'

function ChapterPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 text-text-muted">
      <p className="text-lg">{title} — Coming Soon</p>
    </div>
  )
}

export default function App() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <main className="flex-1 ml-64 max-lg:ml-0">
        <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {chapters.map((ch) => {
              const Component = chapterComponents[ch.slug]
              return (
                <Route
                  key={ch.slug}
                  path={`/ch/${ch.number}`}
                  element={
                    <ChapterLayout chapter={ch}>
                      {Component ? <Component /> : <ChapterPlaceholder title={ch.title} />}
                    </ChapterLayout>
                  }
                />
              )
            })}
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}
