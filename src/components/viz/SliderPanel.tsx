interface SliderParam {
  key: string
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
}

interface Props {
  params: SliderParam[]
}

export default function SliderPanel({ params }: Props) {
  return (
    <div className="space-y-3">
      {params.map((p) => (
        <div key={p.key} className="flex items-center gap-3">
          <label className="text-sm text-text-muted w-32 shrink-0">{p.label}</label>
          <input
            type="range"
            min={p.min}
            max={p.max}
            step={p.step}
            value={p.value}
            onChange={(e) => p.onChange(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <span className="text-sm font-mono w-14 text-right">{p.value}</span>
        </div>
      ))}
    </div>
  )
}
