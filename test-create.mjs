
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const category = await prisma.category.findFirst();
    if (!category) {
      console.log('No category found. Please create one first.');
      return;
    }

    const newProduct = await prisma.product.create({
      data: {
        name: "Test Ring " + new Date().getTime(),
        description: "Test description",
        price: 99.99,
        stock: 10,
        categoryId: category.id,
        availableRingSizes: ["7", "8", "9"]
      },
      include: {
        images: true
      }
    })
    console.log('Product created successfully via script:', newProduct);
  } catch (error) {
    console.error('Error creating product via script:', error);
  } finally {
    await prisma.$disconnect()
  }
}

main()
