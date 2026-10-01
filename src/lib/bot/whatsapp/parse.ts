import { z } from "zod";

/*
 * Anti-corruption layer for Meta's webhook payload. Schemas are loose (unknown
 * fields pass through) and mostly optional, so Meta adding fields never breaks us.
 */
const messageSchema = z.looseObject({
  id: z.string(),
  from: z.string(),
  timestamp: z.string().optional(),
  type: z.string(),
  text: z.looseObject({ body: z.string() }).optional(),
});

const valueSchema = z.looseObject({
  contacts: z
    .array(z.looseObject({ wa_id: z.string().optional(), profile: z.looseObject({ name: z.string() }).optional() }))
    .optional(),
  messages: z.array(messageSchema).optional(),
  statuses: z.array(z.unknown()).optional(),
});

const payloadSchema = z.looseObject({
  object: z.string().optional(),
  entry: z
    .array(
      z.looseObject({
        changes: z.array(z.looseObject({ field: z.string().optional(), value: valueSchema })).optional(),
      }),
    )
    .optional(),
});

export type IncomingMessage = {
  waMessageId: string;
  /** User's phone as Meta sends it (digits, country code, no +). */
  from: string;
  displayName: string | null;
  type: string;
  /** Text body for `type === "text"`, otherwise null. */
  text: string | null;
  raw: unknown;
};

/** Extracts every user message from a webhook payload; status-only payloads yield []. */
export function extractMessages(payload: unknown): IncomingMessage[] {
  const parsed = payloadSchema.safeParse(payload);
  if (!parsed.success) return [];

  const result: IncomingMessage[] = [];
  for (const entry of parsed.data.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const { messages = [], contacts = [] } = change.value;
      for (const message of messages) {
        const contact = contacts.find((c) => c.wa_id === message.from) ?? contacts[0];
        result.push({
          waMessageId: message.id,
          from: message.from,
          displayName: contact?.profile?.name ?? null,
          type: message.type,
          text: message.type === "text" ? (message.text?.body ?? null) : null,
          raw: message,
        });
      }
    }
  }
  return result;
}
