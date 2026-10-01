CREATE TYPE "public"."conversation_mode" AS ENUM('bot', 'human');--> statement-breakpoint
CREATE TYPE "public"."message_author" AS ENUM('user', 'bot', 'human');--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"wa_phone" text NOT NULL,
	"display_name" text,
	"mode" "conversation_mode" DEFAULT 'bot' NOT NULL,
	"handoff_reason" text,
	"human_since" timestamp with time zone,
	"last_human_message_at" timestamp with time zone,
	"last_user_message_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "conversations_wa_phone_unique" UNIQUE("wa_phone")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"author" "message_author" NOT NULL,
	"wa_message_id" text,
	"type" text NOT NULL,
	"content" text,
	"raw" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "messages_wa_message_id_unique" UNIQUE("wa_message_id")
);
--> statement-breakpoint
CREATE TABLE "webhook_events" (
	"wa_message_id" text PRIMARY KEY NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "messages_conversation_created_idx" ON "messages" USING btree ("conversation_id","created_at");