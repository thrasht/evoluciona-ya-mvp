import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

// Cached on globalThis so dev hot reloads don't open a new pool each time.
const globalForDb = globalThis as unknown as { botDb?: Db };

export function getDb(): Db {
  if (!globalForDb.botDb) {
    // prepare: false is required by Neon's pooled (transaction-mode) URL and harmless locally.
    const sql = postgres(getEnv().DATABASE_URL, { prepare: false });
    globalForDb.botDb = drizzle(sql, { schema });
  }
  return globalForDb.botDb;
}
