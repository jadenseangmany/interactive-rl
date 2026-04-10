import { useState, useCallback, useRef } from 'react'
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
import { seriesColors } from '@/lib/colors'

const K = 10

interface AgentConfig {
  epsilon: number
  label: string
  color: string
}

const AGENTS: AgentConfig[] = [
  { epsilon: 0, label: 'Greedy (\u03B5=0)', color: seriesColors[0] },
  { epsilon: 0.01, label: '\u03B5 = 0.01', color: seriesColors[1] },
  { epsilon: 0.1, label: '\u03B5 = 0.1', color: seriesColors[2] },
]

interface RunState {
  problem: BanditProblem
  agents: BanditAgentState[]
  lastActions: (number | null)[]
  lastRewards: (number | null)[]
}

function createRunState(): RunState {
  const problem = createBanditProblem(K)
  return {
    problem,
    agents: AGENTS.map(() => createAgentState(K)),
    lastActions: AGENTS.map(() => null),
    lastRewards: AGENTS.map(() => null),
  }
}

interface VizSnapshot {
  agentViz: {
    Q: number[]
    N: number[]
    lastAction: number | null
    lastReward: number | null
  }[]
  qStar: number[]
  rewardSeries: { name: string; data: number[]; color: string }[]
  optimalSeries: { name: string; data: number[]; color: string }[]
  stepKey: number
}

function computeOptimalPct(agent: BanditAgentState): number[] {
  const result: number[] = []
  let count = 0
  for (let i = 0; i < agent.optimalActions.length; i++) {
    if (agent.optimalActions[i]) count++
    result.push((count / (i + 1)) * 100)
  }
  return result
}

function takeSnapshot(state: RunState): VizSnapshot {
  return {
    agentViz: state.agents.map((agent, i) => ({
      Q: [...agent.Q],
      N: [...agent.N],
      lastAction: state.lastActions[i],
      lastReward: state.lastRewards[i],
    })),
    qStar: state.problem.qStar,
    rewardSeries: AGENTS.map((cfg, i) => ({
      name: cfg.label,
      data: [...state.agents[i].rewards],
      color: cfg.color,
    })),
    optimalSeries: AGENTS.map((cfg, i) => ({
      name: cfg.label,
      data: computeOptimalPct(state.agents[i]),
      color: cfg.color,
    })),
    stepKey: state.agents[0].step,
  }
}

export default function EpsilonComparison() {
  const [initialRun] = useState(createRunState)
  const runRef = useRef<RunState>(initialRun)
  const [viz, setViz] = useState<VizSnapshot>(() => takeSnapshot(initialRun))

  const doStep = useCallback(() => {
    const run = runRef.current
    for (let i = 0; i < AGENTS.length; i++) {
      const action = epsilonGreedyAction(run.agents[i], AGENTS[i].epsilon)
      const reward = pullArm(run.problem, action)
      updateAgent(run.agents[i], action, reward, run.problem)
      run.lastActions[i] = action
      run.lastRewards[i] = reward
    }
    setViz(takeSnapshot(run))
  }, [])

  const sim = useSimulation(doStep, { stepsPerFrame: 1 })

  const handleReset = useCallback(() => {
    sim.reset()
    runRef.current = createRunState()
    setViz(takeSnapshot(runRef.current))
  }, [sim])

  return (
    <div className="border border-border rounded-xl p-6 my-8 bg-surface-dim">
      <h3 className="text-lg font-semibold mb-1">Epsilon Comparison (Figure 2.2)</h3>
      <p className="text-sm text-text-muted mb-5">
        Three agents face the <strong>same</strong> bandit problem simultaneously.
        Watch how the greedy agent locks onto one arm while the exploring agents
        gradually find the best one.
      </p>

      {/* Three arm visualizations side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {AGENTS.map((cfg, i) => (
          <div key={cfg.label} className="rounded-lg border border-border bg-surface p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }} />
              <span className="text-sm font-medium">{cfg.label}</span>
              <span className="text-xs text-text-muted ml-auto">
                Total: {viz.agentViz[i].N.reduce((a, b) => a + b, 0)}
              </span>
            </div>
            <BanditArmsViz
              k={K}
              qStar={viz.qStar}
              Q={viz.agentViz[i].Q}
              N={viz.agentViz[i].N}
              lastAction={viz.agentViz[i].lastAction}
              lastReward={viz.agentViz[i].lastReward}
              showTrueValues={false}
              stepKey={viz.stepKey}
            />
          </div>
        ))}
      </div>

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

      {/* Live-growing comparison charts */}
      {viz.stepKey > 1 && (
        <div className="mt-6 space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Average Reward (cumulative)</h4>
            <LearningCurve
              series={viz.rewardSeries}
              xLabel="Steps"
              yLabel="Reward"
              height={220}
            />
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">% Optimal Action (cumulative)</h4>
            <LearningCurve
              series={viz.optimalSeries}
              xLabel="Steps"
              yLabel="% Optimal"
              height={220}
            />
          </div>
        </div>
      )}
    </div>
  )
}
