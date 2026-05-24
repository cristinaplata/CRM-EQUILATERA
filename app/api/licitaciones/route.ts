import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { LicitacionStage } from "@prisma/client"

const createSchema = z.object({
  tema: z.string().min(1),
  organizacion: z.string().optional(),
  fechaApertura: z.string().optional(),
  fechaCierre: z.string().optional(),
  duracion: z.string().optional(),
  eqSola: z.boolean().optional(),
  aliados: z.string().optional(),
  tienePrecio: z.boolean().optional(),
  precio: z.string().optional(),
  factible: z.boolean().optional(),
  link: z.string().optional(),
  comentarios: z.string().optional(),
  stage: z.nativeEnum(LicitacionStage).optional(),
  ownerId: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ownerId = searchParams.get("owner_id")
  const stage = searchParams.get("stage") as LicitacionStage | null

  const licitaciones = await prisma.licitacion.findMany({
    where: {
      ...(ownerId && { ownerId }),
      ...(stage && { stage }),
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(licitaciones)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { tema, organizacion, fechaApertura, fechaCierre, duracion, eqSola, aliados,
    tienePrecio, precio, factible, link, comentarios, stage, ownerId } = parsed.data

  const licitacion = await prisma.licitacion.create({
    data: {
      tema,
      organizacion,
      fechaApertura: fechaApertura ? new Date(fechaApertura) : undefined,
      fechaCierre: fechaCierre ? new Date(fechaCierre) : undefined,
      duracion,
      eqSola,
      aliados,
      tienePrecio,
      precio,
      factible,
      link,
      comentarios,
      stage: stage ?? "evaluating",
      ownerId: ownerId ?? session.user.id!,
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  })

  return NextResponse.json(licitacion, { status: 201 })
}
