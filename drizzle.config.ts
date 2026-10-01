import { defineConfig } from "drizzle-kit";

// Migrations use the direct (unpooled) connection; the app uses DATABASE_URL.
const url = process.env.DATABASE_URL_UNPOOLED;
if (!url) throw new Error("DATABASE_URL_UNPOOLED is not set (see .env.example)");

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
