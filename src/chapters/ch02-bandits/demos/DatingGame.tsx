import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { randomNormal } from '@/lib/math'
import { PARTNERS, TOTAL_NIGHTS } from './partners'

interface DateResult {
  partner: number
  rating: number
  night: number
}

export default function DatingGame({ onFinish }: { onFinish?: (score: number) => void }) {
  const [nights, setNights] = useState<DateResult[]>([])
  const [lastResult, setLastResult] = useState<DateResult | null>(null)
  const [showReveal, setShowReveal] = useState(false)
  const [animatingDate, setAnimatingDate] = useState(false)

  const nightsLeft = TOTAL_NIGHTS - nights.length
  const done = nightsLeft <= 0

  const partnerStats = PARTNERS.map((_, i) => {
    const dates = nights.filter((n) => n.partner === i)
    const avg = dates.length > 0 ? dates.reduce((s, d) => s + d.rating, 0) / dates.length : null
    return { count: dates.length, avg }
  })

  const totalScore = nights.reduce((s, d) => s + d.rating, 0)

  const goOnDate = useCallback((partnerIdx: number) => {
    if (done || animatingDate) return
    setAnimatingDate(true)

    const raw = randomNormal(PARTNERS[partnerIdx].trueScore, 1.5)
    const rating = Math.round(Math.max(1, Math.min(10, raw)) * 10) / 10

    const result: DateResult = {
      partner: partnerIdx,
      rating,
      night: nights.length + 1,
    }

    setTimeout(() => {
      setLastResult(result)
      const updated = [...nights, result]
      setNights(updated)
      setAnimatingDate(false)
      if (updated.length === TOTAL_NIGHTS) {
        onFinish?.(updated.reduce((s, d) => s + d.rating, 0))
      }
    }, 600)
  }, [nights, done, animatingDate, onFinish])

  const handleReset = () => {
    setNights([])
    setLastResult(null)
    setShowReveal(false)
    setAnimatingDate(false)
  }

  return (
    <div className="border border-border rounded-xl p-6 my-8 bg-surface-dim">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Your Turn: Friday Night</h3>
        {nights.length > 0 && (
          <button onClick={handleReset} className="text-xs text-text-muted hover:text-text underline">
            Start over
          </button>
        )}
      </div>

      {!done ? (
        <p className="text-sm text-text-muted mb-5">
          <strong>Night {nights.length + 1} of {TOTAL_NIGHTS}</strong> &mdash;
          Who do you want to go out with? <strong>{nightsLeft} night{nightsLeft !== 1 ? 's' : ''} left.</strong>
        </p>
      ) : !showReveal ? (
        <p className="text-sm text-text-muted mb-5">
          All {TOTAL_NIGHTS} nights done! Your total happiness: <strong>{totalScore.toFixed(1)}</strong> out of {TOTAL_NIGHTS} nights.
        </p>
      ) : null}

      {/* Partner cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {PARTNERS.map((p, i) => {
          const stats = partnerStats[i]
          const isLastChosen = lastResult?.partner === i && !animatingDate
          return (
            <motion.button
              key={p.name}
              onClick={() => goOnDate(i)}
              disabled={done || animatingDate}
              className={`relative flex flex-col items-center p-5 rounded-xl border-2 transition-colors text-center
                ${isLastChosen
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-surface-bright'}
                ${(done || animatingDate) ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
              `}
              whileHover={!done && !animatingDate ? { scale: 1.04 } : {}}
              whileTap={!done && !animatingDate ? { scale: 0.96 } : {}}
            >
              <span className="text-4xl mb-2">{p.emoji}</span>
              <span className="font-semibold text-base">{p.name}</span>
              <span className="text-xs text-text-muted mt-0.5">{p.vibe}</span>
              <div className="mt-3 text-xs text-text-muted">
                {stats.count > 0 ? (
                  <>
                    <div>{stats.count} date{stats.count > 1 ? 's' : ''}</div>
                    <div className="font-mono text-sm font-semibold text-text mt-0.5">
                      Avg: {stats.avg!.toFixed(1)}/10
                    </div>
                  </>
                ) : (
                  <div className="italic">Haven't tried yet</div>
                )}
              </div>

              {/* Reveal badge */}
              {showReveal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                >
                  {p.trueScore}
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Date animation / result */}
      <AnimatePresence mode="wait">
        {animatingDate && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <motion.span
              className="text-4xl inline-block"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              {'\u2764\uFE0F'}
            </motion.span>
            <p className="text-sm text-text-muted mt-2">Going on a date...</p>
          </motion.div>
        )}

        {lastResult && !animatingDate && !done && (
          <motion.div
            key={`result-${lastResult.night}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-surface border border-border rounded-lg p-5 mb-4"
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{PARTNERS[lastResult.partner].emoji}</span>
              <div>
                <p className="text-sm text-text-muted">
                  Night {lastResult.night} with <strong>{PARTNERS[lastResult.partner].name}</strong>
                </p>
                <p className="text-2xl font-bold mt-1">
                  <span className={lastResult.rating >= 7 ? 'text-emerald-500' : lastResult.rating >= 4 ? 'text-amber-500' : 'text-red-400'}>
                    {lastResult.rating.toFixed(1)}/10
                  </span>
                </p>
                {partnerStats[lastResult.partner].count > 1 && (
                  <p className="text-xs text-text-muted mt-1">
                    Your running average with {PARTNERS[lastResult.partner].name}: {partnerStats[lastResult.partner].avg!.toFixed(1)}/10
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Date history timeline */}
      {nights.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {nights.map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs"
            >
              <span>{PARTNERS[n.partner].emoji}</span>
              <span className="text-text-muted">Night {n.night}:</span>
              <span className={`font-mono font-semibold ${n.rating >= 7 ? 'text-emerald-500' : n.rating >= 4 ? 'text-amber-500' : 'text-red-400'}`}>
                {n.rating.toFixed(1)}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* End reveal */}
      {done && !showReveal && (
        <div className="text-center py-6">
          <p className="text-text-muted mb-4">
            Think you made the best choices? Let's find out.
          </p>
          <button
            onClick={() => setShowReveal(true)}
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Reveal True Compatibility Scores
          </button>
        </div>
      )}

      {showReveal && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-lg p-5 mt-4"
        >
          <h4 className="font-semibold mb-4">The Truth</h4>
          <div className="space-y-3">
            {PARTNERS
              .map((p, i) => ({ ...p, i, stats: partnerStats[i] }))
              .sort((a, b) => b.trueScore - a.trueScore)
              .map((p) => (
                <div key={p.name} className="flex items-center gap-3 text-sm">
                  <span className="text-2xl w-8 text-center">{p.emoji}</span>
                  <span className="font-medium w-14">{p.name}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 rounded-full bg-primary/15 flex-1 relative overflow-hidden">
                        <motion.div
                          className="h-3 rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(p.trueScore / 10) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                      <span className="font-mono font-bold w-8 text-right">{p.trueScore}</span>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted w-24 text-right">
                    {p.stats.count > 0
                      ? `${p.stats.count} date${p.stats.count > 1 ? 's' : ''} (avg ${p.stats.avg!.toFixed(1)})`
                      : 'Never tried!'}
                  </span>
                </div>
              ))}
          </div>

          {/* Personalized debrief */}
          <div className="mt-5 p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm leading-relaxed">
            {(() => {
              const bestIdx = PARTNERS.reduce((best, p, i) =>
                p.trueScore > PARTNERS[best].trueScore ? i : best, 0)
              const bestPartner = PARTNERS[bestIdx]
              const bestStats = partnerStats[bestIdx]
              const triedAll = partnerStats.every((s) => s.count > 0)
              const neverTriedBest = bestStats.count === 0

              if (neverTriedBest) {
                return <p>You never even tried <strong>{bestPartner.name}</strong> &mdash; and they were your best match with a true score of {bestPartner.trueScore}! With only {TOTAL_NIGHTS} nights, it's risky to skip someone entirely.</p>
              } else if (bestStats.count >= 3) {
                return <p>Nice! You figured out <strong>{bestPartner.name}</strong> was the best and went back for more. You spent {bestStats.count} out of {TOTAL_NIGHTS} nights with them.</p>
              } else if (triedAll) {
                return <p>You tried everyone at least once &mdash; solid exploring! But with only {TOTAL_NIGHTS} nights, spending time exploring means less time with the best person.</p>
              } else {
                return <p>You tried <strong>{bestPartner.name}</strong> {bestStats.count} time{bestStats.count > 1 ? 's' : ''}, but spent most nights elsewhere. The tricky part: balancing trying everyone vs. sticking with who seems best.</p>
              }
            })()}
          </div>
        </motion.div>
      )}
    </div>
  )
}
