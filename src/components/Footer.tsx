import Link from "next/link";
import { contact, legal, site } from "@/config/site";
import { LogoMark } from "./Logo";
import { Pending } from "./Pending";

export function Footer() {
  return (
    <footer className="bg-ink text-paper/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5 text-paper">
            <LogoMark className="h-8 w-8 text-ink-soft" />
            <span className="font-display text-xl font-bold">{site.name}</span>
          </div>
          <p className="mt-4 max-w-sm">{site.tagline}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className="font-semibold text-paper">Horario de atención</span>
          {contact.hours.map((h) => (
            <span key={h.days}>
              {h.days}: {h.time}
            </span>
          ))}
        </div>
      </div>
      {/* Business identity: required for Meta business verification */}
      <div className="border-t border-paper/15">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-6 text-sm md:flex-row md:items-end md:justify-between">
          <address className="not-italic leading-relaxed">
            {site.name} es un nombre comercial de <Pending value={legal.legalName} label="nombre legal" />.
            <br />
            <Pending value={legal.address} label="domicilio fiscal" />
            <br />
            Tel. <a href={`tel:${contact.phoneTel}`} className="hover:text-paper">{contact.phoneDisplay}</a> ·{" "}
            <a href={`mailto:${contact.email}`} className="hover:text-paper">
              {contact.email}
            </a>
          </address>
          <div className="flex flex-wrap gap-5">
            <Link href="/aviso-de-privacidad" className="hover:text-paper">
              Aviso de privacidad
            </Link>
            <Link href="/terminos" className="hover:text-paper">
              Términos de uso
            </Link>
            <span>© {new Date().getFullYear()} {site.name}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
