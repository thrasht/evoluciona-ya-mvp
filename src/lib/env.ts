import { z } from "zod";

/**
 * Server-only environment variables for the WhatsApp bot.
 * Validated on first use, not at import, so `next build` works on machines
 * (and Vercel Preview) without these variables. Add a variable here only in
 * the phase that starts using it.
 */
const schema = z.object({
  WHATSAPP_ACCESS_TOKEN: z.string().min(1),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1),
  WHATSAPP_VERIFY_TOKEN: z.string().min(1),
  WHATSAPP_API_VERSION: z.string().regex(/^v\d+\.\d+$/, "expected e.g. v23.0"),
  DATABASE_URL: z.string().url(),
  OPENAI_API_KEY: z.string().min(1),
  LLM_MODEL: z.string().min(1),
});

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`[env] Invalid or missing environment variables:\n${issues}`);
  }
  cached = result.data;
  return cached;
}
