import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { Opportunity, Company, User, Stage } from "@prisma/client"
import { STAGE_LABELS, STALE_THRESHOLDS } from "@/lib/utils"
import { AvatarChip } from "@/components/ui/AvatarChip"
import { StageBadge } from "@/components/ui/Badge"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"

type StaleOpp = Opportunity & {
  company: Company
  owner: Pick<User, "id" | "name" | "email">
}

export function StaleAlertList({ opportunities }: { opportunities: StaleOpp[] }) {
  if (opportunities.length === 0) {
    return (
      <div className="bg-surface rounded-md border border-border shadow-card p-5">
        <h3 className="font-heading text-h3 text-text-primary mb-2">Oportunidades estancadas</h3>
        <p className="text-body text-accent">¡Todo el pipeline está activo! ✓</p>
      </div>
    )
  }

  return (
    <div className="bg-surface rounded-md border border-border shadow-card">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <h3 className="font-heading text-h3 text-text-primary">Oportunidades estancadas</h3>
        <span className="inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full text-[11px] font-semibold bg-accent-warning/20 text-amber-700">
          {opportunities.length}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {opportunities.map((opp) => {
          const threshold = STALE_THRESHOLDS[opp.stage as Stage]
          const days = Math.floor(
            (Date.now() - new Date(opp.lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24)
          )
          return (
            <li key={opp.id} className="px-5 py-3 flex items-center gap-4">
              <AlertTriangle size={14} className="text-accent-warning shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-body font-medium text-text-primary truncate">{opp.company.name}</span>
                  <StageBadge stage={opp.stage as Stage} size="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <AvatarChip name={opp.owner.name ?? opp.owner.email} size="sm" showName />
                  <span className="text-caption text-accent-warning">
                    {days} días sin interacción (umbral: {threshold})
                  </span>
                </div>
              </div>
              <Link
                href={`/opportunities/${opp.id}`}
                className="text-label text-primary hover:underline shrink-0"
              >
                Ver detalle →
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
