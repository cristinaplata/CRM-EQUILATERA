"use client"

import { useState, useCallback } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core"
import { Stage, Opportunity, Company, User, Qualification } from "@prisma/client"
import { STAGE_ORDER } from "@/lib/utils"
import { KanbanColumn } from "./KanbanColumn"
import { useToast } from "@/components/ui/Toast"

type OpportunityWithRelations = Opportunity & {
  company: Company
  owner: Pick<User, "id" | "name" | "email">
  qualification: Qualification | null
}

interface KanbanBoardProps {
  initialOpportunities: OpportunityWithRelations[]
  weeklyCounts: Partial<Record<Stage, number>>
  filterOwnerId?: string
}

export function KanbanBoard({ initialOpportunities, weeklyCounts, filterOwnerId }: KanbanBoardProps) {
  const [opportunities, setOpportunities] = useState(initialOpportunities)
  const [activeId, setActiveId] = useState<string | null>(null)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const filtered = filterOwnerId
    ? opportunities.filter((o) => o.ownerId === filterOwnerId)
    : opportunities

  const byStage = STAGE_ORDER.reduce<Record<Stage, OpportunityWithRelations[]>>(
    (acc, stage) => {
      acc[stage] = filtered.filter((o) => o.stage === stage)
      return acc
    },
    {} as Record<Stage, OpportunityWithRelations[]>
  )

  const activeOpportunity = activeId ? opportunities.find((o) => o.id === activeId) : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveId(null)
      const { active, over } = event
      if (!over) return

      const opp = opportunities.find((o) => o.id === active.id)
      if (!opp) return

      // over.id can be a stage (droppable) or another card id
      let newStage = over.id as Stage
      if (!STAGE_ORDER.includes(newStage)) {
        // over is a card — find its stage
        const targetOpp = opportunities.find((o) => o.id === over.id)
        if (!targetOpp) return
        newStage = targetOpp.stage
      }

      if (opp.stage === newStage) return

      // Block moving to won/lost via drag — must use buttons
      if (newStage === "won" || newStage === "lost") {
        toast("Usa el botón 'Marcar como Ganada/Perdida' para cerrar oportunidades", "warning")
        return
      }

      // Optimistic update
      setOpportunities((prev) =>
        prev.map((o) => (o.id === opp.id ? { ...o, stage: newStage } : o))
      )

      try {
        const res = await fetch(`/api/opportunities/${opp.id}/stage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage: newStage }),
        })
        if (!res.ok) throw new Error()
      } catch {
        // Revert
        setOpportunities((prev) =>
          prev.map((o) => (o.id === opp.id ? { ...o, stage: opp.stage } : o))
        )
        toast("Error al mover la oportunidad", "error")
      }
    },
    [opportunities, toast]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[calc(100vh-120px)]">
        {STAGE_ORDER.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            opportunities={byStage[stage]}
            weeklyCount={weeklyCounts[stage] ?? 0}
          />
        ))}
      </div>

      <DragOverlay>
        {activeOpportunity && (
          <div className="bg-surface rounded-md shadow-modal border border-primary p-3 w-[240px] opacity-90">
            <p className="text-h3 text-text-primary">{activeOpportunity.company.name}</p>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
