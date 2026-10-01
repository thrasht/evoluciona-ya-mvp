import { after, type NextRequest } from "next/server";
import { processIncoming } from "@/lib/bot/process-incoming";
import { debug, trace } from "@/lib/bot/log";
import { getEnv } from "@/lib/env";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Meta webhook verification handshake. */
export async function GET(req: NextRequest) {
  const step = trace("GET");
  step("controller: webhook verification request");
  const p = req.nextUrl.searchParams;
  const tokenMatches = p.get("hub.verify_token") === getEnv().WHATSAPP_VERIFY_TOKEN;
  debug("GET verification", { mode: p.get("hub.mode"), tokenMatches, challenge: p.get("hub.challenge") });
  if (p.get("hub.mode") === "subscribe" && tokenMatches) {
    step("controller: verified, returning challenge (200)");
    return new Response(p.get("hub.challenge") ?? "", { status: 200 });
  }
  console.warn("[bot] webhook verification rejected (wrong mode or verify token)");
  return new Response("Forbidden", { status: 403 });
}

let warnedUnsigned = false;

/** Thin controller: parse, acknowledge fast, process after the response. */
export async function POST(req: NextRequest) {
  const step = trace("POST");
  step("controller: webhook POST received");

  // Raw body kept as text: phase 2 verifies X-Hub-Signature-256 over these exact bytes.
  const rawBody = await req.text();
  debug(`POST received (signature header: ${req.headers.has("x-hub-signature-256") ? "yes" : "no"})`, rawBody);

  // TODO(phase 2): reject with 401 unless verifySignature(rawBody, header, WHATSAPP_APP_SECRET).
  if (!warnedUnsigned) {
    console.warn("[bot] webhook signature check is disabled (phase 2 pending)");
    warnedUnsigned = true;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    console.error("[bot] failed to parse incoming webhook payload");
    return new Response("Bad Request", { status: 400 });
  }

  step("controller: JSON parsed, returning 200 and handing off to business logic");
  after(() => processIncoming(payload));
  return new Response("OK", { status: 200 });
}
