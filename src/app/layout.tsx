import type { Metadata, Viewport } from "next";
import "@fontsource-variable/familjen-grotesk";
import "@fontsource-variable/figtree";
import "./globals.css";
import { site } from "@/config/site";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} | IA y chatbots con agentes para negocios`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { siteName: site.name, locale: site.locale, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#14303f",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-MX">
      <body className="flex min-h-dvh flex-col">
        <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:m-3 focus:rounded focus:bg-ink focus:px-4 focus:py-2 focus:text-paper">
          Ir al contenido
        </a>
        <Header />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
