/**
 * @fileoverview Prisma seed script.
 *
 * Run with: npx prisma db seed
 * Config in package.json: "prisma": { "seed": "ts-node prisma/seed.ts" }
 *
 * Seeds a default SHOP_OWNER and CUSTOMER user for local development.
 * Never run this in production without adjusting credentials.
 */
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('12345678', 10);

  await prisma.user.upsert({
    where: { email: 'shopowner@example.com' },
    update: {},
    create: {
      name: 'Shop Owner 1',
      email: 'shopowner@example.com',
      password: hashedPassword,
      role: UserRole.SHOP_OWNER,
      acc_verified: true,
    },
  });

  // Create a default CUSTOMER user
  await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Customer 1',
      email: 'customer@example.com',
      password: hashedPassword,
      role: UserRole.CUSTOMER,
      acc_verified: true,
    },
  });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
