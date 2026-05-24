"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"
import React from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", fullWidth, loading, icon, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-body font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-white hover:bg-primary-hover": variant === "primary",
            "border border-primary bg-transparent text-primary hover:bg-primary-muted": variant === "secondary",
            "bg-transparent text-text-muted hover:bg-surface-alt": variant === "ghost",
            "bg-danger text-white hover:opacity-90": variant === "danger",
            "h-8 px-3 text-button": size === "sm",
            "h-9 px-4 text-button": size === "md",
            "h-10 px-5 text-[14px] font-semibold": size === "lg",
            "w-full": fullWidth,
          },
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : icon ?? null}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
export default Button
