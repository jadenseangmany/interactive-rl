/** Return index of the maximum value. Ties broken randomly. */
export function argmax(arr: number[]): number {
  let maxVal = -Infinity
  const maxIndices: number[] = []
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] > maxVal) {
      maxVal = arr[i]
      maxIndices.length = 0
      maxIndices.push(i)
    } else if (arr[i] === maxVal) {
      maxIndices.push(i)
    }
  }
  return maxIndices[Math.floor(Math.random() * maxIndices.length)]
}

/** Softmax of an array, returns probabilities. */
export function softmax(values: number[]): number[] {
  const max = Math.max(...values)
  const exps = values.map((v) => Math.exp(v - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

/** Sample an index from a probability distribution. */
export function sampleFromDistribution(probs: number[]): number {
  const r = Math.random()
  let cumulative = 0
  for (let i = 0; i < probs.length; i++) {
    cumulative += probs[i]
    if (r <= cumulative) return i
  }
  return probs.length - 1
}

/** Sample from a normal distribution using Box-Muller. */
export function randomNormal(mean = 0, std = 1): number {
  const u1 = Math.random()
  const u2 = Math.random()
  return mean + std * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

/** Compute running average. */
export function runningAverage(arr: number[], window: number): number[] {
  const result: number[] = []
  let sum = 0
  for (let i = 0; i < arr.length; i++) {
    sum += arr[i]
    if (i >= window) sum -= arr[i - window]
    result.push(sum / Math.min(i + 1, window))
  }
  return result
}
