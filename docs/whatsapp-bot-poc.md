# WhatsApp AI Bot — PoC Technical Spec (Phases 0–3)

Sep 25, 2026 · @eduardo

## Overview

This PoC adds a WhatsApp bot to the existing Evoluciona Ya Next.js app on Vercel (evolucionaya.com). Phases 0–3 deliver a secure, reliable webhook that echoes messages back and persists every conversation. The AI agent is added in phase 4 and is out of scope here.

| Phase | Outcome | Done when |
| --- | --- | --- |
| 0. Setup | Meta app, test number, database and tunnel ready | A test message from Meta's dashboard reaches your phone |
| 1. Echo webhook | The bot replies with the same text it receives | Writing to the test number returns your own message |
| 2. Reliability | Signed, deduplicated, fast-acknowledged webhook | No double replies; unsigned requests get 401 |
| 3. Memory | Conversations and messages stored in Postgres | A full conversation is visible in the database |

**Stack:** Next.js App Router (existing app), TypeScript, WhatsApp Cloud API (Meta test number), Postgres (local Docker in development, Neon via the Vercel Marketplace in production), Drizzle ORM, Zod. The Vercel AI SDK is installed in phase 4.

**Principle:** all bot code lives in isolated modules under `lib/bot/`, so it can later move to a separate multi-tenant app without rewrites.

**Paths:** this repo uses `src/`, so every path below is relative to `src/` (e.g. `src/app/api/whatsapp/route.ts`, `src/lib/bot/`).

## Current iteration (owner decision, Sep 25, 2026)

To validate the full loop early, the first build goes beyond phase 1 and overrides some phase boundaries below:

- **Scope:** receive a message → save it in Postgres (phase 3 schema) → generate the reply with an LLM → send it via the Cloud API. Deduplication (`webhook_events`) and `after()` are included.
- **LLM:** Vercel AI SDK (`ai` + `@ai-sdk/openai`) called directly with `OPENAI_API_KEY`; the model id comes from `LLM_MODEL`. Plain `generateText`, no tools. Switching to Claude later only touches `lib/bot/reply.ts` and `lib/env.ts`. The system prompt lives in `lib/bot/prompt.ts` and reads business data from `src/config/site.ts`.
- **Signature validation is deferred** so the webhook can be called with plain curl and through ngrok. The route keeps the raw body and a `TODO(phase 2)`; do not expose the production URL to Meta until it is implemented. `verifySignature(rawBody, header, secret)` takes the secret as a parameter for testability.
- **Fixed test recipient:** `WHATSAPP_TEST_RECIPIENT` (the only allow-listed number on the Meta test number) receives every reply. Without it, Mexican `521…` numbers are normalised to `52…` before sending.
- **Env validation is lazy:** `getEnv()` validates on first use instead of at import, because `next build` imports route modules and would fail on machines or Vercel Preview builds without the variables.
- **Known trade-off:** once the 200 is returned, Meta never retries; a failure inside `after()` is logged (`[bot] … wamid=…`) and that message gets no reply. The inbound message is saved first, so nothing is lost.

## Architecture and project structure

The route handler only receives, verifies and acknowledges; all processing runs after the 200 response inside `after()`.

```mermaid
flowchart TD
  A[User writes on WhatsApp] --> B[Meta Cloud API]
  B -->|POST webhook| C[app/api/whatsapp/route.ts]
  C --> D{Valid signature?}
  D -->|No| E[401]
  D -->|Yes| F[Return 200 immediately]
  F --> G["after(): processIncoming()"]
  G --> H{Message id already processed?}
  H -->|Yes| I[Ignore]
  H -->|No| J[Save user message]
  J --> K[Build reply: echo now, agent in phase 4]
  K --> L[Send via Cloud API]
  L --> M[Save outbound message]
```

```
app/api/whatsapp/route.ts      GET verification + POST entry point (thin)
lib/bot/whatsapp/
  signature.ts                 X-Hub-Signature-256 validation
  parse.ts                     Zod schemas + extract messages from payload
  send.ts                      sendText() and a generic send() wrapper
lib/bot/process-incoming.ts    Orchestrates dedupe, persistence, reply
lib/bot/reply.ts               Echo reply (replaced by the agent in phase 4)
lib/bot/conversations.ts       getOrCreateConversation, saveMessage, getHistory
lib/db/schema.ts               Drizzle tables
lib/db/client.ts               Drizzle client
lib/env.ts                     Zod-validated environment variables
```

Rules for the modules:

- `route.ts` holds no business logic; it calls `verifySignature()`, returns 200 and schedules `processIncoming()`.
- Nothing in `lib/bot/` imports from UI code, so the folder can be extracted later.
- Every external call (Meta, database) goes through one wrapper per concern, which makes mocking in tests trivial.

