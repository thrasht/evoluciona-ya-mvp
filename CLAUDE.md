# Notes for Claude Code

- Code, comments and docs in English. All user-facing copy in Spanish (Mexico), "tú" form.
- Current scope: one-page site to present Evoluciona Ya (AI consulting and AI-agent chatbots
  for businesses) and send visitors to WhatsApp. No booking, payments or forms.
- Brand voice: only "Evoluciona Ya" in the UI. The owner's legal name appears ONLY in the
  footer identity line and legal pages (required for Meta business verification).
  Brand voice may use "nosotros", but never claim there is a team.
- Business data lives in `src/config/site.ts`. Don't hardcode phone, email or hours in components.
- Primary CTA is always WhatsApp (`WhatsAppButton`; green = WhatsApp only).
- Design tokens are in `src/app/globals.css` (@theme). Fonts: Familjen Grotesk (display),
  Figtree (body). Left-aligned, row/list based layout; avoid grids of identical cards.
- Keep the site static. Run `npm run build` before finishing any change.
