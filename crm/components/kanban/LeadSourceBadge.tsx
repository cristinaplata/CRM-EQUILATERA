import { LeadSource } from "@prisma/client"
import { Linkedin, Download, Users, Video, Mail, HelpCircle, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const SOURCE_CONFIG: Record<LeadSource, { label: string; color: string; icon: LucideIcon }> = {
  linkedin_organic: { label: "LinkedIn", color: "#0A66C2", icon: Linkedin },
  lead_magnet: { label: "Lead magnet", color: "#7C3AED", icon: Download },
  referral: { label: "Referido", color: "#2ECC71", icon: Users },
  webinar: { label: "Webinar", color: "#F59E0B", icon: Video },
  cold_outreach: { label: "Outreach", color: "#64748B", icon: Mail },
  other: { label: "Otro", color: "#CBD5E1", icon: HelpCircle },
}

interface LeadSourceBadgeProps {
  source: LeadSource
  className?: string
}

export function LeadSourceBadge({ source, className }: LeadSourceBadgeProps) {
  const config = SOURCE_CONFIG[source]
  const Icon = config.icon

  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full h-5 px-2 text-[11px] font-medium", className)}
      style={{ backgroundColor: config.color + "1A", color: config.color }}
    >
      <Icon size={10} />
      {config.label}
    </span>
  )
}
