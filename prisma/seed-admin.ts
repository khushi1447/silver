/**
 * Super Admin Seeder
 * Creates/updates the super admin user: info@techtrio.net / Tech#Trio
 * Run: npx tsx prisma/seed-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'info@techtrio.net';
  const password = 'Tech#Trio';
  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      isAdmin: true,
      firstName: 'TechTrio',
      lastName: 'Admin',
    },
    create: {
      email,
      password: hashedPassword,
      firstName: 'TechTrio',
      lastName: 'Admin',
      isAdmin: true,
      phone: '+919512765399',
    },
  });

  console.log(`✅ Super admin upserted: ${admin.email} (id: ${admin.id})`);
  console.log(`   Email   : ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   isAdmin : ${admin.isAdmin}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeder failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
