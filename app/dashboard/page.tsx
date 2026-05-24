"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Stage, LicitacionStage } from "@prisma/client"
import { Sidebar } from "@/components/ui/Sidebar"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { FunnelMetricsWidget } from "@/components/dashboard/FunnelMetricsWidget"
import { PipelineSummaryBar } from "@/components/dashboard/PipelineSummaryBar"
import { StaleAlertList } from "@/components/dashboard/StaleAlertList"

interface DashboardData {
  stageCounts: Partial<Record<Stage, number>>
  staleCount: number
}

interface LicitacionSummary {
  total: number
  won: number
  lost: number
  active: number
  conversionRate: number
  byStageCounts: Partial<Record<LicitacionStage, number>>
}

const LIC_STAGE_LABELS: Record<LicitacionStage, string> = {
  evaluating:    "Evaluando",
  preparing:     "Preparando",
  sent:          "Enviada",
  won:           "Ganada",
  lost:          "Perdida",
  not_submitted: "No presentada",
}

const LIC_STAGE_COLORS: Record<LicitacionStage, string> = {
  evaluating:    "#3B82F6",
  preparing:     "#EAB308",
  sent:          "#8B5CF6",
  won:           "#22C55E",
  lost:          "#EF4444",
  not_submitted: "#9CA3AF",
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [staleOpps, setStaleOpps] = useState<any[]>([])
  const [users, setUsers] = useState<Pick<User, "id" | "name" | "email">[]>([])
  const [filterOwnerId, setFilterOwnerId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [licSummary, setLicSummary] = useState<LicitacionSummary | null>(null)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterOwnerId) params.set("owner_id", filterOwnerId)

    Promise.all([
      fetch(`/api/dashboard?${params}`).then((r) => r.json()).catch(() => null),
      fetch("/api/opportunities/stale").then((r) => r.json()).catch(() => []),
      fetch("/api/users").then((r) => r.json()).catch(() => []),
      fetch(`/api/licitaciones?${params}`).then((r) => r.json()).catch(() => []),
    ]).then(([d, stale, usrs, lics]) => {
      setData(d)
      setStaleOpps(Array.isArray(stale) ? stale : [])
      setUsers(Array.isArray(usrs) ? usrs : [])

      if (Array.isArray(lics)) {
        const counts: Partial<Record<LicitacionStage, number>> = {}
        for (const l of lics) {
          counts[l.stage as LicitacionStage] = (counts[l.stage as LicitacionStage] ?? 0) + 1
        }
        const won = counts.won ?? 0
        const lost = counts.lost ?? 0
        const decided = won + lost
        setLicSummary({
          total: lics.length,
          won,
          lost,
          active: lics.length - won - lost - (counts.not_submitted ?? 0),
          conversionRate: decided > 0 ? Math.round((won / decided) * 100) : 0,
          byStageCounts: counts,
        })
      }

      setLoading(false)
    })
  }, [filterOwnerId])

  const counts = data?.stageCounts ?? {}
  const total = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0)
  const activeTotal = total - (counts.won ?? 0) - (counts.lost ?? 0)
  const conversionRate =
    total > 0 ? Math.round(((counts.won ?? 0) / total) * 100) : 0

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={session?.user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-h1 text-text-primary">Dashboard</h1>

            {/* Vendedora filter tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterOwnerId(undefined)}
                className={`px-3 h-8 rounded-full text-label transition-colors ${
                  !filterOwnerId ? "bg-primary text-white" : "bg-surface border border-border text-text-muted hover:bg-surface-alt"
                }`}
              >
                Todo el equipo
              </button>
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setFilterOwnerId(u.id)}
                  className={`px-3 h-8 rounded-full text-label transition-colors ${
                    filterOwnerId === u.id ? "bg-primary-muted border border-primary text-primary" : "bg-surface border border-border text-text-muted hover:bg-surface-alt"
                  }`}
                >
                  {u.name ?? u.email}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard label="Pipeline activo" value={activeTotal} />
                <MetricCard
                  label="Ganadas"
                  value={counts.won ?? 0}
                  variant={counts.won ? "positive" : "normal"}
                />
                <MetricCard
                  label="Estancadas"
                  value={data?.staleCount ?? 0}
                  variant={data?.staleCount ? "alert" : "normal"}
                />
                <MetricCard
                  label="Tasa de conversión"
                  value={`${conversionRate}%`}
                  variant={conversionRate >= 20 ? "positive" : "normal"}
                />
              </div>

              {/* Funnel + Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FunnelMetricsWidget ownerId={filterOwnerId} />
                <PipelineSummaryBar stageCounts={counts} />
              </div>

              {/* Licitaciones section */}
              {licSummary && (
                <div className="bg-white border border-border rounded-xl p-5">
                  <h2 className="font-heading text-h2 text-text-primary mb-4">Licitaciones</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                    <div className="bg-surface-alt rounded-lg p-3 text-center">
                      <p className="text-caption text-text-muted mb-1">En curso</p>
                      <p className="text-2xl font-bold text-text-primary">{licSummary.active}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-caption text-text-muted mb-1">Ganadas</p>
                      <p className="text-2xl font-bold text-green-600">{licSummary.won}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center">
                      <p className="text-caption text-text-muted mb-1">Perdidas</p>
                      <p className="text-2xl font-bold text-red-500">{licSummary.lost}</p>
                    </div>
                    <div className={`rounded-lg p-3 text-center ${licSummary.conversionRate >= 30 ? "bg-green-50" : "bg-surface-alt"}`}>
                      <p className="text-caption text-text-muted mb-1">Tasa de éxito</p>
                      <p className={`text-2xl font-bold ${licSummary.conversionRate >= 30 ? "text-green-600" : "text-text-primary"}`}>
                        {licSummary.conversionRate}%
                      </p>
                    </div>
                  </div>

                  {/* Distribution bar */}
                  {licSummary.total > 0 && (
                    <div>
                      <div className="flex h-3 rounded-full overflow-hidden mb-2">
                        {(["evaluating","preparing","sent","won","lost","not_submitted"] as LicitacionStage[]).map((s) => {
                          const pct = ((licSummary.byStageCounts[s] ?? 0) / licSummary.total) * 100
                          if (pct === 0) return null
                          return (
                            <div
                              key={s}
                              style={{ width: `${pct}%`, backgroundColor: LIC_STAGE_COLORS[s] }}
                              title={`${LIC_STAGE_LABELS[s]}: ${licSummary.byStageCounts[s]}`}
                            />
                          )
                        })}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        {(["evaluating","preparing","sent","won","lost","not_submitted"] as LicitacionStage[]).map((s) => {
                          const n = licSummary.byStageCounts[s] ?? 0
                          if (n === 0) return null
                          return (
                            <span key={s} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: LIC_STAGE_COLORS[s] }} />
                              {LIC_STAGE_LABELS[s]} ({n})
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Stale alerts */}
              <StaleAlertList opportunities={staleOpps} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
