import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Stage } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const STAGE_LABELS: Record<Stage, string> = {
  lead: "Lead",
  qualification: "Calificación",
  meeting: "Reunión",
  sent: "Propuesta enviada",
  negotiation: "Negociación",
  won: "Ganada",
  lost: "Perdida",
}

export const STAGE_ORDER: Stage[] = [
  "lead",
  "qualification",
  "meeting",
  "sent",
  "negotiation",
  "won",
  "lost",
]

export const STAGE_COLORS: Record<Stage, string> = {
  lead: "#94A3B8",
  qualification: "#F59E0B",
  meeting: "#3B82F6",
  sent: "#0057FF",
  negotiation: "#A200FF",
  won: "#2ECC71",
  lost: "#EF4444",
}

// Days without interaction before stale alert per stage
export const STALE_THRESHOLDS: Partial<Record<Stage, number>> = {
  lead: 3,
  qualification: 5,
  meeting: 7,
  sent: 10,
  negotiation: 7,
}

// Weekly goals per stage
export const WEEKLY_GOALS: Partial<Record<Stage, number>> = {
  lead: 20,
  qualification: 8,
  meeting: 5,
  won: 2,
}

export function isStale(stage: Stage, lastInteractionAt: Date): boolean {
  const threshold = STALE_THRESHOLDS[stage]
  if (!threshold) return false
  const diffMs = Date.now() - new Date(lastInteractionAt).getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays >= threshold
}

export function isQualificationComplete(q: {
  hasBudget: boolean | null
  hasRealPain: boolean | null
  decisionMaker: string | null
  hasUrgency: boolean | null
} | null): boolean {
  if (!q) return false
  return (
    q.hasBudget !== null &&
    q.hasRealPain !== null &&
    q.decisionMaker !== null &&
    q.hasUrgency !== null
  )
}

export function getAvatarColor(name: string): string {
  const colors = ["#0057FF", "#A200FF", "#2ECC71", "#3B82F6", "#F59E0B"]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
