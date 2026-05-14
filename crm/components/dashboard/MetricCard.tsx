import { cn } from "@/lib/utils"

interface MetricCardProps {
  label: string
  value: string | number
  variant?: "normal" | "positive" | "alert"
  subtitle?: string
}

const variantStyles = {
  normal: "border-border",
  positive: "border-accent bg-emerald-50",
  alert: "border-accent-warning bg-amber-50",
}

export function MetricCard({ label, value, variant = "normal", subtitle }: MetricCardProps) {
  return (
    <div className={cn("bg-surface rounded-md border p-4 shadow-card", variantStyles[variant])}>
      <p className="text-label text-text-muted mb-1">{label}</p>
      <p className={cn(
        "font-heading font-bold text-[28px] leading-none",
        variant === "positive" ? "text-accent" : variant === "alert" ? "text-accent-warning" : "text-text-primary"
      )}>
        {value}
      </p>
      {subtitle && <p className="text-caption text-text-muted mt-1">{subtitle}</p>}
    </div>
  )
}
