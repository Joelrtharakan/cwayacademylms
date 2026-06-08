import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({
    where: { name: { contains: 'joshua' } }
  });

  if (!user) {
    console.log("User 'joshua' not found.");
    return;
  }

  await prisma.user.delete({
    where: { id: user.id }
  });
  console.log(`Successfully deleted user: ${user.name} (${user.email})`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
