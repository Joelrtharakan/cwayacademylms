import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const certs = await prisma.certificate.findMany({ include: { course: { include: { program: true } } } });
  console.log(JSON.stringify(certs, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
