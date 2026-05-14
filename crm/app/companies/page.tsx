"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Sidebar } from "@/components/ui/Sidebar"
import { AvatarChip } from "@/components/ui/AvatarChip"
import { EmptyState } from "@/components/ui/EmptyState"
import { formatDistanceToNow } from "date-fns"
import { es } from "date-fns/locale"
import { Search, ChevronUp, ChevronDown } from "lucide-react"
import Link from "next/link"

interface CompanyRow {
  id: string
  name: string
  _count: { opportunities: number }
  opportunities: {
    id: string
    stage: string
    lastInteractionAt: string
    owner: { id: string; name: string | null }
  }[]
}

type SortKey = "name" | "opportunities" | "lastInteraction"

export default function CompaniesPage() {
  const { data: session } = useSession()
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState<SortKey>("name")
  const [sortAsc, setSortAsc] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/companies")
      .then((r) => r.json())
      .then((data) => { setCompanies(data); setLoading(false) })
  }, [])

  const filtered = companies
    .filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let cmp = 0
      if (sortKey === "name") cmp = a.name.localeCompare(b.name)
      if (sortKey === "opportunities") cmp = a._count.opportunities - b._count.opportunities
      if (sortKey === "lastInteraction") {
        const aDate = a.opportunities[0]?.lastInteractionAt ?? ""
        const bDate = b.opportunities[0]?.lastInteractionAt ?? ""
        cmp = aDate.localeCompare(bDate)
      }
      return sortAsc ? cmp : -cmp
    })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v)
    else { setSortKey(key); setSortAsc(true) }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return null
    return sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar userName={session?.user?.name} />
      <main className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-heading text-h1 text-text-primary">Empresas</h1>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar empresa…"
                className="h-9 pl-8 pr-3 rounded-md border border-border text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary w-56"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="Sin empresas" description="Registra un lead para crear la primera empresa" />
          ) : (
            <div className="bg-surface rounded-md border border-border shadow-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {[
                      { key: "name" as SortKey, label: "Empresa" },
                      { key: "opportunities" as SortKey, label: "Oportunidades" },
                      { key: "lastInteraction" as SortKey, label: "Última interacción" },
                    ].map(({ key, label }) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="text-left px-4 py-3 text-label text-text-muted cursor-pointer hover:text-text-primary select-none"
                      >
                        <span className="flex items-center gap-1">
                          {label} <SortIcon k={key} />
                        </span>
                      </th>
                    ))}
                    <th className="text-left px-4 py-3 text-label text-text-muted">Responsable</th>
                    <th />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((c) => {
                    const lastOpp = c.opportunities[0]
                    return (
                      <tr key={c.id} className="hover:bg-surface-alt transition-colors">
                        <td className="px-4 py-3 text-body font-medium text-text-primary">{c.name}</td>
                        <td className="px-4 py-3 text-body text-text-muted">{c._count.opportunities}</td>
                        <td className="px-4 py-3 text-caption text-text-muted">
                          {lastOpp
                            ? formatDistanceToNow(new Date(lastOpp.lastInteractionAt), { addSuffix: true, locale: es })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {lastOpp?.owner && (
                            <AvatarChip name={lastOpp.owner.name ?? "?"} size="sm" showName />
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {lastOpp && (
                            <Link
                              href={`/opportunities/${lastOpp.id}`}
                              className="text-label text-primary hover:underline"
                            >
                              Ver →
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
