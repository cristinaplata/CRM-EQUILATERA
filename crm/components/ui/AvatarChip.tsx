import { getAvatarColor, getInitials } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface AvatarChipProps {
  name: string
  size?: "sm" | "md"
  showName?: boolean
  className?: string
}

export function AvatarChip({ name, size = "md", showName, className }: AvatarChipProps) {
  const color = getAvatarColor(name)
  const initials = getInitials(name)
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-label"

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn("inline-flex items-center justify-center rounded-full font-semibold text-white shrink-0", dim)}
        style={{ backgroundColor: color }}
        aria-label={name}
      >
        {initials}
      </span>
      {showName && <span className="text-label text-text-primary truncate max-w-[120px]">{name}</span>}
    </div>
  )
}
