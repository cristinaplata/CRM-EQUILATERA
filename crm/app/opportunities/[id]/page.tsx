"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Opportunity, Company, User, Qualification, Interaction, Stage } from "@prisma/client"
import { Sidebar } from "@/components/ui/Sidebar"
import { StageBadge } from "@/components/ui/Badge"
import { AvatarChip } from "@/components/ui/AvatarChip"
import { LeadSourceBadge } from "@/components/kanban/LeadSourceBadge"
import { QualificationPanel } from "@/components/opportunity/QualificationPanel"
import { InteractionTimeline } from "@/components/opportunity/InteractionTimeline"
import { QuickInteractionModal } from "@/components/modals/QuickInteractionModal"
import { QuickQualificationModal } from "@/components/modals/QuickQualificationModal"
import { WonModal } from "@/components/modals/WonModal"
import { LostModal } from "@/components/modals/LostModal"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { useSession } from "next-auth/react"
import { ArrowLeft, ExternalLink, Plus } from "lucide-react"
import Link from "next/link"
import { STAGE_ORDER } from "@/lib/utils"

type FullOpportunity = Opportunity & {
  company: Company
  owner: Pick<User, "id" | "name" | "email">
  qualification: Qualification | null
  interactions: (Interaction & { author: Pick<User, "id" | "name" | "email"> })[]
}

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [opp, setOpp] = useState<FullOpportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [showInteractionModal, setShowInteractionModal] = useState(false)
  const [showQualModal, setShowQualModal] = useState(false)
  const [showWonModal, setShowWonModal] = useState(false)
  const [showLostModal, setShowLostModal] = useState(false)
  const [proposalUrl, setProposalUrl] = useState("")
  const [editingUrl, setEditingUrl] = useState(false)

  useEffect(() => {
    fetch(`/api/opportunities/${id}`)
      .then((r) => r.json())
      .then((data) => { setOpp(data); setLoading(false) })
  }, [id])

  async function handleStageAdvance() {
    if (!opp) return
    const currentIdx = STAGE_ORDER.indexOf(opp.stage)
    const nextStage = STAGE_ORDER[currentIdx + 1]
    if (!nextStage || nextStage === "won" || nextStage === "lost") return

    const res = await fetch(`/api/opportunities/${opp.id}/stage`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: nextStage }),
    })
    if (res.ok) {
      const updated = await res.json()
      setOpp((prev) => prev ? { ...prev, ...updated } : prev)
      toast(`Movida a ${updated.stage} ✓`)
    }
  }

  async function saveProposalUrl() {
    if (!opp || !proposalUrl) return
    const res = await fetch(`/api/opportunities/${opp.id}/proposal`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ proposalUrl }),
    })
    if (res.ok) {
      setOpp((prev) => prev ? { ...prev, proposalUrl } : prev)
      setEditingUrl(false)
      toast("Enlace guardado ✓")
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen">
        <Sidebar userName={session?.user?.name} />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </main>
      </div>
    )
  }

  if (!opp) return null

  const currentIdx = STAGE_ORDER.indexOf(opp.stage)
  const nextStage = STAGE_ORDER[currentIdx + 1]
  const canAdvance = nextStage && nextStage !== "won" && nextStage !== "lost"
  const isActive = opp.stage !== "won" && opp.stage !== "lost"

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={session?.user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {/* Back */}
          <Link href="/pipeline" className="flex items-center gap-1 text-label text-text-muted hover:text-text-primary mb-4">
            <ArrowLeft size={14} /> Pipeline
          </Link>

          {/* Header */}
          <div className="bg-surface rounded-md border border-border shadow-card p-5 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="font-heading text-h1 text-text-primary mb-2">{opp.company.name}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <StageBadge stage={opp.stage as Stage} />
                  {opp.leadSource && (
                    <LeadSourceBadge source={opp.leadSource} />
                  )}
                  <AvatarChip name={opp.owner.name ?? opp.owner.email} size="sm" showName />
                </div>
              </div>

              {isActive && (
                <div className="flex gap-2 shrink-0 flex-wrap justify-end">
                  {opp.stage === "lead" && (
                    <Button variant="secondary" size="sm" onClick={() => setShowQualModal(true)}>
                      Calificar lead
                    </Button>
                  )}
                  {canAdvance && opp.stage !== "lead" && (
                    <Button variant="secondary" size="sm" onClick={handleStageAdvance}>
                      Avanzar etapa →
                    </Button>
                  )}
                  <Button size="sm" variant="primary" onClick={() => setShowWonModal(true)}>
                    Marcar Ganada
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setShowLostModal(true)}>
                    Marcar Perdida
                  </Button>
                </div>
              )}
            </div>

            {/* Proposal URL */}
            {(opp.stage === "sent" || opp.stage === "negotiation" || opp.stage === "won") && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-label text-text-muted mb-1">Carpeta de propuesta</p>
                {opp.proposalUrl && !editingUrl ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={opp.proposalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body text-primary hover:underline flex items-center gap-1 truncate"
                    >
                      {opp.proposalUrl} <ExternalLink size={12} />
                    </a>
                    <button
                      onClick={() => { setProposalUrl(opp.proposalUrl ?? ""); setEditingUrl(true) }}
                      className="text-caption text-text-muted hover:text-text-primary"
                    >
                      Editar
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={proposalUrl}
                      onChange={(e) => setProposalUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="flex-1 h-8 px-2 text-body rounded-md border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button size="sm" onClick={saveProposalUrl} disabled={!proposalUrl}>
                      Guardar
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Qualification */}
          {(opp.stage !== "lead") && (
            <div className="mb-4">
              <QualificationPanel
                qualification={opp.qualification}
                onEdit={() => setShowQualModal(true)}
              />
            </div>
          )}

          {/* Interactions */}
          <div className="bg-surface rounded-md border border-border shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-h2 text-text-primary">Interacciones</h2>
              {isActive && (
                <Button size="sm" variant="secondary" onClick={() => setShowInteractionModal(true)}>
                  <Plus size={14} /> Registrar
                </Button>
              )}
            </div>
            <InteractionTimeline interactions={opp.interactions} />
          </div>
        </div>
      </main>

      <QuickInteractionModal
        open={showInteractionModal}
        onClose={() => setShowInteractionModal(false)}
        opportunityId={opp.id}
        stage={opp.stage as Stage}
        onCreated={(interaction) => {
          setOpp((prev) =>
            prev ? { ...prev, interactions: [interaction as FullOpportunity["interactions"][0], ...prev.interactions] } : prev
          )
        }}
      />

      <QuickQualificationModal
        open={showQualModal}
        onClose={() => setShowQualModal(false)}
        opportunityId={opp.id}
        onQualified={(result) => {
          const r = result as { opportunity: FullOpportunity; qualification: Qualification }
          setOpp((prev) => prev ? { ...prev, ...r.opportunity, qualification: r.qualification } : prev)
        }}
      />

      <WonModal
        open={showWonModal}
        onClose={() => setShowWonModal(false)}
        opportunityId={opp.id}
        companyName={opp.company.name}
        onWon={(updated) => setOpp((prev) => prev ? { ...prev, ...(updated as Partial<FullOpportunity>) } : prev)}
      />

      <LostModal
        open={showLostModal}
        onClose={() => setShowLostModal(false)}
        opportunityId={opp.id}
        companyName={opp.company.name}
        onLost={(updated) => setOpp((prev) => prev ? { ...prev, ...(updated as Partial<FullOpportunity>) } : prev)}
      />
    </div>
  )
}
