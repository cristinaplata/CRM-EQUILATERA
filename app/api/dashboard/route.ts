import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Stage } from "@prisma/client"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ownerId = searchParams.get("owner_id")
  const where = ownerId ? { ownerId } : {}

  const [byStage, staleCount] = await Promise.all([
    prisma.opportunity.groupBy({
      by: ["stage"],
      where,
      _count: { id: true },
    }),
    prisma.opportunity.count({
      where: {
        ...where,
        stage: { notIn: ["won", "lost"] as Stage[] },
        lastInteractionAt: {
          lt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ])

  const stageCounts = Object.fromEntries(
    byStage.map((s) => [s.stage, s._count.id])
  )

  return NextResponse.json({ stageCounts, staleCount })
}
