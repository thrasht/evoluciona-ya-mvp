# Evoluciona Ya — website (production MVP)

One-page site that presents Evoluciona Ya (AI consulting and AI-agent chatbots for
businesses) and sends visitors to WhatsApp. Built to pass Meta business verification.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4. Pages are static; the only
dynamic route is the WhatsApp bot webhook `/api/whatsapp` (Drizzle + Postgres, Vercel AI SDK).
Bot spec: `docs/whatsapp-bot-poc.md`.

Pages: `/` (home), `/aviso-de-privacidad` (also the privacy policy URL for Meta apps,
with a data deletion section at `#eliminacion-de-datos`), `/terminos`.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
npm test
```

## WhatsApp bot (local)

```bash
cp .env.example .env.local   # fill Meta, OpenAI and LLM_MODEL values
docker compose up -d         # local Postgres
npm run db:migrate           # apply migrations in drizzle/
npm run dev
ngrok http --url=<static-domain> 3000
```

In Meta → WhatsApp → Configuration: callback `https://<static-domain>/api/whatsapp`, verify token =
`WHATSAPP_VERIFY_TOKEN`, subscribe to `messages`. Schema changes: edit `src/lib/db/schema.ts`, then
`npm run db:generate` and commit the SQL. Reset the local DB with `docker compose down -v`.

Webhook signature validation is not implemented yet (phase 2): don't point Meta at the production URL
until it is.

## Before going live (search for `TODO`)

All in `src/config/site.ts`:

- `contact.whatsapp`, `phoneDisplay`, `phoneTel`: real number.
- `site.url`: production domain.
- `contact.email`: an address on that same domain.
- `legal.legalName` and `legal.address`: exactly as on the document you upload to Meta.
  While empty, the footer and legal pages show a highlighted placeholder.

## Meta business verification checklist

- Site live on its own domain with HTTPS.
- Footer shows trade name + legal name + address + phone + domain email.
- The same name, address, phone and website entered in Meta Business Suite > Business info.
- Business email on the site's domain (enables verification by email/domain).

## Deploy

Push to GitHub, import in Vercel, add the custom domain. The site needs no environment variables;
the bot needs the ones in `.env.example` (Neon Postgres from the Vercel Marketplace in production).

## Removed from the earlier MVP (kept in the previous evoluciona-ya.zip)

Solutions catalog, consultations with prices, quote tool, projects, blog, booking.
