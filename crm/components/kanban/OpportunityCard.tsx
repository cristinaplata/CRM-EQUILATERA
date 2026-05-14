"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Opportunity, Company, User, Qualification, Stage, LeadSource } from "@prisma/client"
import { AlertTriangle, Zap } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { isStale, isQualificationComplete, cn } from "@/lib/utils"
import { AvatarChip } from "@/components/ui/AvatarChip"
import { LeadSourceBadge } from "./LeadSourceBadge"
import Link from "next/link"

type OpportunityWithRelations = Opportunity & {
  company: Company
  owner: Pick<User, "id" | "name" | "email">
  qualification: Qualification | null
}

interface OpportunityCardProps {
  opportunity: OpportunityWithRelations
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: opportunity.id })

  const stale = isStale(opportunity.stage, opportunity.lastInteractionAt)
  const qualIncomplete =
    opportunity.stage === "qualification" &&
    !isQualificationComplete(opportunity.qualification)

  const showSourceBadge =
    opportunity.leadSource &&
    (opportunity.stage === "lead" || opportunity.stage === "qualification")

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
    rotate: isDragging ? "2deg" : "0deg",
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link
        href={`/opportunities/${opportunity.id}`}
        className={cn(
          "block bg-surface rounded-md shadow-card border-l-[3px] p-3 cursor-pointer hover:shadow-hover transition-shadow",
          stale ? "border-l-amber-400" : qualIncomplete ? "border-l-orange-400" : "border-l-transparent"
        )}
        onClick={(e) => {
          // Prevent navigation when dragging
          if (isDragging) e.preventDefault()
        }}
      >
        {/* Alerts */}
        {(stale || qualIncomplete) && (
          <div className="flex items-center gap-1.5 mb-2">
            {stale && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600">
                <AlertTriangle size={11} /> Estancada
              </span>
            )}
            {qualIncomplete && (
              <span className="flex items-center gap-1 text-[11px] text-orange-500">
                <Zap size={11} /> Calificación incompleta
              </span>
            )}
          </div>
        )}

        {/* Company name */}
        <p className="text-h3 text-text-primary truncate mb-1">{opportunity.company.name}</p>

        {/* Lead source badge */}
        {showSourceBadge && opportunity.leadSource && (
          <div className="mb-2">
            <LeadSourceBadge source={opportunity.leadSource as LeadSource} />
          </div>
        )}

        {/* Owner + last interaction */}
        <div className="flex items-center justify-between mt-2">
          <AvatarChip name={opportunity.owner.name ?? opportunity.owner.email} size="sm" showName />
          <span className="text-caption text-text-muted">
            {formatDistanceToNow(new Date(opportunity.lastInteractionAt), {
              addSuffix: true,
              locale: es,
            })}
          </span>
        </div>
      </Link>
    </div>
  )
}
