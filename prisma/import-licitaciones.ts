// @ts-nocheck
/**
 * Import script for _2026_Licitaciones.xlsx
 *
 * Sheets mapped to LicitacionStage:
 *   "Licitaciones presentadas"      → evaluating / preparing / sent (by "enviada" column)
 *   "revisadas y No presentadas"    → evaluating
 *   "licitaciones No ganadas"       → lost
 *   "Licitaciones SI ganadas"       → won
 *   "Estudios de mercado"           → sent
 *
 * Run from repo root:
 *   npx tsx prisma/import-licitaciones.ts
 */

import { PrismaClient, LicitacionStage } from "@prisma/client"

const prisma = new PrismaClient()

// Default owner for licitaciones (Cristina leads this area)
const DEFAULT_OWNER_EMAIL = "cristina@equilatera.com.co"

function parseBoolean(val: unknown): boolean | undefined {
  if (val == null) return undefined
  const s = String(val).trim().toLowerCase()
  if (["si", "sí", "yes", "s", "true", "1"].includes(s)) return true
  if (["no", "false", "0"].includes(s)) return false
  return undefined
}

function parseDate(val: unknown): Date | undefined {
  if (!val) return undefined
  if (val instanceof Date) return val
  const s = String(val).trim()
  if (!s) return undefined
  const d = new Date(s)
  return isNaN(d.getTime()) ? undefined : d
}

function clean(val: unknown): string | undefined {
  if (val == null) return undefined
  const s = String(val).trim()
  return s || undefined
}

// ─── Data extracted from _2026_Licitaciones.xlsx ────────────────────────────

interface Row {
  tema: string
  organizacion?: string
  fechaApertura?: Date
  fechaCierre?: Date
  duracion?: string
  eqSola?: boolean
  aliados?: string
  tienePrecio?: boolean
  precio?: string
  factible?: boolean
  link?: string
  comentarios?: string
  feedback?: string
  stage: LicitacionStage
}

