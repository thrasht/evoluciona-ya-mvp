import Link from "next/link";
import { site } from "@/config/site";

export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M8 23h5v-5h5v-5h6" fill="none" stroke="#e9a23b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24" cy="13" r="2.4" fill="#e9a23b" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 text-ink" aria-label={`${site.name}, inicio`}>
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">{site.name}</span>
    </Link>
  );
}
