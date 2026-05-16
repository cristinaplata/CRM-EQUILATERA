import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      owner: { select: { id: true, name: true, email: true } },
      qualification: true,
      interactions: {
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { interactionDate: "desc" },
      },
    },
  })

  if (!opportunity) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  return NextResponse.json(opportunity)
}
