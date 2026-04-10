import { argmax, softmax, sampleFromDistribution, randomNormal } from '@/lib/math'

/** A single k-armed bandit problem instance. */
export interface BanditProblem {
  /** True reward means for each arm */
  qStar: number[]
  k: number
}

/** State for tracking one agent's run on a bandit problem. */
export interface BanditAgentState {
  /** Estimated action values Q(a) */
  Q: number[]
  /** Action selection counts N(a) */
  N: number[]
  /** Preferences H(a) for gradient bandit */
  H: number[]
  /** Total reward accumulated */
  totalReward: number
  /** Number of steps taken */
  step: number
  /** Reward history per step */
  rewards: number[]
  /** Whether optimal action was selected per step */
  optimalActions: boolean[]
}

export function createBanditProblem(k = 10): BanditProblem {
  const qStar = Array.from({ length: k }, () => randomNormal(0, 1))
  return { qStar, k }
}

export function createAgentState(k: number): BanditAgentState {
  return {
    Q: new Array(k).fill(0),
    N: new Array(k).fill(0),
    H: new Array(k).fill(0),
    totalReward: 0,
    step: 0,
    rewards: [],
    optimalActions: [],
  }
}

/** Pull an arm and get a reward (true value + noise). */
export function pullArm(problem: BanditProblem, action: number): number {
  return randomNormal(problem.qStar[action], 1)
}

/** Select action using epsilon-greedy strategy. */
export function epsilonGreedyAction(state: BanditAgentState, epsilon: number): number {
  if (Math.random() < epsilon) {
    return Math.floor(Math.random() * state.Q.length)
  }
  return argmax(state.Q)
}

/** Select action using UCB strategy. */
export function ucbAction(state: BanditAgentState, c: number): number {
  const k = state.Q.length
  // If any arm hasn't been pulled, pull it
  for (let a = 0; a < k; a++) {
    if (state.N[a] === 0) return a
  }
  const t = state.step + 1
  const ucbValues = state.Q.map((q, a) => q + c * Math.sqrt(Math.log(t) / state.N[a]))
  return argmax(ucbValues)
}

/** Select action using gradient bandit (softmax on preferences). */
export function gradientBanditAction(state: BanditAgentState): number {
  const probs = softmax(state.H)
  return sampleFromDistribution(probs)
}

/** Update agent state after receiving a reward for an action. */
export function updateAgent(
  state: BanditAgentState,
  action: number,
  reward: number,
  problem: BanditProblem,
  stepSize?: number
): void {
  state.N[action] += 1
  const alpha = stepSize ?? (1 / state.N[action])
  state.Q[action] += alpha * (reward - state.Q[action])
  state.totalReward += reward
  state.step += 1

  const optimalAction = argmax(problem.qStar)
  state.rewards.push(reward)
  state.optimalActions.push(action === optimalAction)
}

/** Update preferences for gradient bandit. */
export function updateGradientBandit(
  state: BanditAgentState,
  action: number,
  reward: number,
  alpha: number,
  useBaseline: boolean
): void {
  const probs = softmax(state.H)
  const baseline = useBaseline ? state.totalReward / Math.max(1, state.step) : 0
  const diff = reward - baseline

  for (let a = 0; a < state.H.length; a++) {
    if (a === action) {
      state.H[a] += alpha * diff * (1 - probs[a])
    } else {
      state.H[a] -= alpha * diff * probs[a]
    }
  }

  state.totalReward += reward
  state.step += 1
  state.rewards.push(reward)
}

/**
 * Run a full bandit experiment: multiple runs, averaging results.
 * Returns average reward and % optimal action per step.
 */
export function runBanditExperiment(params: {
  method: 'epsilon-greedy' | 'ucb' | 'gradient'
  k?: number
  steps: number
  runs: number
  epsilon?: number
  c?: number
  alpha?: number
  useBaseline?: boolean
  stepSize?: number
}): { avgRewards: number[]; optimalPct: number[] } {
  const {
    method,
    k = 10,
    steps,
    runs,
    epsilon = 0.1,
    c = 2,
    alpha = 0.1,
    useBaseline = true,
    stepSize,
  } = params

  const rewardSums = new Float64Array(steps)
  const optimalSums = new Float64Array(steps)

  for (let run = 0; run < runs; run++) {
    const problem = createBanditProblem(k)
    const state = createAgentState(k)

    for (let t = 0; t < steps; t++) {
      let action: number

      if (method === 'epsilon-greedy') {
        action = epsilonGreedyAction(state, epsilon)
      } else if (method === 'ucb') {
        action = ucbAction(state, c)
      } else {
        action = gradientBanditAction(state)
      }

      const reward = pullArm(problem, action)

      if (method === 'gradient') {
        const optimalAction = argmax(problem.qStar)
        optimalSums[t] += action === optimalAction ? 1 : 0
        rewardSums[t] += reward
        updateGradientBandit(state, action, reward, alpha, useBaseline)
      } else {
        updateAgent(state, action, reward, problem, stepSize)
        rewardSums[t] += state.rewards[t]
        optimalSums[t] += state.optimalActions[t] ? 1 : 0
      }
    }
  }

  const avgRewards = Array.from(rewardSums, (s) => s / runs)
  const optimalPct = Array.from(optimalSums, (s) => (s / runs) * 100)

  return { avgRewards, optimalPct }
}
