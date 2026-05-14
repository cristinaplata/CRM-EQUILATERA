import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { InteractionType } from "@prisma/client"

const schema = z.object({
  type: z.nativeEnum(InteractionType),
  note: z.string().optional(),
  interactionDate: z.string().optional(),
})

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { type, note, interactionDate } = parsed.data
  const date = interactionDate ? new Date(interactionDate) : new Date()

  const [interaction] = await prisma.$transaction([
    prisma.interaction.create({
      data: {
        opportunityId: params.id,
        authorId: session.user.id!,
        type,
        note,
        interactionDate: date,
      },
      include: { author: { select: { id: true, name: true, email: true } } },
    }),
    prisma.opportunity.update({
      where: { id: params.id },
      data: { lastInteractionAt: new Date() },
    }),
  ])

  return NextResponse.json(interaction, { status: 201 })
}
