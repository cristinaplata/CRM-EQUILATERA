import { PrismaClient, Role } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Seed users — run once at go-live
  const users = [
    { name: "Socia 1", email: "socia1@equilatera.com.co", role: Role.seller },
    { name: "Socia 2", email: "socia2@equilatera.com.co", role: Role.seller },
    { name: "Socia 3", email: "socia3@equilatera.com.co", role: Role.seller },
    { name: "Directora", email: "directora@equilatera.com.co", role: Role.director },
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
