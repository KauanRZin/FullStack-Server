const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
  const adminEmail = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const adminPhone = process.env.SUPER_ADMIN_PHONE || '00000000000';
  const passwordHash = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Super Admin',
      email: adminEmail,
      password: passwordHash,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      phone: adminPhone
    }
  });

  console.log('Super admin criado ou já existente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });