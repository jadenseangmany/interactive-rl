import { motion, AnimatePresence } from 'framer-motion'
import { useResizeObserver } from '@/hooks/useResizeObserver'

interface Props {
  k: number
  qStar: number[]
  Q: number[]
  N: number[]
  lastAction: number | null
  lastReward: number | null
  showTrueValues: boolean
  /** Key that changes on each step to trigger reward animation */
  stepKey: number
}

export default function BanditArmsViz({
  k,
  qStar,
  Q,
  N,
  lastAction,
  lastReward,
  showTrueValues,
  stepKey,
}: Props) {
  const { ref, width } = useResizeObserver<HTMLDivElement>()

  const padding = { top: 40, bottom: 50, left: 10, right: 10 }
  const height = 320
  const chartW = Math.max(width - padding.left - padding.right, 100)
  const chartH = height - padding.top - padding.bottom
  const barGap = 6
  const barWidth = Math.max((chartW - barGap * (k + 1)) / k, 8)

  // Value range for y-axis (show -3 to +3 by default, expand if needed)
  const allVals = [...qStar, ...Q]
  const yMin = Math.min(-3, ...allVals) - 0.5
  const yMax = Math.max(3, ...allVals) + 0.5
  const yScale = (v: number) => padding.top + chartH * (1 - (v - yMin) / (yMax - yMin))
  const zeroY = yScale(0)

  return (
    <div ref={ref} className="w-full">
      <svg width={width || '100%'} height={height} className="select-none">
        {/* Zero line */}
        <line
          x1={padding.left}
          x2={padding.left + chartW}
          y1={zeroY}
          y2={zeroY}
          stroke="var(--color-border)"
          strokeDasharray="4 4"
        />

        {/* Y-axis labels */}
        {[-2, -1, 0, 1, 2].map((v) => (
          <text
            key={v}
            x={padding.left - 2}
            y={yScale(v)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-text-muted text-[10px]"
          >
            {v}
          </text>
        ))}

        {Array.from({ length: k }, (_, i) => {
          const x = padding.left + barGap + i * (barWidth + barGap)
          const qEst = Q[i]
          const qTrue = qStar[i]
          const isSelected = lastAction === i
          const barTop = yScale(Math.max(qEst, 0))
          const barBottom = yScale(Math.min(qEst, 0))
          const barH = Math.max(barBottom - barTop, 2)

          return (
            <g key={i}>
              {/* True value marker (diamond) — shown optionally */}
              {showTrueValues && (
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                >
                  <line
                    x1={x}
                    x2={x + barWidth}
                    y1={yScale(qTrue)}
                    y2={yScale(qTrue)}
                    stroke="#ef4444"
                    strokeWidth={2}
                    strokeDasharray="3 2"
                  />
                </motion.g>
              )}

              {/* Estimated value bar */}
              <motion.rect
                x={x}
                y={barTop}
                width={barWidth}
                height={barH}
                rx={3}
                fill={isSelected ? '#6366f1' : '#94a3b8'}
                animate={{
                  y: barTop,
                  height: barH,
                  fill: isSelected ? '#6366f1' : '#94a3b8',
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />

              {/* Selection highlight glow */}
              {isSelected && (
                <motion.rect
                  x={x - 2}
                  y={barTop - 2}
                  width={barWidth + 4}
                  height={barH + 4}
                  rx={5}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth={2}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: [0, 0.8, 0.4], scale: 1 }}
                  transition={{ duration: 0.4 }}
                />
              )}

              {/* Floating reward number */}
              <AnimatePresence mode="popLayout">
                {isSelected && lastReward !== null && (
                  <motion.text
                    key={`reward-${stepKey}`}
                    x={x + barWidth / 2}
                    y={yScale(qEst) - 10}
                    textAnchor="middle"
                    className="text-xs font-bold"
                    fill={lastReward >= 0 ? '#22c55e' : '#ef4444'}
                    initial={{ opacity: 1, y: yScale(qEst) - 10 }}
                    animate={{ opacity: 0, y: yScale(qEst) - 50 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  >
                    {lastReward >= 0 ? '+' : ''}{lastReward.toFixed(2)}
                  </motion.text>
                )}
              </AnimatePresence>

              {/* Q estimate label */}
              <motion.text
                x={x + barWidth / 2}
                y={height - 32}
                textAnchor="middle"
                className="text-[10px] font-mono"
                fill="var(--color-text-muted)"
                animate={{ opacity: 1 }}
              >
                {qEst.toFixed(2)}
              </motion.text>

              {/* Arm index label */}
              <text
                x={x + barWidth / 2}
                y={height - 18}
                textAnchor="middle"
                className="text-[11px] font-medium"
                fill="var(--color-text)"
              >
                {i + 1}
              </text>

              {/* Pull count */}
              <text
                x={x + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                className="text-[9px]"
                fill="var(--color-text-muted)"
              >
                n={N[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