const DATA: Row[] = [
  // ══════════════════════════════════════════════════════════════════════════
  // SHEET: "Licitaciones presentadas" → currently active / in progress
  // ══════════════════════════════════════════════════════════════════════════
  {
    tema: "Cámara de Comercio de Bogotá – empleabilidad inclusiva",
    stage: "evaluating",
  },
  {
    tema: "Cámara de Comercio de Bogotá – emprendimiento inclusivo",
    stage: "evaluating",
  },
  {
    tema: "Actualización de la guía de género del Ministerio de Transporte",
    organizacion: "GIZ",
    fechaCierre: new Date("2026-05-05"),
    stage: "preparing",
  },
  {
    tema: "France Expertise",
    fechaCierre: new Date("2026-05-18"),
    tienePrecio: true,
    precio: "20.000 euros",
    link: "https://drive.google.com/drive/folders/1LjBqkZWH4f1_S1D6KnDzx-vnjN15LR3m",
    stage: "preparing",
  },
  {
    tema: "C40 – GIZ (género y movilidad sostenible)",
    organizacion: "GIZ",
    fechaCierre: new Date("2026-05-25"),
    duracion: "1 año",
    eqSola: true,
    aliados: "No necesita aliados",
    tienePrecio: true,
    precio: "45.000 euros",
    factible: true,
    link: "https://drive.google.com/drive/folders/14aZw2G-U_JBOmr_3t7jepvwf7T_8WzqH",
    stage: "preparing",
  },
  {
    tema: "GIZ / Género y transporte",
    organizacion: "GIZ",
    fechaCierre: new Date("2026-05-08"),
    duracion: "6 meses",
    eqSola: true,
    aliados: "No necesita aliados",
    tienePrecio: false,
    precio: "85 millones con IVA incluido",
    factible: true,
    link: "https://drive.google.com/drive/folders/1-ieKWjmNBvRUiCi5-JrWmGP6i8VbJARa",
    stage: "preparing",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET: "revisadas y No presentadas" → reviewed, decided not to submit
  // ══════════════════════════════════════════════════════════════════════════
  {
    tema: "Programa Regional Inclusive Societies LAC",
    organizacion: "EU / CAINCO",
    fechaApertura: new Date("2026-01-19"),
    fechaCierre: new Date("2026-04-08"),
    duracion: "18-24 meses",
    eqSola: false,
    aliados: "Corpra Mujer",
    tienePrecio: true,
    precio: "máx. 250.000 euros",
    factible: true,
    link: "https://eulacsocialaccelerator.cainco.org.bo/publico/convocatoria?codigo_referencia=1/2026",
    comentarios: "Va con Corpra Mujer, ajustando la propuesta técnica que presentamos a ONU Mujeres",
    stage: "evaluating",
  },
  {
    tema: "Proyecto LIBRES – rutas de atención y duplas territoriales (7 municipios Cauca y Valle)",
    organizacion: "France Expertise",
    fechaApertura: new Date("2026-03-06"),
    fechaCierre: new Date("2026-04-09"),
    duracion: "9 meses",
    eqSola: false,
    aliados: "Corprogreso",
    tienePrecio: true,
    precio: "900 millones sin IVA",
    factible: true,
    link: "https://drive.google.com/drive/folders/16dN9OpdGL9IGLYB_8YlTFhZ6buL6Z6by",
    stage: "evaluating",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET: "licitaciones No ganadas" → lost
  // ══════════════════════════════════════════════════════════════════════════
  {
    tema: "Análisis participación mujeres en cadena de suministro de pesca deportiva (GEM PACA)",
    organizacion: "WWF Guatemala",
    fechaCierre: new Date("2026-01-04"),
    duracion: "40 días",
    eqSola: true,
    aliados: "No necesita aliados",
    tienePrecio: false,
    factible: true,
    feedback: "No notificaron el motivo; se solicitó retroalimentación",
    stage: "lost",
  },
  {
    tema: "Sistematización acciones de respuesta en protección – actores comunitarios Arauca",
    organizacion: "OXFAM",
    fechaCierre: new Date("2026-01-26"),
    duracion: "34 días",
    eqSola: true,
    aliados: "No necesita aliados",
    tienePrecio: false,
    link: "https://drive.google.com/drive/folders/11Riu1Dek11-_l_pEGcTjDQiAD2AdZ27a",
    stage: "lost",
  },
  {
    tema: "Evaluación Final – proyecto Fortalecer respuesta institucional y comunitaria a VBG en Colombia",
    organizacion: "SISMA MUJER",
    fechaCierre: new Date("2026-01-30"),
    duracion: "10 semanas",
    eqSola: true,
    aliados: "No necesita aliados",
    tienePrecio: false,
    link: "https://drive.google.com/drive/folders/1TFc3539QhWdLv2_FneUeCVrVq6x8uq14",
    stage: "lost",
  },
  {
    tema: "Estudio regional percepciones e imaginarios sobre mujeres defensoras de territorio y trabajo de cuidados (LAC)",
    organizacion: "OXFAM",
    fechaCierre: new Date("2026-03-04"),
    duracion: "10 semanas",
    eqSola: true,
    factible: true,
    stage: "lost",
  },
  {
    tema: "Fundación Corona – bonos de vivienda",
    organizacion: "Fundación Corona",
    fechaCierre: new Date("2026-03-12"),
    duracion: "10 meses",
    eqSola: false,
    aliados: "Relevant",
    tienePrecio: true,
    precio: "130 dólares",
    factible: true,
    stage: "lost",
  },
  {
    tema: "Eurodad – Conectando los puntos: justicia económica, de género y climática",
    organizacion: "Eurodad",
    fechaCierre: new Date("2026-03-26"),
    duracion: "12-18 meses",
    eqSola: false,
    aliados: "OSC aliada",
    tienePrecio: true,
    precio: "entre 5.000 y 60.000 euros",
    factible: true,
    comentarios: "Solicitudes deben presentarse en inglés. Preguntas hasta 26 feb CEST a bdodin@eurodad.org",
    stage: "lost",
  },
  {
    tema: "BID Invest – apoyo técnico implementación operativa WE Finance Code",
    organizacion: "BID Invest",
    fechaApertura: new Date("2026-03-17"),
    fechaCierre: new Date("2026-04-10"),
    duracion: "28 meses",
    eqSola: true,
    tienePrecio: true,
    precio: "140.000 dólares",
    factible: true,
    link: "https://drive.google.com/drive/folders/1iucjTDGQ1PrY69IEGIOLjaz7hMp2Qjje",
    stage: "lost",
  },
  {
    tema: "Fundación ANDI – análisis mercado laboral empleos digitales sector TIC (8 regiones Colombia)",
    organizacion: "Fundación ANDI",
    fechaCierre: new Date("2026-05-04"),
    duracion: "4 meses",
    eqSola: true,
    aliados: "No necesita aliados",
    link: "https://drive.google.com/drive/folders/15nD8-_mKUth0UNRqzXoLrxAFBNt-3jp7",
    stage: "lost",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET: "Licitaciones SI ganadas" → won
  // ══════════════════════════════════════════════════════════════════════════
  {
    tema: "Marco de Gestión Ambiental y Social (MGAS) y Plan de Género e Interseccional – proyecto Eficiencia Energética Ciudades Carbono Neutrales Colombia",
    organizacion: "CAF-BID / GIZ",
    fechaApertura: new Date("2026-03-24"),
    fechaCierre: new Date("2026-04-09"),
    duracion: "6 meses",
    eqSola: true,
    aliados: "No necesita aliados",
    tienePrecio: true,
    precio: "358 millones con IVA incluido",
    factible: true,
    link: "https://drive.google.com/drive/folders/14FNfGwCq_UkuqDFtQB3vxLz-k4SOLYNP",
    comentarios: "Presentada el 12 de marzo",
    stage: "won",
  },

  // ══════════════════════════════════════════════════════════════════════════
  // SHEET: "Estudios de mercado" → sent (enviadas el 1 de abril)
  // ══════════════════════════════════════════════════════════════════════════
  {
    tema: "Metro de Bogotá – estudio de mercado",
    fechaCierre: new Date("2026-04-08"),
    duracion: "8 meses",
    eqSola: true,
    aliados: "No necesita aliados",
    tienePrecio: false,
    factible: true,
    comentarios: "Enviada el 1 de abril",
    stage: "sent",
  },
  {
    tema: "Findeter – estudio de mercado",
    fechaCierre: new Date("2026-04-09"),
    duracion: "28 meses",
    eqSola: true,
    aliados: "No necesita aliados",
    tienePrecio: false,
    factible: true,
    comentarios: "Enviada el 1 de abril",
    stage: "sent",
  },
  {
    tema: "Compensar – estudio de mercado",
    stage: "evaluating",
  },
]

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Iniciando importación de licitaciones 2026...")

  const owner = await prisma.user.findUnique({ where: { email: DEFAULT_OWNER_EMAIL } })
  if (!owner) {
    console.error(`❌ Usuario no encontrado: ${DEFAULT_OWNER_EMAIL}`)
    console.error("Asegúrate de que el usuario exista antes de correr este script.")
    process.exit(1)
  }

  let created = 0

  for (const row of DATA) {
    await prisma.licitacion.create({
      data: {
        tema: row.tema,
        organizacion: row.organizacion ?? null,
        fechaApertura: row.fechaApertura ?? null,
        fechaCierre: row.fechaCierre ?? null,
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
        ownerId: owner.id,
      },
    })
    console.log(`✓ [${row.stage}] ${row.tema.slice(0, 70)}`)
    created++
  }

  console.log(`\n✅ Importación completa: ${created} licitaciones creadas`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
