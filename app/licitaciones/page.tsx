"use client"

export const dynamic = "force-dynamic"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User, LicitacionStage } from "@prisma/client"
import { Sidebar } from "@/components/ui/Sidebar"
import { useToast } from "@/components/ui/Toast"
import { Plus, ExternalLink, Calendar, Users, DollarSign, CheckCircle2, XCircle, Clock } from "lucide-react"
import Button from "@/components/ui/Button"

type Licitacion = {
  id: string
  tema: string
  organizacion: string | null
  fechaApertura: string | null
  fechaCierre: string | null
  duracion: string | null
  eqSola: boolean | null
  aliados: string | null
  tienePrecio: boolean | null
  precio: string | null
  factible: boolean | null
  link: string | null
  comentarios: string | null
  feedback: string | null
  stage: LicitacionStage
  owner: { id: string; name: string | null; email: string }
}

const STAGES: { key: LicitacionStage; label: string; color: string; bg: string }[] = [
  { key: "evaluating",    label: "Evaluando",      color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  { key: "preparing",     label: "Preparando",     color: "text-yellow-600", bg: "bg-yellow-50 border-yellow-200" },
  { key: "sent",          label: "Enviada",         color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { key: "won",           label: "Ganada",          color: "text-green-600",  bg: "bg-green-50 border-green-200" },
  { key: "lost",          label: "Perdida",         color: "text-red-600",    bg: "bg-red-50 border-red-200" },
  { key: "not_submitted", label: "No presentada",   color: "text-gray-500",   bg: "bg-gray-50 border-gray-200" },
]

function formatDate(d: string | null) {
  if (!d) return null
  return new Date(d).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
}

function LicitacionCard({ lic, onStageChange }: { lic: Licitacion; onStageChange: (id: string, stage: LicitacionStage) => void }) {
  const [expanded, setExpanded] = useState(false)
  const cierre = formatDate(lic.fechaCierre)
  const hoy = new Date()
  const vence = lic.fechaCierre ? new Date(lic.fechaCierre) : null
  const urgent = vence && (vence.getTime() - hoy.getTime()) < 7 * 24 * 60 * 60 * 1000 && vence > hoy

  return (
    <div className="bg-white border border-border rounded-lg p-3 shadow-sm hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-body font-medium text-text-primary text-sm leading-snug flex-1">{lic.tema}</p>
        {lic.factible === true && <CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5" />}
        {lic.factible === false && <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />}
      </div>

      {lic.organizacion && (
        <p className="text-caption text-text-muted mb-2">{lic.organizacion}</p>
      )}

      <div className="flex flex-wrap gap-2 mb-2">
        {cierre && (
          <span className={`flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded ${urgent ? "bg-red-50 text-red-600" : "bg-surface-alt text-text-muted"}`}>
            <Calendar size={10} />
            Cierre: {cierre}
          </span>
        )}
        {lic.precio && (
          <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-surface-alt text-text-muted">
            <DollarSign size={10} />
            {lic.precio}
          </span>
        )}
        {lic.eqSola === false && (
          <span className="flex items-center gap-1 text-[11px] px-1.5 py-0.5 rounded bg-surface-alt text-text-muted">
            <Users size={10} />
            Aliados
          </span>
        )}
      </div>

      {expanded && (
        <div className="mt-2 pt-2 border-t border-border space-y-1.5 text-[11px] text-text-muted">
          {lic.duracion && <p><span className="font-medium">Duración:</span> {lic.duracion}</p>}
          {lic.aliados && <p><span className="font-medium">Aliados:</span> {lic.aliados}</p>}
          {lic.comentarios && <p><span className="font-medium">Comentarios:</span> {lic.comentarios}</p>}
          {lic.feedback && <p><span className="font-medium">Feedback:</span> {lic.feedback}</p>}
          {lic.link && (
            <a href={lic.link} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-primary hover:underline">
              <ExternalLink size={10} /> Ver documentos
            </a>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
        <button onClick={() => setExpanded(!expanded)} className="text-[11px] text-text-muted hover:text-text-primary">
          {expanded ? "Ver menos" : "Ver más"}
        </button>
        <select
          value={lic.stage}
          onChange={(e) => onStageChange(lic.id, e.target.value as LicitacionStage)}
          className="text-[11px] border border-border rounded px-1.5 py-0.5 bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>
    </div>
  )
}

function NewLicitacionModal({ open, onClose, onCreated, users, currentUserId }: {
  open: boolean; onClose: () => void; onCreated: (l: Licitacion) => void
  users: Pick<User, "id" | "name" | "email">[]; currentUserId: string
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    tema: "", organizacion: "", fechaCierre: "", precio: "",
    factible: "", eqSola: "", aliados: "", link: "", comentarios: "",
    ownerId: currentUserId,
  })

  useEffect(() => {
    if (open) setForm(f => ({ ...f, tema: "", organizacion: "", fechaCierre: "", precio: "",
      factible: "", eqSola: "", aliados: "", link: "", comentarios: "", ownerId: currentUserId }))
  }, [open, currentUserId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.tema.trim()) return
    setLoading(true)
    try {
      const res = await fetch("/api/licitaciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tema: form.tema,
          organizacion: form.organizacion || undefined,
          fechaCierre: form.fechaCierre || undefined,
          precio: form.precio || undefined,
          factible: form.factible === "si" ? true : form.factible === "no" ? false : undefined,
          eqSola: form.eqSola === "si" ? true : form.eqSola === "no" ? false : undefined,
          aliados: form.aliados || undefined,
          link: form.link || undefined,
          comentarios: form.comentarios || undefined,
          ownerId: form.ownerId,
        }),
      })
      if (!res.ok) throw new Error()
      const l = await res.json()
      onCreated(l)
      toast("Licitación registrada ✓")
      onClose()
    } catch {
      toast("Error al registrar", "error")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-modal w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <h2 className="font-heading text-h2 text-text-primary mb-4">Nueva licitación</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-label text-text-muted mb-1">Temática <span className="text-danger">*</span></label>
            <input value={form.tema} onChange={e => setForm(f => ({ ...f, tema: e.target.value }))}
              className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Descripción de la licitación" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label text-text-muted mb-1">Organización</label>
              <input value={form.organizacion} onChange={e => setForm(f => ({ ...f, organizacion: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: GIZ, ONU..." />
            </div>
            <div>
              <label className="block text-label text-text-muted mb-1">Fecha cierre</label>
              <input type="date" value={form.fechaCierre} onChange={e => setForm(f => ({ ...f, fechaCierre: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label text-text-muted mb-1">Presupuesto</label>
              <input value={form.precio} onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ej: $50M, 20,000 USD" />
            </div>
            <div>
              <label className="block text-label text-text-muted mb-1">¿Factible?</label>
              <select value={form.factible} onChange={e => setForm(f => ({ ...f, factible: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Sin definir</option>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label text-text-muted mb-1">¿EQ sola?</label>
              <select value={form.eqSola} onChange={e => setForm(f => ({ ...f, eqSola: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="">Sin definir</option>
                <option value="si">Sí</option>
                <option value="no">No — necesita aliados</option>
              </select>
            </div>
            <div>
              <label className="block text-label text-text-muted mb-1">Responsable</label>
              <select value={form.ownerId} onChange={e => setForm(f => ({ ...f, ownerId: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary">
                {users.map(u => <option key={u.id} value={u.id}>{u.name ?? u.email}</option>)}
              </select>
            </div>
          </div>
          {form.eqSola === "no" && (
            <div>
              <label className="block text-label text-text-muted mb-1">¿Quiénes son los aliados?</label>
              <input value={form.aliados} onChange={e => setForm(f => ({ ...f, aliados: e.target.value }))}
                className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nombres de aliados" />
            </div>
          )}
          <div>
            <label className="block text-label text-text-muted mb-1">Link documentos</label>
            <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
              className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://drive.google.com/..." />
          </div>
          <div>
            <label className="block text-label text-text-muted mb-1">Comentarios</label>
            <textarea value={form.comentarios} onChange={e => setForm(f => ({ ...f, comentarios: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 rounded-md border border-border bg-surface text-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Notas adicionales..." />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
            <Button type="submit" fullWidth loading={loading} disabled={!form.tema.trim()}>Registrar</Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LicitacionesPage() {
  const { data: session } = useSession()
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([])
  const [users, setUsers] = useState<Pick<User, "id" | "name" | "email">[]>([])
  const [filterOwnerId, setFilterOwnerId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const params = new URLSearchParams()
    if (filterOwnerId) params.set("owner_id", filterOwnerId)
    Promise.all([
      fetch(`/api/licitaciones?${params}`).then(r => r.json()).catch(() => []),
      fetch("/api/users").then(r => r.json()).catch(() => []),
    ]).then(([lics, usrs]) => {
      setLicitaciones(Array.isArray(lics) ? lics : [])
      setUsers(Array.isArray(usrs) ? usrs : [])
      setLoading(false)
    })
  }, [filterOwnerId])

  async function handleStageChange(id: string, stage: LicitacionStage) {
    const prev = licitaciones
    setLicitaciones(ls => ls.map(l => l.id === id ? { ...l, stage } : l))
    try {
      await fetch(`/api/licitaciones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      })
    } catch {
      setLicitaciones(prev)
      toast("Error al actualizar", "error")
    }
  }

  const byStage = (stage: LicitacionStage) => licitaciones.filter(l => l.stage === stage)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={session?.user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-heading text-h1 text-text-primary">Licitaciones</h1>
              <p className="text-caption text-text-muted mt-0.5">Concursos y proyectos de gran escala</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterOwnerId(undefined)}
                  className={`px-3 h-8 rounded-full text-label transition-colors ${!filterOwnerId ? "bg-primary text-white" : "bg-surface border border-border text-text-muted hover:bg-surface-alt"}`}
                >
                  Todo el equipo
                </button>
                {users.map(u => (
                  <button key={u.id} onClick={() => setFilterOwnerId(u.id)}
                    className={`px-3 h-8 rounded-full text-label transition-colors ${filterOwnerId === u.id ? "bg-primary-muted border border-primary text-primary" : "bg-surface border border-border text-text-muted hover:bg-surface-alt"}`}>
                    {u.name ?? u.email}
                  </button>
                ))}
              </div>
              <Button onClick={() => setShowModal(true)} icon={<Plus size={16} />}>
                Nueva licitación
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4 min-h-[60vh]">
              {STAGES.map(({ key, label, color, bg }) => {
                const cards = byStage(key)
                return (
                  <div key={key} className="flex flex-col min-w-0">
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border mb-3 ${bg}`}>
                      <span className={`text-label font-semibold ${color}`}>{label}</span>
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-white ${color}`}>{cards.length}</span>
                    </div>
                    <div className="space-y-2 flex-1">
                      {cards.length === 0 ? (
                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                          <p className="text-caption text-text-muted">Sin licitaciones</p>
                        </div>
                      ) : (
                        cards.map(lic => (
                          <LicitacionCard key={lic.id} lic={lic} onStageChange={handleStageChange} />
                        ))
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <NewLicitacionModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(l) => setLicitaciones(prev => [l, ...prev])}
        users={users}
        currentUserId={users[0]?.id ?? ""}
      />
    </div>
  )
}
