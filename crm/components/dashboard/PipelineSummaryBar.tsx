import { Stage } from "@prisma/client"
import { STAGE_ORDER, STAGE_LABELS, STAGE_COLORS } from "@/lib/utils"

interface PipelineSummaryBarProps {
  stageCounts: Partial<Record<Stage, number>>
}

export function PipelineSummaryBar({ stageCounts }: PipelineSummaryBarProps) {
  const total = Object.values(stageCounts).reduce((a, b) => a + (b ?? 0), 0)
  if (total === 0) return null

  return (
    <div className="bg-surface rounded-md border border-border shadow-card p-5">
      <h3 className="font-heading text-h3 text-text-primary mb-3">Distribución del pipeline</h3>
      <div className="flex h-6 rounded-full overflow-hidden gap-px">
        {STAGE_ORDER.map((stage) => {
          const count = stageCounts[stage] ?? 0
          const pct = (count / total) * 100
          if (pct === 0) return null
          return (
            <div
              key={stage}
              className="relative group"
              style={{ width: `${pct}%`, backgroundColor: STAGE_COLORS[stage] }}
              title={`${STAGE_LABELS[stage]}: ${count}`}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-text-primary text-text-inverse text-caption px-2 py-1 rounded whitespace-nowrap z-10">
                {STAGE_LABELS[stage]}: {count}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-3">
        {STAGE_ORDER.map((stage) => {
          const count = stageCounts[stage] ?? 0
          if (count === 0) return null
          return (
            <div key={stage} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STAGE_COLORS[stage] }} />
              <span className="text-caption text-text-muted">{STAGE_LABELS[stage]} ({count})</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
