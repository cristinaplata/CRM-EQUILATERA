import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q")

  const companies = await prisma.company.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : undefined,
    include: {
      _count: { select: { opportunities: true } },
      opportunities: {
        where: { stage: { notIn: ["won", "lost"] } },
        select: { id: true, stage: true, lastInteractionAt: true, owner: { select: { id: true, name: true } } },
        orderBy: { lastInteractionAt: "desc" },
        take: 1,
      },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(companies)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = z.object({ name: z.string().min(1) }).safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const company = await prisma.company.create({ data: { name: parsed.data.name } })
  return NextResponse.json(company, { status: 201 })
}
