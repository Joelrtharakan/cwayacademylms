const { PrismaClient } = require('./packages/db/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { role: 'INSTRUCTOR' },
    select: { email: true, name: true }
  });
  console.log("Instructors in DB:", users);
}

main().catch(console.error).finally(() => prisma.$disconnect());
