import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Stage } from "@prisma/client"

const schema = z.object({ stage: z.nativeEnum(Stage) })

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { stage } = parsed.data

  const opportunity = await prisma.opportunity.findUnique({ where: { id: params.id } })
  if (!opportunity) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  // Block moving to won/lost via this endpoint — use dedicated routes
  if (stage === "won" || stage === "lost") {
    return NextResponse.json(
      { error: "Usar /won o /lost para cerrar oportunidades" },
      { status: 400 }
    )
  }

  const updated = await prisma.opportunity.update({
    where: { id: params.id },
    data: { stage, updatedAt: new Date() },
    include: {
      company: true,
      owner: { select: { id: true, name: true, email: true } },
      qualification: true,
    },
  })

  return NextResponse.json(updated)
}
