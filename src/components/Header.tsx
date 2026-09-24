import Link from "next/link";
import { Logo } from "./Logo";
import { WhatsAppButton } from "./ContactButtons";

export const navItems = [
  { href: "/#ventajas", label: "Ventajas" },
  { href: "/#agentes", label: "Agentes de IA" },
  { href: "/#como-trabajamos", label: "Cómo trabajamos" },
  { href: "/#preguntas", label: "Preguntas" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/92 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5">
        <Logo />
        <nav aria-label="Principal" className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="font-medium text-ink/80 hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <WhatsAppButton size="md" label="WhatsApp" />
      </div>
    </header>
  );
}
