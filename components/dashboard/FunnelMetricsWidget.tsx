"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface FunnelData {
  week: { start: string; end: string }
  funnel: {
    leads: { current: number; goal: number }
    qualified: { current: number; goal: number }
    meetings: { current: number; goal: number }
    won: { current: number; goal: number }
  }
}

const FUNNEL_ROWS = [
  { key: "leads" as const, label: "Leads captados", color: "#94A3B8" },
  { key: "qualified" as const, label: "Calificados", color: "#F59E0B" },
  { key: "meetings" as const, label: "Reuniones", color: "#3B82F6" },
  { key: "won" as const, label: "Ventas cerradas", color: "#2ECC71" },
]

function statusOf(current: number, goal: number) {
  const pct = current / goal
  return pct >= 0.8 ? "on-track" : pct >= 0.5 ? "at-risk" : "behind"
}

const statusColors = {
  "on-track": "#2ECC71",
  "at-risk": "#F59E0B",
  behind: "#EF4444",
}

interface Props {
  ownerId?: string
}

export function FunnelMetricsWidget({ ownerId }: Props) {
  const [weekOffset, setWeekOffset] = useState(0)
  const [data, setData] = useState<FunnelData | null>(null)

  useEffect(() => {
    const params = new URLSearchParams({ week: String(weekOffset) })
    if (ownerId) params.set("owner_id", ownerId)
    fetch(`/api/dashboard/funnel?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d?.funnel) setData(d) })
      .catch(() => null)
  }, [weekOffset, ownerId])

  return (
    <div className="bg-surface rounded-md border border-border shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-h3 text-text-primary">Embudo semanal</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-1 rounded hover:bg-surface-alt"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-label text-text-muted min-w-[120px] text-center">
            {data
              ? `${format(new Date(data.week.start), "d MMM", { locale: es })} — ${format(new Date(data.week.end), "d MMM", { locale: es })}`
              : "Cargando…"}
          </span>
          <button
            onClick={() => setWeekOffset((w) => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="p-1 rounded hover:bg-surface-alt disabled:opacity-30"
            aria-label="Semana siguiente"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {data && (
        <div className="space-y-3">
          {FUNNEL_ROWS.map(({ key, label, color }) => {
            const { current, goal } = data.funnel[key]
            const pct = Math.min((current / goal) * 100, 100)
            const status = statusOf(current, goal)
            const statusColor = statusColors[status]

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-body text-text-primary">{label}</span>
                  <span className="text-label font-semibold" style={{ color: statusColor }}>
                    {current}<span className="text-text-muted font-normal">/{goal}</span>
                  </span>
                </div>
                <div className="h-2 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
