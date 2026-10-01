import { getEnv } from "@/lib/env";
import { debug } from "../log";

/**
 * Mexican numbers may arrive in webhooks as 521 + 10 digits, but the Cloud API
 * expects 52 + 10 digits when sending (error 131030 otherwise).
 */
export function normalizeRecipient(phone: string): string {
  return /^521\d{10}$/.test(phone) ? `52${phone.slice(3)}` : phone;
}

/** Generic Cloud API send. Throws on non-2xx; returns the outbound message id. */
export async function send(payload: Record<string, unknown>): Promise<string | null> {
  const env = getEnv();
  const requestBody = { messaging_product: "whatsapp", ...payload };
  debug("Cloud API request", requestBody);
  const res = await fetch(
    `https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    },
  );
  const body = await res.text();
  debug(`Cloud API response ${res.status}`, body);
  if (!res.ok) {
    throw new Error(`Cloud API ${res.status}: ${body}`);
  }
  const data = JSON.parse(body) as { messages?: { id?: string }[] };
  return data.messages?.[0]?.id ?? null;
}

export async function sendText(to: string, text: string): Promise<string | null> {
  // While on Meta's test number, only allow-listed recipients work.
  const recipient = getEnv().WHATSAPP_TEST_RECIPIENT ?? normalizeRecipient(to);
  return send({ to: recipient, type: "text", text: { preview_url: false, body: text } });
}
