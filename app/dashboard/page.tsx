"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, Stage } from "@prisma/client"
import { Sidebar } from "@/components/ui/Sidebar"
import { MetricCard } from "@/components/dashboard/MetricCard"
import { FunnelMetricsWidget } from "@/components/dashboard/FunnelMetricsWidget"
import { PipelineSummaryBar } from "@/components/dashboard/PipelineSummaryBar"
import { StaleAlertList } from "@/components/dashboard/StaleAlertList"

interface DashboardData {
  stageCounts: Partial<Record<Stage, number>>
  staleCount: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [data, setData] = useState<DashboardData | null>(null)
  const [staleOpps, setStaleOpps] = useState([])
  const [users, setUsers] = useState<Pick<User, "id" | "name" | "email">[]>([])
  const [filterOwnerId, setFilterOwnerId] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterOwnerId) params.set("owner_id", filterOwnerId)

    Promise.all([
      fetch(`/api/dashboard?${params}`).then((r) => r.json()),
      fetch("/api/opportunities/stale").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
    ]).then(([d, stale, usrs]) => {
      setData(d)
      setStaleOpps(stale)
      setUsers(usrs)
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

              {/* Stale alerts */}
              <StaleAlertList opportunities={staleOpps} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
