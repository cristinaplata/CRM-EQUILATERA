"use client"

import { useState } from "react"
import { Stage, InteractionType } from "@prisma/client"
import { Modal } from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { format } from "date-fns"

const INTERACTION_LABELS: Record<InteractionType, string> = {
  qualification_call: "Llamada de calificación",
  diagnosis_meeting: "Reunión de diagnóstico",
  follow_up_call: "Llamada de seguimiento",
  email: "Email",
  note: "Nota interna",
  proposal_sent: "Propuesta enviada",
  negotiation: "Negociación",
  deal: "Cierre",
}

const TYPES_BY_STAGE: Partial<Record<Stage, InteractionType[]>> = {
  lead: ["note", "follow_up_call"],
  qualification: ["qualification_call", "email", "note"],
  meeting: ["diagnosis_meeting", "note"],
  sent: ["email", "note", "follow_up_call"],
  negotiation: ["negotiation", "follow_up_call", "email", "note"],
  won: ["deal", "note"],
  lost: ["deal", "note"],
}

interface QuickInteractionModalProps {
  open: boolean
  onClose: () => void
  opportunityId: string
  stage: Stage
  onCreated: (interaction: unknown) => void
}

export function QuickInteractionModal({
  open,
  onClose,
  opportunityId,
  stage,
  onCreated,
}: QuickInteractionModalProps) {
  const { toast } = useToast()
  const types = TYPES_BY_STAGE[stage] ?? ["note"]
  const [type, setType] = useState<InteractionType>(types[0])
  const [note, setNote] = useState("")
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/interactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, note: note.trim() || undefined, interactionDate: date }),
      })
      if (!res.ok) throw new Error()
      const interaction = await res.json()
      onCreated(interaction)
      toast("Interacción registrada ✓")
      onClose()
    } catch {
      toast("Error al registrar la interacción", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Registrar interacción" width={480}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label htmlFor="itype" className="block text-label text-text-muted mb-1">
            Tipo <span className="text-danger">*</span>
          </label>
          <select
            id="itype"
            value={type}
            onChange={(e) => setType(e.target.value as InteractionType)}
            className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {types.map((t) => (
              <option key={t} value={t}>{INTERACTION_LABELS[t]}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="note" className="block text-label text-text-muted mb-1">
            Nota <span className="text-caption">(opcional)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="¿Qué pasó en este contacto?"
            className="w-full px-3 py-2 rounded-md border border-border bg-surface text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        <div>
          <label htmlFor="idate" className="block text-label text-text-muted mb-1">
            Fecha
          </label>
          <input
            id="idate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <Button type="submit" fullWidth loading={loading}>
          Registrar
        </Button>
      </form>
    </Modal>
  )
}
