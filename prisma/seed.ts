import { PrismaClient, Role } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Seed users — run once at go-live
  const users = [
    { name: "Diana Soto", email: "diana@equilatera.com.co", role: Role.seller },
    { name: "Monica Cortes", email: "monica@equilatera.com.co", role: Role.seller },
    { name: "Cristina Plata", email: "cristina@equilatera.com.co", role: Role.director },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: u,
    })
  }

  console.log("✓ Seed completado — 4 usuarias listas")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