## Design decisions

These decisions are intentional and were reviewed with the owner; do not change them during implementation. If one seems wrong, stop and propose the change with its trade-offs instead of applying it.

| Decision | Why | Alternative considered |
| --- | --- | --- |
| Webhook lives inside the existing Next.js app on Vercel | Shares domain, database and the services catalog used by the quote tool; no second project to deploy or pay for | Separate app, deferred until the multi-tenant product for clients |
| Thin route: verify signature, return 200, process in `after()` | Meta retries slow or failed webhooks, which causes duplicate replies; fast 200 also leaves time for the phase 4 agent | Processing synchronously inside the request |
| One module per concern under `lib/bot/` | Each part is testable in isolation, Meta API changes stay in `whatsapp/`, and the folder can be extracted without rewrites | Logic inside `route.ts` |
| `reply.ts` is the only swap point for reply logic | Phase 4 replaces the echo with the agent without touching routing, parsing or persistence | Agent code spread across modules |
| Drizzle ORM | Schema is plain TypeScript with no client generation step, SQL-like API (natural `INSERT ... ON CONFLICT DO NOTHING RETURNING`), light for serverless cold starts | Prisma is acceptable; swapping only affects `lib/db/` and `conversations.ts` |
| Local Postgres in Docker for development; Neon via Vercel Marketplace in production; postgres.js as the only driver | Local work needs no cloud account or internet; Neon scales to zero, its free plan covers the PoC and billing comes through Vercel; one TCP driver works in both environments because the route runs on the Node.js runtime | A Neon dev branch instead of Docker; the \`@neondatabase/serverless\` driver (does not connect to a plain local Postgres); Supabase |
| ngrok with the owner's static domain for local webhooks | Already configured; the static URL never changes in Meta's dashboard, and the inspector at `localhost:4040` replays requests for dedupe testing | cloudflared quick tunnels (random URL on every start) |
| Signature check over the raw body with `crypto.timingSafeEqual` | The HMAC covers the exact bytes, so the body is read with `req.text()`, never re-serialized JSON; a constant-time comparison avoids leaking the signature through response timing | Plain `===` comparison, which is not allowed here |
| Separate `webhook_events` table for deduplication | Idempotency stays independent of conversation storage and can later cover status events | Unique constraint on `messages` only |
| Save the inbound message before building any reply | Nothing the user wrote is lost if the model, Meta or the network fails later | Saving after replying |
| Human mode is a database flag checked before any reply | The bot must never answer on top of the owner; the model does not decide this per message | Letting the agent decide whether to reply |
| Environment variables are required only in the phase that uses them | `lib/env.ts` fails fast on missing values without demanding keys that are not used yet | One upfront list of every future variable |

The patterns behind the structure: Thin Controller (`route.ts`), Adapter/Gateway (`whatsapp/send.ts`), Anti-corruption layer (`whatsapp/parse.ts` with Zod), Repository (`conversations.ts`), Strategy (`reply.ts`), Idempotent Receiver (`webhook_events`) and Fail-fast configuration (`env.ts`).

## Phase 0 — Setup

Phase 0 is manual work in Meta and Vercel dashboards; Claude Code only handles the dependency and config steps. Do not connect the real business number in this phase.

**Meta (manual)**

1. In Meta for Developers, create an app of type Business and add the WhatsApp product.
2. Note the test number's **Phone Number ID** and the **WhatsApp Business Account ID** from the API Setup page.
3. Add your personal phone (and later 3–5 testers) as allowed recipients; the test number can only message verified recipients.
4. Copy the **temporary access token** (expires in about 24 hours; a permanent System User token comes in production).
5. Copy the **App Secret** from App settings → Basic; it signs every webhook.
6. Send the dashboard's sample template message to your phone to confirm the setup works.

**Database (manual + CLI)**

Development runs against a local Postgres in Docker; Neon is only created when the webhook is deployed to production.

1. Add `docker-compose.yml` at the project root:

```yaml
services:
  db:
    image: postgres:17
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: evoluciona_bot
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
volumes:
  pgdata:
```

2. Run `docker compose up -d` and set in `.env.local`: `DATABASE_URL=postgres://postgres:postgres@localhost:5432/evoluciona_bot` and `DATABASE_URL_UNPOOLED` with the same value.
3. Run `npm run db:migrate` locally; reset with `docker compose down -v` when needed.
4. Before deploying: in the Vercel project's Storage section, create Postgres with Neon from the Marketplace (variables are injected in Vercel). From then on, migrations run automatically on every production deploy (see Phase 3, Migrations).

