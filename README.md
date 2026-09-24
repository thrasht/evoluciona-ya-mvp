# Evoluciona Ya — website (production MVP)

One-page site that presents Evoluciona Ya (AI consulting and AI-agent chatbots for
businesses) and sends visitors to WhatsApp. Built to pass Meta business verification.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind CSS v4. Fully static.

Pages: `/` (home), `/aviso-de-privacidad` (also the privacy policy URL for Meta apps,
with a data deletion section at `#eliminacion-de-datos`), `/terminos`.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build
```

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

Push to GitHub, import in Vercel, add the custom domain. No environment variables.

## Removed from the earlier MVP (kept in the previous evoluciona-ya.zip)

Solutions catalog, consultations with prices, quote tool, projects, blog, booking.
