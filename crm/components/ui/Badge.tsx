import { cn } from "@/lib/utils"
import { Stage } from "@prisma/client"
import { STAGE_LABELS, STAGE_COLORS } from "@/lib/utils"

interface BadgeProps {
  children: React.ReactNode
  color?: string
  size?: "sm" | "md"
  className?: string
}

export function Badge({ children, color, size = "md", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-body font-medium",
        size === "sm" ? "h-5 px-2 text-[11px]" : "h-6 px-2.5 text-label",
        className
      )}
      style={color ? { backgroundColor: color + "1A", color } : undefined}
    >
      {children}
    </span>
  )
}

export function StageBadge({ stage, size = "md" }: { stage: Stage; size?: "sm" | "md" }) {
  const color = STAGE_COLORS[stage]
  return (
    <Badge color={color} size={size}>
      {STAGE_LABELS[stage]}
    </Badge>
  )
}
