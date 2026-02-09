
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Product'
    `;
    console.log('Columns in Product table:', JSON.stringify(tableInfo, null, 2));
  } catch (error) {
    console.error('Error checking schema:', error);
  } finally {
    await prisma.$disconnect()
  }
}

main()
