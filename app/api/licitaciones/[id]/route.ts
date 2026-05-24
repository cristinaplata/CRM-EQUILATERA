import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { LicitacionStage } from "@prisma/client"

const updateSchema = z.object({
  tema: z.string().min(1).optional(),
  organizacion: z.string().optional().nullable(),
  fechaApertura: z.string().optional().nullable(),
  fechaCierre: z.string().optional().nullable(),
  duracion: z.string().optional().nullable(),
  eqSola: z.boolean().optional().nullable(),
  aliados: z.string().optional().nullable(),
  tienePrecio: z.boolean().optional().nullable(),
  precio: z.string().optional().nullable(),
  factible: z.boolean().optional().nullable(),
  link: z.string().optional().nullable(),
  comentarios: z.string().optional().nullable(),
  feedback: z.string().optional().nullable(),
  stage: z.nativeEnum(LicitacionStage).optional(),
  ownerId: z.string().optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const licitacion = await prisma.licitacion.findUnique({
    where: { id: params.id },
    include: { owner: { select: { id: true, name: true, email: true } } },
  })
  if (!licitacion) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(licitacion)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { fechaApertura, fechaCierre, ...rest } = parsed.data

  const licitacion = await prisma.licitacion.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(fechaApertura !== undefined && { fechaApertura: fechaApertura ? new Date(fechaApertura) : null }),
      ...(fechaCierre !== undefined && { fechaCierre: fechaCierre ? new Date(fechaCierre) : null }),
    },
    include: { owner: { select: { id: true, name: true, email: true } } },
  })
  return NextResponse.json(licitacion)
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  await prisma.licitacion.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
