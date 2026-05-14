"use client"

import { useState } from "react"
import { Modal } from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { AlertTriangle } from "lucide-react"

type TriAnswer = true | false | null

interface QuickQualificationModalProps {
  open: boolean
  onClose: () => void
  opportunityId: string
  onQualified: (result: unknown) => void
}

function QualificationToggle({
  id,
  value,
  onChange,
}: {
  id: string
  value: TriAnswer
  onChange: (v: TriAnswer) => void
}) {
  const options: { v: TriAnswer; label: string; activeClass: string }[] = [
    { v: true, label: "Sí", activeClass: "bg-accent text-white border-accent" },
    { v: false, label: "No", activeClass: "bg-danger/10 text-danger border-danger" },
    { v: null, label: "No sé", activeClass: "bg-border text-text-muted border-border-strong" },
  ]

  return (
    <div role="radiogroup" id={id} className="flex gap-2">
      {options.map(({ v, label, activeClass }) => (
        <button
          key={label}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`flex-1 h-9 rounded-md border text-label font-medium transition-colors ${
            value === v ? activeClass : "border-border text-text-muted hover:bg-surface-alt"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

export function QuickQualificationModal({
  open,
  onClose,
  opportunityId,
  onQualified,
}: QuickQualificationModalProps) {
  const { toast } = useToast()
  const [hasBudget, setHasBudget] = useState<TriAnswer>(null)
  const [hasRealPain, setHasRealPain] = useState<TriAnswer>(null)
  const [decisionMaker, setDecisionMaker] = useState("")
  const [hasUrgency, setHasUrgency] = useState<TriAnswer>(null)
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)

  const answered = [hasBudget, hasRealPain, decisionMaker.trim() || null, hasUrgency].filter(
    (v) => v !== null
  ).length

  const isComplete = answered === 4

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (answered < 2) return
    setLoading(true)

    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/qualify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hasBudget: hasBudget,
          hasRealPain: hasRealPain,
          decisionMaker: decisionMaker.trim() || null,
          hasUrgency: hasUrgency,
          qualificationNotes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error()
      const result = await res.json()
      onQualified(result)
      toast(isComplete ? "Calificación completa ✓" : "Calificación incompleta — completar pronto ⚠", isComplete ? "success" : "warning")
      onClose()
    } catch {
      toast("Error al calificar el lead", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Calificar lead" width={520}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-label text-text-muted mb-2">
            ¿Tiene presupuesto para consultoría?
          </label>
          <QualificationToggle id="budget" value={hasBudget} onChange={setHasBudget} />
        </div>

        <div>
          <label className="block text-label text-text-muted mb-2">
            ¿Hay un dolor real que EQUILATERA resuelve?
          </label>
          <QualificationToggle id="pain" value={hasRealPain} onChange={setHasRealPain} />
        </div>

        <div>
          <label htmlFor="dm" className="block text-label text-text-muted mb-2">
            ¿Quién decide la compra?
          </label>
          <input
            id="dm"
            value={decisionMaker}
            onChange={(e) => setDecisionMaker(e.target.value)}
            placeholder="Nombre o cargo"
            className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-label text-text-muted mb-2">
            ¿Hay urgencia o trigger visible?
          </label>
          <QualificationToggle id="urgency" value={hasUrgency} onChange={setHasUrgency} />
        </div>

        <div>
          <label htmlFor="notes" className="block text-label text-text-muted mb-2">
            Notas adicionales <span className="text-caption">(opcional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-md border border-border bg-surface text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between text-label text-text-muted">
          <span>{answered} de 4 preguntas respondidas</span>
          {!isComplete && answered >= 2 && (
            <span className="flex items-center gap-1 text-accent-warning">
              <AlertTriangle size={12} /> Quedará incompleta
            </span>
          )}
        </div>

        <Button type="submit" fullWidth loading={loading} disabled={answered < 2}>
          Calificar lead
        </Button>
      </form>
    </Modal>
  )
}
