
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const cat = await prisma.category.findUnique({ where: { id: 19 } })
  console.log('Category 19:', cat)
  await prisma.$disconnect()
}
main()
