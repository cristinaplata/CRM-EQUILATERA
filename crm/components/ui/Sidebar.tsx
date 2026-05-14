"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Columns, Building2, BarChart2, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

const links = [
  { href: "/pipeline", label: "Pipeline", icon: Columns },
  { href: "/companies", label: "Empresas", icon: Building2 },
  { href: "/dashboard", label: "Dashboard", icon: BarChart2 },
]

interface SidebarProps {
  userName?: string | null
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="w-[240px] shrink-0 bg-surface border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 48 48" fill="none">
            <polygon points="24,4 44,40 4,40" fill="none" stroke="#0057FF" strokeWidth="3" />
            <polygon points="24,14 38,38 10,38" fill="none" stroke="#A200FF" strokeWidth="2" />
            <polygon points="24,24 33,38 15,38" fill="#2ECC71" opacity="0.5" />
          </svg>
          <span className="font-heading font-bold text-[18px] text-text-primary">EQUILATERA</span>
        </div>
        <p className="text-caption text-text-muted mt-1 pl-9">CRM Comercial</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-md text-body transition-colors mb-1",
              pathname.startsWith(href)
                ? "bg-primary-muted text-primary font-semibold"
                : "text-text-muted hover:bg-surface-alt hover:text-text-primary"
            )}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border">
        {userName && (
          <div className="px-3 py-2 text-label text-text-muted truncate mb-2">{userName}</div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-body text-text-muted hover:bg-surface-alt hover:text-text-primary transition-colors"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
