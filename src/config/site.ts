/**
 * Single source of truth for business data. Search for "TODO" before going live.
 *
 * Meta business verification checks that the website shows the SAME legal name,
 * address and phone as Meta Business Info and the uploaded document (e.g. SAT
 * "Constancia de situación fiscal"), and an email on the site's domain.
 * The footer renders these from `legal` below.
 */

export const site = {
  name: "Evoluciona Ya",
  tagline: "Asesoría para implementar inteligencia artificial y chatbots con agentes de IA en tu negocio.",
  description:
    "Te asesoramos para implementar inteligencia artificial en tu negocio y chatbots con agentes de IA que atienden, venden y agendan por WhatsApp.",
  // TODO: production domain (must match the email domain below)
  url: "https://www.evolucionaya.com",
  locale: "es_MX",
};

export const contact = {
  // TODO: real number. Digits only, with country code (52 + 10 digits).
  whatsapp: "525514968660",
  phoneDisplay: "5514968660",
  phoneTel: "+525514968660",
  // TODO: must use the website's domain for Meta verification
  email: "contacto@evolucionaya.com",
  hours: [
    { days: "Lunes a viernes", time: "9:00 a 19:00" },
    { days: "Sábado", time: "10:00 a 14:00" },
  ],
  defaultMessage: "Hola, quiero información sobre IA y chatbots para mi negocio.",
};

/**
 * TODO: fill EXACTLY as it appears on the document you'll upload to Meta
 * (same spelling, accents and address). While empty, the site shows a
 * highlighted placeholder so it can't go live unnoticed.
 */
export const legal = {
  legalName: "Eduardo Montes Hernández", // e.g. your full name as registered in the SAT
  address: "San Luis Potosí, San Luis Potosí, México", // full fiscal address as on the document
  lastUpdated: "2026-09-20",
};
