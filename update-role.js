const { PrismaClient } = require('./packages/db/node_modules/@prisma/client');
require('dotenv').config({ path: './.env' });
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: 'joshuartharakan98@gmail.com' },
    data: { role: 'INSTRUCTOR' }
  });
  console.log("Updated role to INSTRUCTOR");
}

main().finally(() => prisma.$disconnect());
