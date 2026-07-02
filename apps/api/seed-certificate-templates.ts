import { PrismaClient } from "@prisma/client";
import { COURSE_CERTIFICATE_HTML, PROGRAM_CERTIFICATE_HTML } from "./src/services/certificate.service";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Certificate Templates...");

  // Seed Course Template
  await prisma.certificateTemplate.create({
    data: {
      name: "Default Course Certificate",
      type: "COURSE",
      htmlTemplate: COURSE_CERTIFICATE_HTML,
      isDefault: true,
      logoUrl: "https://cwayacademy.netlify.app/logo.png?v=3"
    }
  });

  // Seed Program Template
  await prisma.certificateTemplate.create({
    data: {
      name: "Default Program Certificate",
      type: "PROGRAM",
      htmlTemplate: PROGRAM_CERTIFICATE_HTML,
      isDefault: true,
      logoUrl: "https://cwayacademy.netlify.app/logo.png?v=3"
    }
  });

  console.log("Templates seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
