interface Props {
  isPlaying: boolean
  onPlay: () => void
  onPause: () => void
  onStep: () => void
  onReset: () => void
  stepCount: number
  stepsPerFrame: number
  onStepsPerFrameChange: (v: number) => void
}

export default function PlaybackControls({
  isPlaying,
  onPlay,
  onPause,
  onStep,
  onReset,
  stepCount,
  stepsPerFrame,
  onStepsPerFrameChange,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={isPlaying ? onPause : onPlay}
        className="px-4 py-1.5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors"
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button
        onClick={onStep}
        disabled={isPlaying}
        className="px-4 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-surface-bright transition-colors disabled:opacity-40"
      >
        Step
      </button>
      <button
        onClick={onReset}
        className="px-4 py-1.5 rounded-md border border-border text-sm font-medium hover:bg-surface-bright transition-colors"
      >
        Reset
      </button>
      <div className="flex items-center gap-2 ml-2">
        <label className="text-xs text-text-muted">Speed:</label>
        <input
          type="range"
          min={1}
          max={100}
          value={stepsPerFrame}
          onChange={(e) => onStepsPerFrameChange(Number(e.target.value))}
          className="w-24 accent-primary"
        />
        <span className="text-xs text-text-muted w-8">{stepsPerFrame}x</span>
      </div>
      <span className="text-xs text-text-muted ml-auto">Steps: {stepCount.toLocaleString()}</span>
    </div>
  )
}
