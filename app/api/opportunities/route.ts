import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Stage, LeadSource } from "@prisma/client"

const createSchema = z.object({
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  ownerId: z.string(),
  leadSource: z.nativeEnum(LeadSource).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const stage = searchParams.get("stage") as Stage | null
  const ownerId = searchParams.get("owner_id")
  const leadSource = searchParams.get("lead_source") as LeadSource | null

  const where = {
    ...(stage && { stage }),
    ...(ownerId && { ownerId }),
    ...(leadSource && { leadSource }),
  }

  const opportunities = await prisma.opportunity.findMany({
    where,
    include: {
      company: true,
      owner: { select: { id: true, name: true, email: true } },
      qualification: true,
      _count: { select: { interactions: true } },
    },
    orderBy: { lastInteractionAt: "desc" },
  })

  return NextResponse.json(opportunities)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { companyId, companyName, ownerId, leadSource } = parsed.data

  let resolvedCompanyId = companyId
  if (!resolvedCompanyId && companyName) {
    const company = await prisma.company.create({ data: { name: companyName } })
    resolvedCompanyId = company.id
  }
  if (!resolvedCompanyId) {
    return NextResponse.json({ error: "Se requiere empresa" }, { status: 400 })
  }

  const company = await prisma.company.findUnique({ where: { id: resolvedCompanyId } })
  if (!company) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 })

  const opportunity = await prisma.opportunity.create({
    data: {
      title: company.name,
      companyId: resolvedCompanyId,
      ownerId,
      stage: "lead",
      leadSource,
      lastInteractionAt: new Date(),
    },
    include: {
      company: true,
      owner: { select: { id: true, name: true, email: true } },
      qualification: true,
    },
  })

  return NextResponse.json(opportunity, { status: 201 })
}
