import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

interface Props {
  title: string
  questions: Question[]
}

function QuestionCard({ q, index }: { q: Question; index: number }) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  const correct = selected === q.correctIndex

  return (
    <div className="mb-5 last:mb-0">
      <p className="text-sm font-medium mb-3">
        {index + 1}. {q.question}
      </p>
      <div className="space-y-2">
        {q.options.map((opt, i) => {
          let style = 'border-border hover:border-primary/50 hover:bg-surface-bright cursor-pointer'
          if (answered) {
            if (i === q.correctIndex) {
              style = 'border-emerald-500 bg-emerald-500/10'
            } else if (i === selected) {
              style = 'border-red-400 bg-red-400/10'
            } else {
              style = 'border-border opacity-50'
            }
          }

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`w-full text-left px-4 py-2.5 rounded-lg border-2 text-sm transition-all ${style}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <div className={`mt-3 p-3 rounded-lg text-sm ${correct ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
              <p className="font-medium mb-1">
                {correct ? 'Correct!' : 'Not quite.'}
              </p>
              <p className="text-text-muted">{q.explanation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Checkpoint({ title, questions }: Props) {
  return (
    <div className="my-10 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">{'\u2705'}</span>
        <h3 className="text-base font-bold">{title}</h3>
      </div>
      {questions.map((q, i) => (
        <QuestionCard key={i} q={q} index={i} />
      ))}
    </div>
  )
}
