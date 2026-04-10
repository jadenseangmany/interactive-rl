import { useRef, useState, useCallback, useEffect } from 'react'

interface UseSimulationOptions {
  stepsPerFrame?: number
}

export function useSimulation(
  stepFn: () => void,
  options: UseSimulationOptions = {}
) {
  const { stepsPerFrame: initialSteps = 1 } = options
  const [isPlaying, setIsPlaying] = useState(false)
  const [stepsPerFrame, setStepsPerFrame] = useState(initialSteps)
  const [stepCount, setStepCount] = useState(0)
  const stepFnRef = useRef(stepFn)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    stepFnRef.current = stepFn
  })

  const step = useCallback(() => {
    stepFnRef.current()
    setStepCount((c) => c + 1)
  }, [])

  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])

  const reset = useCallback((resetFn?: () => void) => {
    setIsPlaying(false)
    setStepCount(0)
    resetFn?.()
  }, [])

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      return
    }

    const loop = () => {
      for (let i = 0; i < stepsPerFrame; i++) {
        stepFnRef.current()
      }
      setStepCount((c) => c + stepsPerFrame)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [isPlaying, stepsPerFrame])

  return { isPlaying, play, pause, step, reset, stepCount, stepsPerFrame, setStepsPerFrame, setStepCount }
}
