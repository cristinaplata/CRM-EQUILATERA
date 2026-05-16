import { InteractionType } from "@prisma/client"
import { cn } from "@/lib/utils"

const TYPE_CONFIG: Record<InteractionType, { label: string; style: string }> = {
  qualification_call: { label: "Llamada calificación", style: "bg-orange-100 text-orange-700" },
  diagnosis_meeting: { label: "Reunión diagnóstico", style: "bg-blue-100 text-blue-700" },
  follow_up_call: { label: "Seguimiento", style: "bg-emerald-100 text-emerald-700" },
  email: { label: "Email", style: "bg-violet-100 text-violet-700" },
  note: { label: "Nota", style: "bg-[#F4E7D5] text-amber-800" },
  proposal_sent: { label: "Propuesta enviada", style: "bg-primary-muted text-primary" },
  negotiation: { label: "Negociación", style: "bg-purple-100 text-purple-700" },
  deal: { label: "Cierre", style: "bg-emerald-100 text-emerald-800 font-semibold" },
}

export function InteractionTypeChip({ type }: { type: InteractionType }) {
  const config = TYPE_CONFIG[type]
  return (
    <span className={cn("inline-flex items-center rounded-full h-5 px-2 text-[11px] font-medium", config.style)}>
      {config.label}
    </span>
  )
}
