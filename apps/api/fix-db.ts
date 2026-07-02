import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.certificateTemplate.updateMany({
    where: {
      logoUrl: {
        contains: "amazonaws.com"
      }
    },
    data: {
      logoUrl: "https://cwayacademy.netlify.app/logo.png?v=3"
    }
  });
  console.log("Fixed existing certificate template logo URLs.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
