import { index, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

/** Idempotent receiver: one row per processed WhatsApp message id. */
export const webhookEvents = pgTable("webhook_events", {
  waMessageId: text("wa_message_id").primaryKey(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

export const conversationMode = pgEnum("conversation_mode", ["bot", "human"]);
export const messageAuthor = pgEnum("message_author", ["user", "bot", "human"]);

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  waPhone: text("wa_phone").notNull().unique(),
  displayName: text("display_name"),
  mode: conversationMode("mode").notNull().default("bot"),
  handoffReason: text("handoff_reason"),
  humanSince: timestamp("human_since", { withTimezone: true }),
  lastHumanMessageAt: timestamp("last_human_message_at", { withTimezone: true }),
  lastUserMessageAt: timestamp("last_user_message_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id),
    author: messageAuthor("author").notNull(),
    waMessageId: text("wa_message_id").unique(),
    type: text("type").notNull(),
    content: text("content"),
    raw: jsonb("raw"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("messages_conversation_created_idx").on(t.conversationId, t.createdAt)],
);

export type Conversation = typeof conversations.$inferSelect;
export type MessageAuthor = (typeof messageAuthor.enumValues)[number];