`.env.local` is never committed; production values live only in Vercel.

**Dependencies (Claude Code)**

```bash
npm install drizzle-orm postgres zod
npm install -D drizzle-kit vitest
```

`drizzle-orm` runs typed queries, `postgres` (postgres.js, via `drizzle-orm/postgres-js`) is the single driver for both local Docker and Neon, `zod` validates Meta payloads and env vars, `drizzle-kit` generates and applies migrations, and `vitest` runs the automated tests. Create the client with `prepare: false`, which Neon's pooled (transaction-mode) connection requires and is harmless locally. HMAC (`node:crypto`), `fetch` and `after()` (`next/server`) are built in. Do not install `ai` or `@ai-sdk/*` before phase 4.

**Local tunnel**

1. Run the app with `npm run dev`, then start ngrok on port 3000 with the owner's static domain (already configured): `ngrok http --url=<static-domain> 3000`.
2. In Meta → WhatsApp → Configuration, set the callback URL to `https://<static-domain>/api/whatsapp` and the verify token to `WHATSAPP_VERIFY_TOKEN` (phase 1 must be running for verification to pass). The static domain means this is configured once.
3. Subscribe the webhook to the `messages` field.
4. Use the ngrok inspector at `http://localhost:4040` to see raw webhook payloads and replay them when testing deduplication.

Vercel preview URLs are behind Deployment Protection, which blocks Meta. Use the tunnel for development and the production URL (`https://evolucionaya.com/api/whatsapp`) once deployed.

**Done when:** the sample message arrives on your phone and `.env.local` holds every variable in the Environment variables section.

## Phase 1 — Echo webhook

Phase 1 proves the round trip: Meta verifies the endpoint, the bot receives a text message and sends the same text back.

**GET — webhook verification**

```ts
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  if (p.get('hub.mode') === 'subscribe' && p.get('hub.verify_token') === env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(p.get('hub.challenge') ?? '', { status: 200 });
  }
  return new Response('Forbidden', { status: 403 });
}
```

**POST — parsing**

