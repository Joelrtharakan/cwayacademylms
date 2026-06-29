import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const registrarHash = await bcrypt.hash("Registrar123!", 12);

  const registrar = await prisma.user.upsert({
    where: { email: 'registrar@cwayacademy.com' },
    update: {
      role: 'REGISTRAR',
      passwordHash: registrarHash
    },
    create: {
      name: 'Main Registrar',
      email: 'registrar@cwayacademy.com',
      passwordHash: registrarHash,
      role: 'REGISTRAR',
      isVerified: true,
    }
  });

  console.log('Registrar created/updated:', registrar.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
