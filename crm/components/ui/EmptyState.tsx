import { cn } from "@/lib/utils"

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      {/* Isotipo geométrico inspirado en EQUILATERA */}
      <div className="mb-4 opacity-30">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <polygon points="24,4 44,40 4,40" fill="none" stroke="#0057FF" strokeWidth="2" />
          <polygon points="24,14 38,38 10,38" fill="none" stroke="#A200FF" strokeWidth="1.5" opacity="0.6" />
          <polygon points="24,24 33,38 15,38" fill="#2ECC71" opacity="0.3" />
        </svg>
      </div>
      <p className="font-heading text-h3 text-text-muted mb-1">{title}</p>
      {description && <p className="text-caption text-text-muted mb-4 max-w-[200px]">{description}</p>}
      {action}
    </div>
  )
}
