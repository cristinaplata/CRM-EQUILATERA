"use client"

import { useState, useEffect, useRef } from "react"
import { User, LeadSource } from "@prisma/client"
import { Modal } from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import { Linkedin, Download, Users, Video, Mail, HelpCircle, type LucideIcon } from "lucide-react"

const SOURCES: { value: LeadSource; label: string; icon: LucideIcon }[] = [
  { value: "linkedin_organic", label: "LinkedIn", icon: Linkedin },
  { value: "lead_magnet", label: "Lead magnet", icon: Download },
  { value: "referral", label: "Referido", icon: Users },
  { value: "webinar", label: "Webinar", icon: Video },
  { value: "cold_outreach", label: "Outreach frío", icon: Mail },
  { value: "other", label: "Otro", icon: HelpCircle },
]

interface QuickLeadModalProps {
  open: boolean
  onClose: () => void
  onCreated: (opp: unknown) => void
  currentUserId: string
  users: Pick<User, "id" | "name" | "email">[]
}

export function QuickLeadModal({ open, onClose, onCreated, currentUserId, users }: QuickLeadModalProps) {
  const { toast } = useToast()
  const [companyName, setCompanyName] = useState("")
  const [ownerId, setOwnerId] = useState(currentUserId)
  const [leadSource, setLeadSource] = useState<LeadSource | "">("")
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const companyRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setCompanyName("")
      const validId = users.find((u) => u.id === currentUserId)?.id ?? users[0]?.id ?? ""
      setOwnerId(validId)
      setLeadSource("")
      companyRef.current?.focus()
    }
  }, [open, currentUserId, users])

  useEffect(() => {
    if (!companyName.trim()) { setCompanies([]); return }
    const t = setTimeout(async () => {
      const res = await fetch(`/api/companies?q=${encodeURIComponent(companyName)}`)
      const data = await res.json()
      setCompanies(data.slice(0, 5))
    }, 300)
    return () => clearTimeout(t)
  }, [companyName])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyName.trim() || !leadSource) return
    setLoading(true)

    const existing = companies.find((c) => c.name.toLowerCase() === companyName.toLowerCase())
    const body = existing
      ? { companyId: existing.id, ownerId, leadSource }
      : { companyName: companyName.trim(), ownerId, leadSource }

    try {
      const res = await fetch("/api/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error()
      const opp = await res.json()
      onCreated(opp)
      toast("Lead registrado ✓")
      onClose()
    } catch {
      toast("Error al registrar el lead", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo lead" width={480}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Empresa */}
        <div>
          <label htmlFor="company" className="block text-label text-text-muted mb-1">
            Empresa <span className="text-danger">*</span>
          </label>
          <input
            ref={companyRef}
            id="company"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Nombre de la empresa"
            className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            autoComplete="off"
            required
          />
          {companies.length > 0 && (
            <ul className="mt-1 border border-border rounded-md bg-surface shadow-card overflow-hidden">
              {companies.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => { setCompanyName(c.name); setCompanies([]) }}
                    className="w-full text-left px-3 py-2 text-body text-text-primary hover:bg-surface-alt"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Responsable */}
        <div>
          <label htmlFor="owner" className="block text-label text-text-muted mb-1">
            Responsable
          </label>
          <select
            id="owner"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-border bg-surface text-body text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name ?? u.email}</option>
            ))}
          </select>
        </div>

        {/* Fuente de origen */}
        <div>
          <label className="block text-label text-text-muted mb-2">
            Fuente de origen <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SOURCES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setLeadSource(value)}
                className={`flex flex-col items-center gap-1 p-2 rounded-md border text-[11px] transition-colors ${
                  leadSource === value
                    ? "border-primary bg-primary-muted text-primary"
                    : "border-border text-text-muted hover:bg-surface-alt"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" fullWidth loading={loading} disabled={!companyName.trim() || !leadSource}>
          Registrar lead
        </Button>
      </form>
    </Modal>
  )
}
