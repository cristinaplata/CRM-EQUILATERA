import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Stage } from "@prisma/client"
import { STALE_THRESHOLDS } from "@/lib/utils"

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const activeStages: Stage[] = ["lead", "qualification", "meeting", "sent", "negotiation"]

  const opportunities = await prisma.opportunity.findMany({
    where: { stage: { in: activeStages } },
    include: {
      company: true,
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { lastInteractionAt: "asc" },
  })

  const stale = opportunities.filter((opp) => {
    const threshold = STALE_THRESHOLDS[opp.stage]
    if (!threshold) return false
    const diffDays =
      (Date.now() - new Date(opp.lastInteractionAt).getTime()) / (1000 * 60 * 60 * 24)
    return diffDays >= threshold
  })

  return NextResponse.json(stale)
}
