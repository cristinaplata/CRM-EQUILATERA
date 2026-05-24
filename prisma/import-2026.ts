import { PrismaClient, Stage, LeadSource } from "@prisma/client"

const prisma = new PrismaClient()

// Mapeo de nombres a emails
const OWNER_MAP: Record<string, string> = {
  "cristina plata": "cristina@equilatera.com.co",
  "monica cortes": "monica@equilatera.com.co",
  "diana soto": "diana@equilatera.com.co",
  "diana soto ramírez": "diana@equilatera.com.co",
  "diana soto ramirez": "diana@equilatera.com.co",
}

function resolveOwnerEmail(responsable: string): string {
  if (!responsable) return "cristina@equilatera.com.co"
  // Si hay múltiples responsables, tomar el primero
  const first = responsable.split(/[\/,]/)[0].trim().toLowerCase()
  return OWNER_MAP[first] ?? "cristina@equilatera.com.co"
}

function resolveStage(estado: string): Stage {
  const e = estado.trim().toUpperCase()
  if (e === "VENDIDA") return "won"
  if (e === "RECHAZADA") return "lost"
  if (e === "ENVIADA") return "sent"
  return "lead"
}

const DATA = [
  { company: "Green Móvil", tema: "Propuesta DEI / Actualización conductores", responsable: "Cristina Plata / Monica Cortes", estado: "VENDIDA", obs: "Visita presencial 16 ene. Presentación virtual propuesta DEI 19 ene." },
  { company: "SUNSHINE 2026", tema: "Análisis de Contexto y Ajuste de Enfoque DEI", responsable: "Monica Cortes", estado: "VENDIDA", obs: "" },
  { company: "MSD", tema: "", responsable: "Cristina Plata", estado: "VENDIDA", obs: "Carpeta creada. Sin propuesta accesible." },
  { company: "Bogotá Móvil", tema: "Formulación Directriz Institucional EDI", responsable: "Monica Cortes", estado: "VENDIDA", obs: "Valor final depende de nivel de ajuste y profundidad." },
  { company: "SIERRACOL", tema: "Tres formaciones", responsable: "Monica Cortes", estado: "VENDIDA", obs: "" },
  { company: "Gonvarri", tema: "", responsable: "Cristina Plata", estado: "VENDIDA", obs: "Ajustar la propuesta" },
  { company: "Rymel", tema: "", responsable: "Cristina Plata", estado: "VENDIDA", obs: "" },
  { company: "Comfama", tema: "", responsable: "Cristina Plata", estado: "VENDIDA", obs: "" },
  { company: "SIERRACOL", tema: "Talleres", responsable: "Diana Soto / Monica Cortes", estado: "VENDIDA", obs: "" },
  { company: "Win Sports", tema: "Taller presencial ASL", responsable: "Cristina Plata", estado: "VENDIDA", obs: "" },
  { company: "ECOPETROL", tema: "Pedagogías DEI", responsable: "Monica Cortes / Diana Soto", estado: "VENDIDA", obs: "Enviada a operadores logísticos" },
  { company: "WINS", tema: "Apoyo técnico investigación buenas prácticas mujeres sector seguridad", responsable: "Diana Soto / Monica", estado: "VENDIDA", obs: "" },
  { company: "Wins Sports", tema: "ASL formación", responsable: "Cristina Plata", estado: "VENDIDA", obs: "" },
  // ENVIADAS (activas)
  { company: "Grupo Supermotos", tema: "Inclusión Laboral", responsable: "Diana Soto", estado: "Enviada", obs: "Responden después de semana santa" },
  { company: "Sistema Ferreo Intecsa", tema: "Modelo social ferreo", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "Comfama", tema: "Propuesta empresas", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "CC El Eden", tema: "Pulso organizacional", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "Hero Motos", tema: "Plan DEI y Discapacidades", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "El Espectador", tema: "Ruta prevención y atención ASL", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "Virutex", tema: "Formaciones DEI", responsable: "Diana Soto", estado: "Enviada", obs: "" },
  { company: "Lemco", tema: "Ruta discapacidades", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "Paz del Rio", tema: "Formaciones Sesgos", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "Howden", tema: "Sensibilización Discapacidad", responsable: "Diana Soto / Monica", estado: "Enviada", obs: "" },
  { company: "Bogotá Movil", tema: "Sensibilización Discapacidad", responsable: "Diana Soto / Monica", estado: "Enviada", obs: "" },
  { company: "Comfenalco", tema: "ISO 30415", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "CC El Eden", tema: "Pulso + plan de acción + asesorías y formaciones DEI", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "Gallagher", tema: "Discapacidades", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "POT Cundinamarca", tema: "POT Gacheta y Tena", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "multiplika", tema: "Formación DEI", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  { company: "Abbvie", tema: "Formación discapacidades", responsable: "Cristina Plata", estado: "Enviada", obs: "" },
  // RECHAZADAS
  { company: "INCAUCA", tema: "Asesoría técnica ISO 30415", responsable: "Diana Soto", estado: "Rechazada", obs: "Múltiples versiones. VF enviada ~24 feb." },
  { company: "Ecolab", tema: "", responsable: "Cristina Plata", estado: "Rechazada", obs: "Nunca respondieron" },
  { company: "Repremundo", tema: "", responsable: "Cristina Plata", estado: "Rechazada", obs: "Dos contactos, último mail 6 feb - 12 marzo" },
  { company: "CORRECOL", tema: "", responsable: "Monica Cortes", estado: "Rechazada", obs: "" },
  { company: "Oleoducto Colombia", tema: "Estrategia DEI sostenible – ISO 30415", responsable: "Cristina Plata", estado: "Rechazada", obs: "Reunión exploratoria 3 feb." },
  { company: "English School", tema: "", responsable: "Cristina Plata", estado: "Rechazada", obs: "" },
  { company: "Cens", tema: "", responsable: "Cristina Plata", estado: "Rechazada", obs: "" },
  { company: "Alianza", tema: "", responsable: "Diana Soto", estado: "Rechazada", obs: "" },
  { company: "LA TOUR", tema: "", responsable: "Cristina Plata", estado: "Rechazada", obs: "" },
  { company: "SIERRACOL", tema: "Seguridad psicológica y equidad de voz", responsable: "Diana Soto / Monica Cortes", estado: "Rechazada", obs: "" },
  { company: "Claro", tema: "VALORA", responsable: "Diana Soto", estado: "Rechazada", obs: "" },
  { company: "SERINTEC", tema: "Taller DEI", responsable: "Cristina Plata", estado: "Rechazada", obs: "No hay respuesta" },
  { company: "CFA", tema: "", responsable: "Cristina Plata", estado: "Rechazada", obs: "Responden después de semana santa" },
  { company: "Pei Asset Management", tema: "", responsable: "Cristina Plata", estado: "Rechazada", obs: "No han respondido" },
  { company: "Expreso Viajes", tema: "", responsable: "Cristina Plata", estado: "Rechazada", obs: "No han respondido" },
  { company: "Universidad UDCA", tema: "Reestructuración TH", responsable: "Diana Soto", estado: "Rechazada", obs: "Se fueron por Change Americas" },
  { company: "BBVA", tema: "Confirming Social", responsable: "Diana Soto / Monica Cortes", estado: "Rechazada", obs: "Se vuelve a llamar en mayo" },
  { company: "toks", tema: "VALORA", responsable: "Diana Soto", estado: "Rechazada", obs: "" },
  { company: "El Espectador", tema: "Ruta prevención ASL", responsable: "Cristina Plata", estado: "Rechazada", obs: "" },
  { company: "Gallagher", tema: "Plan DEI", responsable: "Cristina Plata", estado: "Rechazada", obs: "" },
  { company: "FABELEC", tema: "Sensibilización discapacidad", responsable: "Diana Soto", estado: "Rechazada", obs: "" },
  { company: "Coomeva", tema: "Política de género", responsable: "Cristina Plata", estado: "Rechazada", obs: "" },
]

async function main() {
  console.log("Iniciando importación de propuestas 2026...")

  // Obtener todos los usuarios
  const users = await prisma.user.findMany()
  const userByEmail = Object.fromEntries(users.map((u) => [u.email, u]))

  let created = 0
  let skipped = 0

  for (const row of DATA) {
    const ownerEmail = resolveOwnerEmail(row.responsable)
    const owner = userByEmail[ownerEmail]
    if (!owner) {
      console.log(`⚠ Usuario no encontrado: ${ownerEmail} — saltando ${row.company}`)
      skipped++
      continue
    }

    const stage = resolveStage(row.estado)
    const title = row.tema || row.company

    // Crear o encontrar empresa
    let company = await prisma.company.findFirst({ where: { name: { equals: row.company, mode: "insensitive" } } })
    if (!company) {
      company = await prisma.company.create({ data: { name: row.company } })
    }

    await prisma.opportunity.create({
      data: {
        title,
        companyId: company.id,
        ownerId: owner.id,
        stage,
        leadSource: "other" as LeadSource,
        lastInteractionAt: new Date(),
        ...(row.obs && {
          interactions: {
            create: {
              type: "note",
              notes: row.obs,
              userId: owner.id,
            }
          }
        })
      }
    })

    console.log(`✓ ${row.company} — ${stage}`)
    created++
  }

  console.log(`\n✅ Importación completa: ${created} oportunidades creadas, ${skipped} saltadas`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