- Messages arrive nested in `entry[].changes[].value.messages[]`; each has `id`, `from` (the user's phone), `timestamp`, `type` and, for text, `text.body`.
- The same field can carry `value.statuses[]` (sent, delivered, read receipts) with no messages; ignore those for now.
- `value.contacts[0].profile.name` holds the user's WhatsApp display name; keep it for phase 3.
- Define the payload with Zod using `.passthrough()` and optional fields, so unknown fields never break parsing.
- One POST can contain several messages; process each one.

**Sending a text reply**

```ts
await fetch(`https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ messaging_product: 'whatsapp', to, type: 'text', text: { body } }),
});
```

**Behaviour**

- `type === 'text'` → reply with the same body.
- Any other type (audio, image, sticker, location) → reply with a fixed text: "Por ahora solo puedo leer mensajes de texto."
- `sendText()` throws on non-2xx and logs Meta's error body; an expired token is the most common failure in this phase.

**Done when:** writing to the test number returns your message, a voice note returns the fixed text, and Meta's dashboard shows the webhook as verified.

## Phase 2 — Reliability and security

Phase 2 makes the webhook safe to leave running: only Meta can call it, each message is answered once, and Meta always gets a fast 200.

**Signature validation**

- Read the raw body with `await req.text()` before parsing; the HMAC is computed over the exact bytes, and re-serialized JSON would break it.
- Compute HMAC-SHA256 of the raw body with `WHATSAPP_APP_SECRET` and compare it to the `X-Hub-Signature-256` header (`sha256=<hex>`) using `crypto.timingSafeEqual`, never `===`: a normal comparison stops at the first different character, and that timing difference can leak the signature.
- Check both buffers have the same length before `timingSafeEqual`, because it throws on different lengths.
- Invalid or missing signature → return 401 and log it. Set `export const runtime = 'nodejs'` on the route.

```ts
export function verifySignature(rawBody: string, header: string | null): boolean {
  if (!header?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', env.WHATSAPP_APP_SECRET).update(rawBody).digest('hex');
  const a = Buffer.from(header.slice(7), 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
```

**Fast acknowledgement**

- After the signature passes, return 200 immediately and run `processIncoming(payload)` inside `after()` from `next/server`.
- Meta retries webhooks that are slow or fail, which is the main cause of duplicate replies.
- Set `export const maxDuration` on the route according to the Vercel plan; the agent in phase 4 will need several seconds.

**Deduplication**

- Create a `webhook_events` table with `wa_message_id` as primary key and `received_at`.
- In `processIncoming`, insert the id with `ON CONFLICT DO NOTHING ... RETURNING`; no row returned means it was already processed, so skip it.
- This table stays independent from conversation storage, so status events can reuse it later.

**Error handling**

- Wrap each message's processing in try/catch; one failing message must not stop the rest of the batch.
- Log with a consistent prefix and the `wa_message_id`, e.g. `[bot] send failed wamid=...`, so Vercel logs are searchable.
- Never echo internal errors to the user; if sending fails, log and stop.

**Done when:** replaying the same signed payload twice with curl produces one reply, a request without a valid signature gets 401, and a message sent from the phone gets exactly one answer.

## Phase 3 — Conversation memory

Phase 3 stores every inbound and outbound message per phone number, and adds the human-mode fields the agent will need later.

**Schema (Drizzle)**

```ts
export const conversationMode = pgEnum('conversation_mode', ['bot', 'human']);
export const messageAuthor = pgEnum('message_author', ['user', 'bot', 'human']);

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  waPhone: text('wa_phone').notNull().unique(),
  displayName: text('display_name'),
  mode: conversationMode('mode').notNull().default('bot'),
  handoffReason: text('handoff_reason'),
  humanSince: timestamp('human_since', { withTimezone: true }),
  lastHumanMessageAt: timestamp('last_human_message_at', { withTimezone: true }),
  lastUserMessageAt: timestamp('last_user_message_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => conversations.id),
  author: messageAuthor('author').notNull(),
  waMessageId: text('wa_message_id').unique(),
  type: text('type').notNull(),
  content: text('content'),
  raw: jsonb('raw'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, (t) => [index('messages_conversation_created_idx').on(t.conversationId, t.createdAt)]);
```

| Table | Purpose | Key detail |
| --- | --- | --- |
| `webhook_events` | Deduplication (phase 2) | `wa_message_id` primary key |
| `conversations` | One row per phone number | `mode` gates the bot; `last_user_message_at` tracks the 24-hour window |
| `messages` | Full history | `author` = user, bot or human; outbound `wa_message_id` comes from the send response `messages[0].id` |

**Processing order in `processIncoming`**

1. Deduplicate (phase 2).
2. `getOrCreateConversation(phone, displayName)` as an upsert on `wa_phone`.
3. Save the inbound message and update `last_user_message_at` **before** building any reply, so nothing is lost if a later step fails.
4. If `mode === 'human'`, stop here: no reply.
5. Build the reply (echo for now), send it, then save it with `author = 'bot'`.

**Prepared for phase 4**

- `getHistory(conversationId, limit = 30)` returns the last messages in chronological order, mapped to `{ role, content }`: `user` → `user`, `bot` and `human` → `assistant`.
- Human-mode fields exist now but are only switched manually in the database until the handoff tool is built.

**Migrations:** add `db:generate` (`drizzle-kit generate`) and `db:migrate` (`drizzle-kit migrate`) scripts and commit the generated SQL. `drizzle.config.ts` uses `DATABASE_URL_UNPOOLED`; the app uses the pooled `DATABASE_URL`.

- **Automatic on deploy:** `scripts/migrate-on-deploy.mjs` runs `drizzle-kit migrate` only when `VERCEL_ENV === 'production'` and exits without doing anything on preview and local builds, so previews never touch the production database. Build command: `node scripts/migrate-on-deploy.mjs && next build`.
- `drizzle-kit migrate` applies only pending migrations (tracked in its own table), so a deploy with no new migrations does nothing.
- If a migration fails, the build fails and the previous deployment stays live.
- Migrations run before the new code goes live, so keep them backward compatible: add tables or columns first and remove old ones in a later deploy.
- Never use `drizzle-kit push` against Neon; schema changes always go through generated, committed migrations.

**Done when:** a 5-message conversation appears in `messages` with the right authors, and setting `mode = 'human'` by hand makes the bot stop replying while messages keep being saved.

## Environment variables

All variables are validated in `lib/env.ts` with Zod on first use (`getEnv()`), not at import; a missing value fails fast with a clear message on the first request, and `next build` still works without them. `WHATSAPP_APP_SECRET` and `WHATSAPP_BUSINESS_ACCOUNT_ID` are added to the schema when phase 2 and templates use them. A template without values lives in `.env.example`.

| Variable | Source | Notes |
| --- | --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Meta → API Setup | Temporary token in dev (about 24 h); System User token in production |
| `WHATSAPP_PHONE_NUMBER_ID` | Meta → API Setup | Test number's id; changes when the real number is connected |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | Meta → API Setup | Needed later for templates |
| `WHATSAPP_APP_SECRET` | Meta → App settings → Basic | Signs every webhook; never expose client-side |
| `WHATSAPP_VERIFY_TOKEN` | You choose it | Random string, e.g. `openssl rand -hex 32` |
| `WHATSAPP_API_VERSION` | Meta docs | Graph API version, e.g. `v23.0`; use the latest one shown in the dashboard |
| `WHATSAPP_TEST_RECIPIENT` | You set it | Optional. While on the test number, every reply goes here (`525514968660`) |
| `OPENAI_API_KEY` | OpenAI dashboard | Current iteration only; replaced if the provider changes |
| `LLM_MODEL` | You choose it | OpenAI model id used by `reply.ts` |
| `DATABASE_URL` | Vercel Marketplace (Neon) | Local Docker URL in .env.local during development; Neon pooled URL, injected by Vercel, in production |
| `DATABASE_URL_UNPOOLED` | Vercel Marketplace (Neon) | Same value as DATABASE\_URL locally; Neon direct connection in production, used only by `drizzle-kit` migrations |

None of these variables use the `NEXT_PUBLIC_` prefix. Set them in Vercel for Development and Production; Preview can stay empty while previews are protected.

Later phases add their own variables to `lib/env.ts` only when they are used: `ANTHROPIC_API_KEY` or `AI_GATEWAY_API_KEY` (phase 4), a quote-link signing secret such as `QUOTE_LINK_SECRET`, and the owner-notification credentials such as `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` (phase 5).

## Testing checklist

Each phase is closed only when its items pass on the tunnel and again on the production URL.

**Automated (Vitest)**

- [ ] `verifySignature` accepts a payload signed with a test secret and rejects a tampered body, a wrong secret and a missing header.
- [ ] The Zod parser extracts text messages from a real sample payload, ignores status-only payloads and tolerates unknown fields.
- [ ] `processIncoming` skips a `wa_message_id` that is already in `webhook_events`.
- [ ] `processIncoming` saves the inbound message and sends nothing when `mode = 'human'`.

**Manual**

- [ ] Meta dashboard shows the webhook verified.
- [ ] Text message → same text returned once.
- [ ] Voice note or image → fixed "solo texto" reply.
- [ ] Same signed payload sent twice with curl → one reply.
- [ ] Request without signature → 401.
- [ ] Five-message conversation stored with correct authors and order.
- [ ] `mode` set to `human` in the database → no replies; back to `bot` → replies resume.
- [ ] Expired access token → clear error in Vercel logs, no crash.

Save one real inbound payload per message type as JSON fixtures in `tests/fixtures/whatsapp/` (with phone numbers anonymised) for the automated tests.

## Out of scope and next phases

These phases get their own spec once phase 3 is closed; the structure above is designed so they only replace `lib/bot/reply.ts` and add files under `lib/bot/`.

| Phase | Scope |
| --- | --- |
| 4. Agent | Vercel AI SDK `ToolLoopAgent` replaces the echo; system instructions for Evoluciona Ya; history from `getHistory()` |
| 5. Tools | `getServices`, then `handoffToHuman` (sets `mode`, notifies the owner with a summary), then `createQuoteLink` |
| 6. Real testers | 3–5 people on the test number; daily log review and prompt tuning |
| 7. Production | Meta business verification, System User token, approved templates, real number connected (coexistence preferred) |

Also out of scope for this spec: interactive messages (buttons, lists), audio transcription, the quote-to-chat return flow, an admin inbox, and multi-tenant support.

## Instructions for Claude Code

Work one phase at a time and stop for review at the end of each one.

1. Read this whole spec and the existing project (`package.json`, `app/`, any `lib/` folder) before writing code; follow the project's existing conventions for formatting, imports and TypeScript settings.
2. Treat the Design decisions section as fixed. Do not swap libraries, tools or patterns (Drizzle, Neon, ngrok, `after()`, `timingSafeEqual`, the module layout); if something seems wrong, stop and propose the change with its trade-offs.
3. Before each phase, propose a short plan listing the files to create or modify; wait for approval.
4. Implement only the current phase. Do not install the AI SDK or add agent code before phase 4.
5. Never hardcode secrets or phone numbers; read everything through `lib/env.ts`.
6. Write the automated tests from the Testing checklist for the current phase and run them before reporting.
7. End each phase with: files changed, how to test it manually, and any manual step needed in Meta or Vercel.
8. Keep code, comments, commit messages and docs in English; user-facing bot texts in Spanish.

Suggested first prompt: *"Read docs/whatsapp-bot-poc.md and the project. Propose the plan for Phase 1 (Phase 0 manual steps are done)."* See "Current iteration" above for what is already built.
