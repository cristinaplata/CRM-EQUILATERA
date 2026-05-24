import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { LicitacionStage } from "@prisma/client"
import { z } from "zod"

/**
 * POST /api/sync/licitaciones
 *
 * Called by Google Apps Script when a row changes in the licitaciones Sheet.
 * Upserts one or many licitacion records by (tema + organizacion) key.
 *
 * Auth: Bearer token via SYNC_SECRET env var.
 */

const rowSchema = z.object({
  sheetRef: z.string(),            // e.g. "Licitaciones presentadas::5"
  tema: z.string().min(1),
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
  stage: z.nativeEnum(LicitacionStage),
  ownerEmail: z.string().email().optional().nullable(),
})

const bodySchema = z.object({
  rows: z.array(rowSchema),
})

function authorized(req: NextRequest): boolean {
  const secret = process.env.SYNC_SECRET
  if (!secret) return false
  const auth = req.headers.get("authorization") ?? ""
  return auth === `Bearer ${secret}`
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Resolve default owner once
  const defaultOwner = await prisma.user.findUnique({
    where: { email: "cristina@equilatera.com.co" },
    select: { id: true },
  })

  const results: { sheetRef: string; action: "created" | "updated" | "skipped"; id: string }[] = []

  for (const row of parsed.data.rows) {
    // Skip blank tema rows (empty rows from the sheet)
    if (!row.tema.trim()) continue

    // Resolve owner
    let ownerId = defaultOwner?.id
    if (row.ownerEmail) {
      const owner = await prisma.user.findUnique({
        where: { email: row.ownerEmail },
        select: { id: true },
      })
      if (owner) ownerId = owner.id
    }
    if (!ownerId) {
      results.push({ sheetRef: row.sheetRef, action: "skipped", id: "" })
      continue
    }

    const data = {
      tema: row.tema.trim(),
      organizacion: row.organizacion ?? null,
      fechaApertura: row.fechaApertura ? new Date(row.fechaApertura) : null,
      fechaCierre: row.fechaCierre ? new Date(row.fechaCierre) : null,
      duracion: row.duracion ?? null,
      eqSola: row.eqSola ?? null,
      aliados: row.aliados ?? null,
      tienePrecio: row.tienePrecio ?? null,
      precio: row.precio ?? null,
      factible: row.factible ?? null,
      link: row.link ?? null,
      comentarios: row.comentarios ?? null,
      feedback: row.feedback ?? null,
      stage: row.stage,
      ownerId,
    }

    // Upsert by sheetRef (stored in comentarios aux field won't work — use findFirst by sheetRef via a dedicated lookup)
    // We store sheetRef in a virtual match: find by tema + organizacion combo
    const existing = await prisma.licitacion.findFirst({
      where: {
        tema: { equals: row.tema.trim(), mode: "insensitive" },
        organizacion: row.organizacion
          ? { equals: row.organizacion, mode: "insensitive" }
          : null,
      },
      select: { id: true },
    })

    if (existing) {
      await prisma.licitacion.update({ where: { id: existing.id }, data })
      results.push({ sheetRef: row.sheetRef, action: "updated", id: existing.id })
    } else {
      const created = await prisma.licitacion.create({ data })
      results.push({ sheetRef: row.sheetRef, action: "created", id: created.id })
    }
  }

  const summary = {
    total: results.length,
    created: results.filter((r) => r.action === "created").length,
    updated: results.filter((r) => r.action === "updated").length,
    skipped: results.filter((r) => r.action === "skipped").length,
  }

  return NextResponse.json({ ok: true, summary, results })
}
