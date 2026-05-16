import { Stage } from "@prisma/client"
import { WEEKLY_GOALS } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface WeeklyProgressBarProps {
  stage: Stage
  current: number
}

export function WeeklyProgressBar({ stage, current }: WeeklyProgressBarProps) {
  const goal = WEEKLY_GOALS[stage]
  if (!goal) return null

  const pct = Math.min((current / goal) * 100, 100)
  const status = pct >= 80 ? "on-track" : pct >= 50 ? "at-risk" : "behind"

  const barColor = {
    "on-track": "#2ECC71",
    "at-risk": "#F59E0B",
    behind: "#EF4444",
  }[status]

  return (
    <div className="mt-2" title={`${current} de ${goal} esta semana`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-caption text-text-muted">Meta semanal</span>
        <span className="text-caption font-medium" style={{ color: barColor }}>
          {current}/{goal}
        </span>
      </div>
      <div className="h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  )
}
