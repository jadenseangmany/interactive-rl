import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { randomNormal, argmax } from '@/lib/math'
import SliderPanel from '@/components/viz/SliderPanel'
import { PARTNERS, TOTAL_NIGHTS } from './partners'

interface StepEvent {
  night: number
  partner: number
  rating: number
  isExploring: boolean
  oldEstimate: number
  newEstimate: number
}

interface AgentState {
  Q: number[] // estimated values
  N: number[] // counts
  history: StepEvent[]
  totalReward: number
}

function createAgent(): AgentState {
  return {
    Q: new Array(PARTNERS.length).fill(0),
    N: new Array(PARTNERS.length).fill(0),
    history: [],
    totalReward: 0,
  }
}

export default function AgentPlaysDemo({ playerScore }: { playerScore: number | null }) {
  const [epsilon, setEpsilon] = useState(0.3)
  const [agent, setAgent] = useState<AgentState>(createAgent)
  const [currentStep, setCurrentStep] = useState<StepEvent | null>(null)
  const [phase, setPhase] = useState<'idle' | 'choosing' | 'dating' | 'result' | 'done'>('idle')
  const [showReveal, setShowReveal] = useState(false)
  const agentRef = useRef<AgentState>(createAgent())

  const nightNum = agent.history.length + 1
  const done = agent.history.length >= TOTAL_NIGHTS

  const doOneStep = useCallback(() => {
    if (done) return
    const ag = agentRef.current

    // Choose action
    const isExploring = Math.random() < epsilon
    let chosen: number
    if (isExploring || ag.history.length === 0) {
      chosen = Math.floor(Math.random() * PARTNERS.length)
    } else {
      chosen = argmax(ag.Q)
    }

    // Phase: choosing
    setPhase('choosing')
    setCurrentStep({ night: nightNum, partner: chosen, rating: 0, isExploring, oldEstimate: ag.Q[chosen], newEstimate: 0 })

    setTimeout(() => {
      // Phase: dating
      setPhase('dating')

      setTimeout(() => {
        // Generate rating
        const raw = randomNormal(PARTNERS[chosen].trueScore, 1.5)
        const rating = Math.round(Math.max(1, Math.min(10, raw)) * 10) / 10

        // Update agent
        const oldQ = ag.Q[chosen]
        ag.N[chosen] += 1
        ag.Q[chosen] += (1 / ag.N[chosen]) * (rating - ag.Q[chosen])
        ag.totalReward += rating

        const event: StepEvent = {
          night: nightNum,
          partner: chosen,
          rating,
          isExploring,
          oldEstimate: oldQ,
          newEstimate: ag.Q[chosen],
        }
        ag.history.push(event)

        setCurrentStep(event)
        setAgent({ ...ag })
        setPhase(ag.history.length >= TOTAL_NIGHTS ? 'done' : 'result')
      }, 800)
    }, 1000)
  }, [epsilon, done, nightNum])

  const handleReset = useCallback(() => {
    agentRef.current = createAgent()
    setAgent(createAgent())
    setCurrentStep(null)
    setPhase('idle')
    setShowReveal(false)
  }, [])

  const partnerStats = PARTNERS.map((_, i) => {
    const dates = agent.history.filter((h) => h.partner === i)
    return { count: dates.length, avg: dates.length > 0 ? dates.reduce((s, d) => s + d.rating, 0) / dates.length : null }
  })

  return (
    <div className="border border-border rounded-xl p-6 my-8 bg-surface-dim">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">The Agent's Turn</h3>
        <button onClick={handleReset} className="text-xs text-text-muted hover:text-text underline">
          Reset
        </button>
      </div>
      <p className="text-sm text-text-muted mb-2">
        Now an epsilon-greedy agent faces the same {PARTNERS.length} people over {TOTAL_NIGHTS} nights.
        Step through one night at a time and read what the agent is thinking.
      </p>

      <SliderPanel params={[
        { key: 'epsilon', label: 'Epsilon (\u03B5)', min: 0, max: 1, step: 0.05, value: epsilon, onChange: (v) => { setEpsilon(v); handleReset() } },
      ]} />

      {/* Partner cards with agent's estimates */}
      <div className="grid grid-cols-3 gap-4 mt-5 mb-5">
        {PARTNERS.map((p, i) => {
          const stats = partnerStats[i]
          const isBeingChosen = currentStep?.partner === i && (phase === 'choosing' || phase === 'dating')
          return (
            <div
              key={p.name}
              className={`relative flex flex-col items-center p-5 rounded-xl border-2 transition-all text-center
                ${isBeingChosen ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' : 'border-border'}
              `}
            >
              {isBeingChosen && (
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-primary"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
              <span className="text-4xl mb-2">{p.emoji}</span>
              <span className="font-semibold text-base">{p.name}</span>
              <span className="text-xs text-text-muted mt-0.5">{p.vibe}</span>
              <div className="mt-3 text-xs text-text-muted">
                {stats.count > 0 ? (
                  <>
                    <div>{stats.count} date{stats.count > 1 ? 's' : ''}</div>
                    <div className="font-mono text-sm font-semibold text-text mt-0.5">
                      Estimate: {agent.Q[i].toFixed(1)}
                    </div>
                  </>
                ) : (
                  <div className="italic">No data yet</div>
                )}
              </div>

              {showReveal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-10 h-10 flex items-center justify-center shadow-lg"
                >
                  {p.trueScore}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>

      {/* Narration box */}
      <AnimatePresence mode="wait">
        {phase === 'idle' && !done && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-surface border border-border rounded-lg p-5 mb-4 text-center text-sm text-text-muted">
            Press <strong>Next Night</strong> to watch the agent choose.
          </motion.div>
        )}

        {phase === 'choosing' && currentStep && (
          <motion.div key={`choosing-${currentStep.night}`}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-surface border border-border rounded-lg p-5 mb-4 text-sm"
          >
            <p className="font-medium mb-1">Night {currentStep.night} of {TOTAL_NIGHTS}</p>
            <p>
              {currentStep.isExploring ? (
                <>The agent rolls the dice and decides to <span className="text-amber-500 font-semibold">explore</span> (random pick)...</>
              ) : (
                <>The agent looks at its estimates and decides to <span className="text-emerald-500 font-semibold">exploit</span> (go with the best known)...</>
              )}
            </p>
            <p className="mt-2">
              It picks <strong>{PARTNERS[currentStep.partner].emoji} {PARTNERS[currentStep.partner].name}</strong>
              {!currentStep.isExploring && agent.Q[currentStep.partner] > 0 &&
                <span className="text-text-muted"> (current estimate: {currentStep.oldEstimate.toFixed(1)})</span>
              }
            </p>
          </motion.div>
        )}

        {phase === 'dating' && (
          <motion.div key="dating"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-surface border border-border rounded-lg p-5 mb-4 text-center"
          >
            <motion.span className="text-4xl inline-block" animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}>
              {'\u2764\uFE0F'}
            </motion.span>
            <p className="text-sm text-text-muted mt-2">
              {PARTNERS[currentStep!.partner].name} and the agent are on a date...
            </p>
          </motion.div>
        )}

        {(phase === 'result' || phase === 'done') && currentStep && currentStep.rating > 0 && (
          <motion.div key={`result-${currentStep.night}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }}
            className="bg-surface border border-border rounded-lg p-5 mb-4 text-sm"
          >
            <p className="font-medium mb-2">Night {currentStep.night} Result</p>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{PARTNERS[currentStep.partner].emoji}</span>
              <div>
                <p className="text-xl font-bold">
                  <span className={currentStep.rating >= 7 ? 'text-emerald-500' : currentStep.rating >= 4 ? 'text-amber-500' : 'text-red-400'}>
                    {currentStep.rating.toFixed(1)}/10
                  </span>
                </p>
              </div>
            </div>
            <p className="text-text-muted">
              The agent updates its estimate for <strong>{PARTNERS[currentStep.partner].name}</strong>:{' '}
              <span className="font-mono">{currentStep.oldEstimate.toFixed(1)}</span>
              {' \u2192 '}
              <span className="font-mono font-semibold">{currentStep.newEstimate.toFixed(1)}</span>
            </p>
            {phase === 'done' && (
              <p className="mt-3 font-medium text-primary">
                All {TOTAL_NIGHTS} nights complete! Agent's total: {agent.totalReward.toFixed(1)}
                {playerScore !== null && (
                  <span className="text-text-muted font-normal"> (your total was {playerScore.toFixed(1)})</span>
                )}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* History timeline */}
      {agent.history.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.history.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface border border-border text-xs">
              <span>{PARTNERS[h.partner].emoji}</span>
              <span className={`text-[10px] font-medium ${h.isExploring ? 'text-amber-500' : 'text-emerald-500'}`}>
                {h.isExploring ? 'explore' : 'exploit'}
              </span>
              <span className={`font-mono font-semibold ${h.rating >= 7 ? 'text-emerald-500' : h.rating >= 4 ? 'text-amber-500' : 'text-red-400'}`}>
                {h.rating.toFixed(1)}
              </span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {!done ? (
          <button
            onClick={doOneStep}
            disabled={phase === 'choosing' || phase === 'dating'}
            className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {agent.history.length === 0 ? 'Start: Night 1' : `Next Night (${nightNum} of ${TOTAL_NIGHTS})`}
          </button>
        ) : !showReveal ? (
          <button
            onClick={() => setShowReveal(true)}
            className="px-5 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
          >
            Reveal True Scores
          </button>
        ) : null}
      </div>

      {/* Reveal section */}
      {showReveal && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-lg p-5 mt-4"
        >
          <h4 className="font-semibold mb-4">How the Agent Did</h4>
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
                        <motion.div className="h-3 rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${(p.trueScore / 10) * 100}%` }}
                          transition={{ duration: 0.8, delay: 0.1 }}
                        />
                      </div>
                      <span className="font-mono font-bold w-16 text-right">
                        True: {p.trueScore}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted w-28 text-right">
                    {p.stats.count > 0
                      ? `${p.stats.count} date${p.stats.count > 1 ? 's' : ''}, est: ${agent.Q[p.i].toFixed(1)}`
                      : 'Never tried'}
                  </span>
                </div>
              ))}
          </div>
          <div className="mt-4 p-3 rounded-md bg-primary/5 border border-primary/20 text-sm">
            <p>
              With \u03B5={epsilon}, the agent{' '}
              {epsilon === 0 ? 'never explored — it just went with whichever person it tried first.' :
               epsilon >= 0.5 ? `explored a lot (${(epsilon * 100).toFixed(0)}% of the time), so it spread its nights across everyone.` :
               `explored ${(epsilon * 100).toFixed(0)}% of the time, balancing learning with going back to the best known option.`}
              {' '}Try adjusting \u03B5 and resetting to see how it changes!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
