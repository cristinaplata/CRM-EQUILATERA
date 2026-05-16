"use client"

import { useState } from "react"
import { Qualification } from "@prisma/client"
import { isQualificationComplete } from "@/lib/utils"
import { CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"
import Button from "@/components/ui/Button"

function AnswerBadge({ value }: { value: boolean | null }) {
  if (value === null) return <span className="text-caption text-text-muted">Sin respuesta</span>
  if (value) return <span className="text-caption text-accent font-medium">Sí ✓</span>
  return <span className="text-caption text-danger font-medium">No</span>
}

interface QualificationPanelProps {
  qualification: Qualification | null
  onEdit: () => void
}

export function QualificationPanel({ qualification, onEdit }: QualificationPanelProps) {
  const [open, setOpen] = useState(true)
  const complete = isQualificationComplete(qualification)

  return (
    <div className="border border-border rounded-md overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-alt transition-colors"
      >
        <span className="text-h3 text-text-primary">Calificación</span>
        <div className="flex items-center gap-2">
          {qualification ? (
            complete ? (
              <span className="flex items-center gap-1 text-accent text-label">
                <CheckCircle size={14} /> Completa
              </span>
            ) : (
              <span className="flex items-center gap-1 text-accent-warning text-label">
                <AlertTriangle size={14} /> Incompleta
              </span>
            )
          ) : (
            <span className="text-label text-text-muted">Sin calificar</span>
          )}
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="px-4 py-4 border-t border-border bg-surface space-y-3">
          {qualification ? (
            <>
              <div className="grid grid-cols-1 gap-3">
                <Row label="¿Presupuesto para consultoría?" answer={qualification.hasBudget} />
                <Row label="¿Dolor real que resuelve EQUILATERA?" answer={qualification.hasRealPain} />
                <Row
                  label="¿Quién decide la compra?"
                  text={qualification.decisionMaker}
                />
                <Row label="¿Urgencia o trigger visible?" answer={qualification.hasUrgency} />
              </div>
              {qualification.qualificationNotes && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-label text-text-muted mb-1">Notas</p>
                  <p className="text-body text-text-primary">{qualification.qualificationNotes}</p>
                </div>
              )}
              <Button variant="secondary" size="sm" onClick={onEdit} className="mt-2">
                Editar calificación
              </Button>
            </>
          ) : (
            <p className="text-body text-text-muted">No se ha calificado esta oportunidad aún.</p>
          )}
        </div>
      )}
    </div>
  )
}

function Row({ label, answer, text }: { label: string; answer?: boolean | null; text?: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-body text-text-muted flex-1">{label}</span>
      {text !== undefined ? (
        <span className="text-body text-text-primary">{text ?? "—"}</span>
      ) : (
        <AnswerBadge value={answer ?? null} />
      )}
    </div>
  )
}
