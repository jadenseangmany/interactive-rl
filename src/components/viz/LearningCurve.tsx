import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { seriesColors } from '@/lib/colors'

interface Series {
  name: string
  data: number[]
  color?: string
}

interface Props {
  series: Series[]
  xLabel?: string
  yLabel?: string
  height?: number
}

export default function LearningCurve({ series, xLabel = 'Steps', yLabel = 'Value', height = 300 }: Props) {
  // Convert parallel arrays into recharts format
  const maxLen = Math.max(...series.map((s) => s.data.length))
  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const point: Record<string, number> = { step: i + 1 }
    series.forEach((s) => {
      if (i < s.data.length) point[s.name] = s.data[i]
    })
    return point
  })

  // Downsample for performance if too many points
  const maxPoints = 500
  const stride = Math.max(1, Math.floor(chartData.length / maxPoints))
  const displayData = stride > 1
    ? chartData.filter((_, i) => i % stride === 0 || i === chartData.length - 1)
    : chartData

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={displayData} margin={{ top: 5, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey="step"
          label={{ value: xLabel, position: 'bottom', offset: 0 }}
          tick={{ fontSize: 12 }}
          stroke="var(--color-text-muted)"
        />
        <YAxis
          label={{ value: yLabel, angle: -90, position: 'insideLeft', offset: 10 }}
          tick={{ fontSize: 12 }}
          stroke="var(--color-text-muted)"
        />
        <Tooltip
          contentStyle={{ backgroundColor: 'var(--color-surface-dim)', border: '1px solid var(--color-border)' }}
        />
        <Legend />
        {series.map((s, i) => (
          <Line
            key={s.name}
            type="monotone"
            dataKey={s.name}
            stroke={s.color ?? seriesColors[i % seriesColors.length]}
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
