import { contact } from "@/config/site";

/** Builds a wa.me link with an optional prefilled message. */
export function whatsappLink(message: string = contact.defaultMessage): string {
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
