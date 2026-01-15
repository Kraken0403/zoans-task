import 'dotenv/config'
import * as bcrypt from 'bcrypt'
import { PrismaClient, Role } from '@prisma/client'


const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('Password@123', 10)

  const users = [
    { name: 'Admin User', email: 'admin@test.com', role: Role.ADMIN },
    { name: 'Manager User', email: 'manager@test.com', role: Role.MANAGER },
    { name: 'Employee User', email: 'employee@test.com', role: Role.EMPLOYEE },
  ]

  for (const user of users) {
    const exists = await prisma.user.findUnique({ where: { email: user.email } })
    if (exists) {
      console.log(`⏩ Skipping ${user.email}`)
      continue
    }

    await prisma.user.create({
      data: { ...user, password, isActive: true },
    })

    console.log(`✅ Created ${user.role}: ${user.email}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
