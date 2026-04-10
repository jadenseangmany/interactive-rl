import { useState, useCallback, useRef } from 'react'
import SliderPanel from '@/components/viz/SliderPanel'
import LearningCurve from '@/components/viz/LearningCurve'
import PlaybackControls from '@/components/common/PlaybackControls'
import BanditArmsViz from './BanditArmsViz'
import { useSimulation } from '@/hooks/useSimulation'
import {
  createBanditProblem,
  createAgentState,
  epsilonGreedyAction,
  pullArm,
  updateAgent,
  type BanditProblem,
  type BanditAgentState,
} from '@/algorithms/bandits'
import { argmax } from '@/lib/math'

const K = 10

interface VizState {
  Q: number[]
  N: number[]
  qStar: number[]
  lastAction: number | null
  lastReward: number | null
  stepKey: number
  rewards: number[]
  optimalPct: number[]
}

function makeInitialViz(problem: BanditProblem): VizState {
  return {
    Q: new Array(K).fill(0),
    N: new Array(K).fill(0),
    qStar: problem.qStar,
    lastAction: null,
    lastReward: null,
    stepKey: 0,
    rewards: [],
    optimalPct: [],
  }
}

function buildOptimalPct(agent: BanditAgentState): number[] {
  return agent.optimalActions.map((_v, i) => {
    const window = Math.min(i + 1, 100)
    const start = Math.max(0, i + 1 - window)
    let count = 0
    for (let j = start; j <= i; j++) {
      if (agent.optimalActions[j]) count++
    }
    return (count / window) * 100
  })
}

export default function BanditTestbed() {
  const [epsilon, setEpsilon] = useState(0.1)
  const [showTrueValues, setShowTrueValues] = useState(false)

  // Mutable simulation state (not in React state to avoid per-step re-renders of algorithm internals)
  const [initialProblem] = useState(() => createBanditProblem(K))
  const problemRef = useRef<BanditProblem>(initialProblem)
  const agentRef = useRef<BanditAgentState>(createAgentState(K))

  const [vizState, setVizState] = useState<VizState>(() => makeInitialViz(initialProblem))

  const doStep = useCallback(() => {
    const agent = agentRef.current
    const problem = problemRef.current
    const action = epsilonGreedyAction(agent, epsilon)
    const reward = pullArm(problem, action)
    updateAgent(agent, action, reward, problem)

    setVizState({
      Q: [...agent.Q],
      N: [...agent.N],
      qStar: problem.qStar,
      lastAction: action,
      lastReward: reward,
      stepKey: agent.step,
      rewards: [...agent.rewards],
      optimalPct: buildOptimalPct(agent),
    })
  }, [epsilon])

  const sim = useSimulation(doStep, { stepsPerFrame: 1 })

  const handleReset = useCallback(() => {
    sim.reset()
    const newProblem = createBanditProblem(K)
    problemRef.current = newProblem
    agentRef.current = createAgentState(K)
    setVizState(makeInitialViz(newProblem))
  }, [sim])

  const isExploring = vizState.lastAction !== null && vizState.Q.length > 0 &&
    vizState.lastAction !== argmax(vizState.Q)

  return (
    <div className="border border-border rounded-xl p-6 my-8 bg-surface-dim">
      <h3 className="text-lg font-semibold mb-1">10-Armed Bandit Testbed</h3>
      <p className="text-sm text-text-muted mb-5">
        Watch an epsilon-greedy agent learn which arms are best. Each bar shows the agent's
        current value estimate Q(a). Hit <strong>Play</strong> to watch it learn, or <strong>Step</strong> to
        go one action at a time.
      </p>

      {/* Status bar */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <span className="text-text-muted">Step <strong className="text-text">{sim.stepCount}</strong></span>
        {vizState.lastAction !== null && (
          <>
            <span className="text-text-muted">
              Arm <strong className="text-text">{vizState.lastAction + 1}</strong>
            </span>
            <span className={`font-medium ${isExploring ? 'text-amber-500' : 'text-emerald-500'}`}>
              {isExploring ? 'Exploring' : 'Exploiting'}
            </span>
            {vizState.lastReward !== null && (
              <span className={`font-mono text-sm ${vizState.lastReward >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                reward: {vizState.lastReward >= 0 ? '+' : ''}{vizState.lastReward.toFixed(2)}
              </span>
            )}
          </>
        )}
      </div>

      {/* Animated arm visualization */}
      <BanditArmsViz
        k={K}
        qStar={vizState.qStar}
        Q={vizState.Q}
        N={vizState.N}
        lastAction={vizState.lastAction}
        lastReward={vizState.lastReward}
        showTrueValues={showTrueValues}
        stepKey={vizState.stepKey}
      />

      {/* Controls */}
      <div className="mt-4 space-y-4">
        <PlaybackControls
          isPlaying={sim.isPlaying}
          onPlay={sim.play}
          onPause={sim.pause}
          onStep={sim.step}
          onReset={handleReset}
          stepCount={sim.stepCount}
          stepsPerFrame={sim.stepsPerFrame}
          onStepsPerFrameChange={sim.setStepsPerFrame}
        />

        <div className="flex items-center gap-6">
          <SliderPanel
            params={[
              { key: 'epsilon', label: 'Epsilon (\u03B5)', min: 0, max: 0.5, step: 0.01, value: epsilon, onChange: setEpsilon },
            ]}
          />
          <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showTrueValues}
              onChange={(e) => setShowTrueValues(e.target.checked)}
              className="accent-primary"
            />
            Show true values
          </label>
        </div>
      </div>

      {/* Live-growing charts */}
      {vizState.rewards.length > 1 && (
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Reward Over Time</h4>
            <LearningCurve
              series={[{ name: 'Reward', data: vizState.rewards }]}
              xLabel="Steps"
              yLabel="Reward"
              height={200}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">% Optimal Action (last 100 steps)</h4>
            <LearningCurve
              series={[{ name: '% Optimal', data: vizState.optimalPct }]}
              xLabel="Steps"
              yLabel="% Optimal"
              height={200}
            />
          </div>
        </div>
      )}
    </div>
  )
}
