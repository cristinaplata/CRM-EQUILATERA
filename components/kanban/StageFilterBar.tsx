"use client"

import { User } from "@prisma/client"
import { AvatarChip } from "@/components/ui/AvatarChip"
import { cn } from "@/lib/utils"

interface StageFilterBarProps {
  users: Pick<User, "id" | "name" | "email">[]
  activeId: string | "all"
  onFilter: (id: string | "all") => void
}

export function StageFilterBar({ users, activeId, onFilter }: StageFilterBarProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => onFilter("all")}
        className={cn(
          "inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-label transition-colors",
          activeId === "all"
            ? "bg-primary text-white"
            : "bg-surface border border-border text-text-muted hover:bg-surface-alt"
        )}
      >
        Todo el equipo
      </button>
      {users.map((u) => (
        <button
          key={u.id}
          onClick={() => onFilter(u.id)}
          className={cn(
            "inline-flex items-center gap-2 px-3 h-8 rounded-full text-label transition-colors",
            activeId === u.id
              ? "bg-primary-muted border border-primary text-primary"
              : "bg-surface border border-border text-text-muted hover:bg-surface-alt"
          )}
        >
          <AvatarChip name={u.name ?? u.email} size="sm" />
          {u.name ?? u.email}
        </button>
      ))}
    </div>
  )
}
