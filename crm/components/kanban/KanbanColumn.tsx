"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Stage, Opportunity, Company, User, Qualification } from "@prisma/client"
import { STAGE_LABELS, STAGE_COLORS, WEEKLY_GOALS, cn } from "@/lib/utils"
import { OpportunityCard } from "./OpportunityCard"
import { WeeklyProgressBar } from "./WeeklyProgressBar"
import { EmptyState } from "@/components/ui/EmptyState"

type OpportunityWithRelations = Opportunity & {
  company: Company
  owner: Pick<User, "id" | "name" | "email">
  qualification: Qualification | null
}

interface KanbanColumnProps {
  stage: Stage
  opportunities: OpportunityWithRelations[]
  weeklyCount?: number
}

export function KanbanColumn({ stage, opportunities, weeklyCount = 0 }: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stage })
  const color = STAGE_COLORS[stage]
  const hasGoal = !!WEEKLY_GOALS[stage]

  return (
    <div className="flex flex-col min-w-[220px] max-w-[280px] flex-1">
      {/* Column header */}
      <div
        className="px-3 py-3 rounded-t-md border-t-2 border-border bg-surface"
        style={{ borderTopColor: color }}
      >
        <div className="flex items-center justify-between">
          <span className="font-heading text-h2 text-text-primary">{STAGE_LABELS[stage]}</span>
          <span
            className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {opportunities.length}
          </span>
        </div>
        {hasGoal && <WeeklyProgressBar stage={stage} current={weeklyCount} />}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 bg-bg rounded-b-md p-2 flex flex-col gap-2 min-h-[200px] border border-t-0 border-border transition-colors",
          isOver && "border-primary bg-primary-muted"
        )}
      >
        <SortableContext
          items={opportunities.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {opportunities.length === 0 ? (
            <EmptyState
              title={`Sin ${STAGE_LABELS[stage].toLowerCase()}`}
              description="Arrastra una tarjeta aquí"
              className="py-8"
            />
          ) : (
            opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}
