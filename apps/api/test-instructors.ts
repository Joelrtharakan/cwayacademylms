import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { role: "INSTRUCTOR" }, select: { email: true, role: true } });
  console.log("Instructors:", users);
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true, role: true } });
  console.log("Admins:", admins);
}
main();
