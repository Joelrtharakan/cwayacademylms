import { defineConfig } from "prisma/config";
import * as fs from "fs";
import * as path from "path";

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  try {
    // Try to read .env from db package folder, or traverse up to root
    const rootEnvPath = path.resolve(process.cwd(), "../../.env");
    const localEnvPath = path.resolve(process.cwd(), ".env");
    const envPath = fs.existsSync(localEnvPath) ? localEnvPath : rootEnvPath;

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/DATABASE_URL=["']?([^"\n\r]+)["']?/);
      if (match) {
        databaseUrl = match[1];
      }
    }
  } catch (e) {
    console.error("Failed to read .env file", e);
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl || "postgresql://cway:cwaydev@localhost:5432/cway_lms?sslmode=disable",
  },
});
