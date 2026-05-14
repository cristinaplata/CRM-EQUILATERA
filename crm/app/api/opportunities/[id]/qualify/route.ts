import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const schema = z.object({
  hasBudget: z.boolean().nullable().optional(),
  hasRealPain: z.boolean().nullable().optional(),
  decisionMaker: z.string().nullable().optional(),
  hasUrgency: z.boolean().nullable().optional(),
  qualificationNotes: z.string().optional(),
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

  const data = parsed.data

  // Require at least 2 answered questions
  const answered = [data.hasBudget, data.hasRealPain, data.decisionMaker, data.hasUrgency]
    .filter((v) => v !== null && v !== undefined).length
  if (answered < 2) {
    return NextResponse.json({ error: "Se requieren al menos 2 preguntas respondidas" }, { status: 400 })
  }

  const [qualification, opportunity] = await prisma.$transaction([
    prisma.qualification.upsert({
      where: { opportunityId: params.id },
      create: { opportunityId: params.id, ...data },
      update: data,
    }),
    prisma.opportunity.update({
      where: { id: params.id },
      data: { stage: "qualification", lastInteractionAt: new Date() },
      include: {
        company: true,
        owner: { select: { id: true, name: true, email: true } },
        qualification: true,
      },
    }),
  ])

  return NextResponse.json({ qualification, opportunity }, { status: 201 })
}
