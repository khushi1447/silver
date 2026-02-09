
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const product = await prisma.product.findUnique({ where: { id: 51 } })
  console.log('Product 51:', product)
  await prisma.$disconnect()
}
main()
