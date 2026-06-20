import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { email: true, role: true, isVerified: true, isBanned: true } });
  console.log("Latest users:", users);
}
main();
