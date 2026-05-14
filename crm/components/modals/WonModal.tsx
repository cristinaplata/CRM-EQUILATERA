"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"

interface WonModalProps {
  open: boolean
  onClose: () => void
  opportunityId: string
  companyName: string
  onWon: (opp: unknown) => void
}

export function WonModal({ open, onClose, opportunityId, companyName, onWon }: WonModalProps) {
  const { toast } = useToast()
  const [dealAmount, setDealAmount] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amount = parseFloat(dealAmount)
    if (!amount || amount <= 0) return
    setLoading(true)

    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/won`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealAmount: amount }),
      })
      if (!res.ok) throw new Error()
      const opp = await res.json()
      onWon(opp)
      toast(`🎉 ¡${companyName} — Ganada!`, "success")
      onClose()
    } catch {
      toast("Error al marcar como ganada", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Marcar como Ganada" width={420}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <p className="text-body text-text-muted">
          ¡Bien! Confirma el monto del negocio con <strong className="text-text-primary">{companyName}</strong>.
        </p>
        <div>
          <label htmlFor="amount" className="block text-label text-text-muted mb-1">
            Monto del negocio (COP) <span className="text-danger">*</span>
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={dealAmount}
            onChange={(e) => setDealAmount(e.target.value)}
            placeholder="0"
            className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            autoFocus
            required
          />
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" fullWidth onClick={onClose}>Cancelar</Button>
          <Button type="submit" fullWidth loading={loading} disabled={!dealAmount}>
            Confirmar ✓
          </Button>
        </div>
      </form>
    </Modal>
  )
}
