"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react"

type ToastVariant = "success" | "warning" | "error" | "info"

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  info: Info,
}

const styles = {
  success: "border-accent text-accent",
  warning: "border-accent-warning text-accent-warning",
  error: "border-danger text-danger",
  info: "border-primary text-primary",
}

function ToastItem({ item, onRemove }: { item: ToastItem; onRemove: (id: string) => void }) {
  const Icon = icons[item.variant]

  useEffect(() => {
    const t = setTimeout(() => onRemove(item.id), 4000)
    return () => clearTimeout(t)
  }, [item.id, onRemove])

  return (
    <div
      role="alert"
      className={cn(
        "flex items-center gap-3 rounded-md border bg-surface px-4 py-3 shadow-modal text-body",
        styles[item.variant]
      )}
    >
      <Icon size={16} className="shrink-0" />
      <span className="flex-1 text-text-primary">{item.message}</span>
      <button
        onClick={() => onRemove(item.id)}
        className="text-text-muted hover:text-text-primary transition-colors"
        aria-label="Cerrar"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { id, message, variant }])
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <ToastItem key={t.id} item={t} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
