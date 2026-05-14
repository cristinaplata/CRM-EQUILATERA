import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfWeek, endOfWeek, subWeeks } from "date-fns"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ownerId = searchParams.get("owner_id")
  const weekOffset = parseInt(searchParams.get("week") ?? "0")

  const weekStart = startOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 })
  const weekEnd = endOfWeek(subWeeks(new Date(), weekOffset), { weekStartsOn: 1 })

  const baseWhere = {
    ...(ownerId && { ownerId }),
    createdAt: { gte: weekStart, lte: weekEnd },
  }

  const [leads, qualified, meetings, won] = await Promise.all([
    prisma.opportunity.count({ where: { ...baseWhere, stage: { in: ["lead", "qualification", "meeting", "sent", "negotiation", "won", "lost"] } } }),
    prisma.opportunity.count({ where: { ...baseWhere, stage: { in: ["qualification", "meeting", "sent", "negotiation", "won"] } } }),
    prisma.opportunity.count({ where: { ...baseWhere, stage: { in: ["meeting", "sent", "negotiation", "won"] } } }),
    prisma.opportunity.count({ where: { ...baseWhere, stage: "won" } }),
  ])

  return NextResponse.json({
    week: { start: weekStart, end: weekEnd },
    funnel: {
      leads: { current: leads, goal: 20 },
      qualified: { current: qualified, goal: 8 },
      meetings: { current: meetings, goal: 5 },
      won: { current: won, goal: 2 },
    },
  })
}
