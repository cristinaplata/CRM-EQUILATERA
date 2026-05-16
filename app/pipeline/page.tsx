"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { User, Stage } from "@prisma/client"
import { KanbanBoard } from "@/components/kanban/KanbanBoard"
import { StageFilterBar } from "@/components/kanban/StageFilterBar"
import { QuickLeadModal } from "@/components/modals/QuickLeadModal"
import { Sidebar } from "@/components/ui/Sidebar"
import { Plus } from "lucide-react"
import Button from "@/components/ui/Button"
import { useSession } from "next-auth/react"

export default function PipelinePage() {
  const { data: session } = useSession()
  const [opportunities, setOpportunities] = useState<unknown[]>([])
  const [users, setUsers] = useState<Pick<User, "id" | "name" | "email">[]>([])
  const [weeklyCounts, setWeeklyCounts] = useState<Partial<Record<Stage, number>>>({})
  const [filterOwnerId, setFilterOwnerId] = useState<string | "all">("all")
  const [showLeadModal, setShowLeadModal] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/opportunities").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/dashboard/funnel").then((r) => r.json()),
    ]).then(([opps, usrs, funnel]) => {
      setOpportunities(opps)
      setUsers(usrs)
      // Map funnel data to stage counts for progress bars
      setWeeklyCounts({
        lead: funnel.funnel?.leads?.current ?? 0,
        qualification: funnel.funnel?.qualified?.current ?? 0,
        meeting: funnel.funnel?.meetings?.current ?? 0,
        won: funnel.funnel?.won?.current ?? 0,
      })
      setLoading(false)
    })
  }, [])

  function handleLeadCreated(opp: unknown) {
    setOpportunities((prev) => [opp, ...prev])
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar userName={session?.user?.name} />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={session?.user?.name} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface shrink-0">
          <h1 className="font-heading text-h1 text-text-primary">Pipeline</h1>
          <Button onClick={() => setShowLeadModal(true)} size="sm">
            <Plus size={16} /> Nuevo lead
          </Button>
        </header>

        <div className="px-6 py-3 border-b border-border bg-surface shrink-0">
          <StageFilterBar
            users={users}
            activeId={filterOwnerId}
            onFilter={setFilterOwnerId}
          />
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          <KanbanBoard
            // @ts-expect-error typed inline
            initialOpportunities={opportunities}
            weeklyCounts={weeklyCounts}
            filterOwnerId={filterOwnerId === "all" ? undefined : filterOwnerId}
          />
        </div>
      </main>

      <QuickLeadModal
        open={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        onCreated={handleLeadCreated}
        currentUserId={session?.user?.id ?? ""}
        users={users}
      />
    </div>
  )
}
