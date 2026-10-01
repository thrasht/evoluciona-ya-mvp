import { getEnv } from "@/lib/env";
import { debug } from "../log";

/**
 * Mexican numbers may arrive in webhooks as 521 + 10 digits, but the Cloud API
 * expects 52 + 10 digits when sending (error 131030 otherwise).
 */
export function normalizeRecipient(phone: string): string {
  return /^521\d{10}$/.test(phone) ? `52${phone.slice(3)}` : phone;
}

type CloudApiError = {
  message?: string;
  type?: string;
  code?: number;
  error_subcode?: number;
  error_data?: { details?: string };
  fbtrace_id?: string;
};

/** Likely causes for the errors we hit most while on the test number. */
const ERROR_HINTS: Record<number, string> = {
  190: "access token expired or invalid; generate a new one in Meta → API Setup",
  131030: "recipient is not in the test number's allowed list (Meta → API Setup → To)",
  131047: "more than 24h since the user's last message; only templates can be sent",
  100: "invalid parameter; check WHATSAPP_PHONE_NUMBER_ID, API version and the request body",
  10: "permission denied; the token lacks whatsapp_business_messaging for this number",
  131056: "too many messages to this user in a short time (rate limit)",
};

function maskToken(token: string): string {
  return `${token.slice(0, 4)}…${token.slice(-4)} (${token.length} chars)`;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/** Generic Cloud API send. Throws on non-2xx; returns the outbound message id. */
export async function send(payload: Record<string, unknown>): Promise<string | null> {
  const env = getEnv();
  const url = `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const requestBody = { messaging_product: "whatsapp", ...payload };

  debug("Cloud API → request", {
    method: "POST",
    url,
    headers: { Authorization: `Bearer ${maskToken(env.WHATSAPP_ACCESS_TOKEN)}`, "Content-Type": "application/json" },
    body: requestBody,
  });

  const started = Date.now();
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
  } catch (error) {
    console.error(`[bot] Cloud API network error after ${Date.now() - started}ms (no response from Meta)`, error);
    throw error;
  }

  const raw = await res.text();
  const data = parseJson(raw);
  debug(`Cloud API ← response ${res.status} ${res.statusText} in ${Date.now() - started}ms`, data);

  if (!res.ok) {
    const err = (data as { error?: CloudApiError })?.error ?? {};
    const hint = err.code !== undefined ? ERROR_HINTS[err.code] : undefined;
    console.error(
      [
        `[bot] Cloud API error ${res.status}`,
        `  code: ${err.code ?? "?"}${err.error_subcode ? ` (subcode ${err.error_subcode})` : ""} type: ${err.type ?? "?"}`,
        `  message: ${err.message ?? raw}`,
        err.error_data?.details ? `  details: ${err.error_data.details}` : null,
        hint ? `  hint: ${hint}` : null,
        err.fbtrace_id ? `  fbtrace_id: ${err.fbtrace_id}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    );
    throw new Error(`Cloud API ${res.status} code=${err.code ?? "?"}: ${err.message ?? raw}`);
  }

  const id = (data as { messages?: { id?: string }[] })?.messages?.[0]?.id ?? null;
  if (!id) console.warn("[bot] Cloud API returned 2xx without a message id", data);
  return id;
}

/** Replies to the sender. On Meta's test number, `to` must be in the allowed recipients list. */
export async function sendText(to: string, text: string): Promise<string | null> {
  const recipient = normalizeRecipient(to);
  debug(`Cloud API sendText from=${to} → to=${recipient}${recipient !== to ? " (normalized 521→52)" : ""}`);
  return send({ to: recipient, type: "text", text: { preview_url: false, body: text } });
}
