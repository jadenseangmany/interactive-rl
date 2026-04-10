import { scaleSequential, scaleLinear } from 'd3-scale'
import { interpolateRdYlGn, interpolateViridis, interpolateBlues } from 'd3-scale-chromatic'

export function createValueColorScale(min: number, max: number) {
  return scaleSequential(interpolateRdYlGn).domain([min, max])
}

export function createViridisScale(min: number, max: number) {
  return scaleSequential(interpolateViridis).domain([min, max])
}

export function createBluesScale(min: number, max: number) {
  return scaleSequential(interpolateBlues).domain([min, max])
}

export function createDivergingScale(min: number, max: number) {
  return scaleLinear<string>()
    .domain([min, 0, max])
    .range(['#ef4444', '#f5f5f5', '#22c55e'])
}

// Chart line colors for multi-series plots
export const seriesColors = [
  '#6366f1', // indigo
  '#ef4444', // red
  '#22c55e', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
]
