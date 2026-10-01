import { desc, eq, sql } from "drizzle-orm";
import type { ModelMessage } from "ai";
import { getDb } from "@/lib/db/client";
import { conversations, messages, webhookEvents, type Conversation, type MessageAuthor } from "@/lib/db/schema";

/** Records a message id; returns false if it was already processed. */
export async function markEventProcessed(waMessageId: string): Promise<boolean> {
  const rows = await getDb()
    .insert(webhookEvents)
    .values({ waMessageId })
    .onConflictDoNothing()
    .returning({ waMessageId: webhookEvents.waMessageId });
  return rows.length > 0;
}

/** Upserts by phone; keeps the latest WhatsApp display name. */
export async function getOrCreateConversation(waPhone: string, displayName: string | null): Promise<Conversation> {
  const [row] = await getDb()
    .insert(conversations)
    .values({ waPhone, displayName })
    .onConflictDoUpdate({
      target: conversations.waPhone,
      set: { displayName: sql`coalesce(excluded.display_name, ${conversations.displayName})`, updatedAt: sql`now()` },
    })
    .returning();
  return row;
}

/** Hands the conversation to a human: the bot stops replying until mode is set back to 'bot'. */
export async function switchToHuman(conversationId: string, reason: string): Promise<void> {
  await getDb()
    .update(conversations)
    .set({ mode: "human", handoffReason: reason, humanSince: sql`now()`, updatedAt: sql`now()` })
    .where(eq(conversations.id, conversationId));
}

export async function saveMessage(input: {
  conversationId: string;
  author: MessageAuthor;
  waMessageId: string | null;
  type: string;
  content: string | null;
  raw?: unknown;
}): Promise<void> {
  const db = getDb();
  await db.insert(messages).values(input);
  if (input.author === "user") {
    await db
      .update(conversations)
      .set({ lastUserMessageAt: sql`now()`, updatedAt: sql`now()` })
      .where(eq(conversations.id, input.conversationId));
  }
}

/** Last `limit` text messages in chronological order, mapped to LLM roles. */
export async function getHistory(conversationId: string, limit = 30): Promise<ModelMessage[]> {
  const rows = await getDb()
    .select({ author: messages.author, content: messages.content })
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limit);

  return rows
    .reverse()
    .filter((r): r is { author: MessageAuthor; content: string } => Boolean(r.content))
    .map((r) => (r.author === "user" ? { role: "user", content: r.content } : { role: "assistant", content: r.content }));
}
