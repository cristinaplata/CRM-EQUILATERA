"use client"

import { useState } from "react"
import { LostReason } from "@prisma/client"
import { Modal } from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"

const LOST_REASONS: { value: LostReason; label: string }[] = [
  { value: "price", label: "Precio" },
  { value: "timing", label: "Timing" },
  { value: "competition", label: "Competencia" },
  { value: "other", label: "Otro" },
]

interface LostModalProps {
  open: boolean
  onClose: () => void
  opportunityId: string
  companyName: string
  onLost: (opp: unknown) => void
}

export function LostModal({ open, onClose, opportunityId, companyName, onLost }: LostModalProps) {
  const { toast } = useToast()
  const [lostReason, setLostReason] = useState<LostReason | "">("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!lostReason) return
    setLoading(true)

    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/lost`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lostReason }),
      })
      if (!res.ok) throw new Error()
      const opp = await res.json()
      onLost(opp)
      toast(`${companyName} marcada como Perdida`, "warning")
      onClose()
    } catch {
      toast("Error al marcar como perdida", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Marcar como Perdida" width={420}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-body text-text-muted">
          ¿Por qué se perdió <strong className="text-text-primary">{companyName}</strong>?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {LOST_REASONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setLostReason(value)}
              className={`h-10 rounded-md border text-label font-medium transition-colors ${
                lostReason === value
                  ? "border-danger bg-danger/10 text-danger"
                  : "border-border text-text-muted hover:bg-surface-alt"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="danger" fullWidth loading={loading} disabled={!lostReason}>
            Confirmar pérdida
          </Button>
        </div>
      </form>
    </Modal>
  )
}
