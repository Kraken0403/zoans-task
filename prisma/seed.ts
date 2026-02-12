import 'dotenv/config'
import * as bcrypt from 'bcrypt'
import { PrismaClient, Role } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const usersFromExcel = [
    { name: 'Omkumar Sanjaykumar Modi', role: Role.ADMIN, username: 'OSM', password: 'Admin@123' },
    { name: 'Sanjaykumar Dineshchandra Modi', role: Role.ADMIN, username: 'SDM', password: 'Admin@123' },
    { name: 'Bhavinaben Sanjaykumar Modi', role: Role.ADMIN, username: 'BSM', password: 'Admin@123' },
    { name: 'Aesha Omkumar Modi', role: Role.ADMIN, username: 'AOM', password: 'Admin@123' },
    { name: 'Administrator', role: Role.ADMIN, username: 'Admin', password: 'Admin@123' },
    { name: 'Manish Mevcha', role: Role.EMPLOYEE, username: 'MPM', password: 'Mpm@123' },
    { name: 'Jadavji Parmar', role: Role.EMPLOYEE, username: 'JPP', password: 'Jpp@123' },
    { name: 'Ravina Dhapa', role: Role.EMPLOYEE, username: 'RVD', password: 'Rvd@123' },
    { name: 'Priyanka Trivedi', role: Role.EMPLOYEE, username: 'PDT', password: 'Pdt@123' },
    { name: 'Ajay Vaghela', role: Role.EMPLOYEE, username: 'AVV', password: 'Avv@123' },
    { name: 'Melvin Michael', role: Role.EMPLOYEE, username: 'MMM', password: 'Mmm@123' },
    { name: 'Ahmedabad Office 01', role: Role.EMPLOYEE, username: 'ABD01', password: 'Abd@123' },
    { name: 'Ahmedabad Office 02', role: Role.EMPLOYEE, username: 'ABD02', password: 'Abd@123' },
  ]

  for (const user of usersFromExcel) {
    const exists = await prisma.user.findUnique({
      where: { username: user.username },
    })

    if (exists) {
      console.log(`⏩ Skipping ${user.username}`)
      continue
    }

    const hashedPassword = await bcrypt.hash(user.password, 10)

    await prisma.user.create({
      data: {
        name: user.name,
        email: `${user.username.toLowerCase()}@system.local`, // dummy email
        username: user.username,
        password: hashedPassword,
        role: user.role,
        isActive: true,
      },
    })

    console.log(`✅ Created ${user.role}: ${user.username}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
