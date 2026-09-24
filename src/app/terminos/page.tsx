import type { Metadata } from "next";
import { Pending } from "@/components/Pending";
import { contact, legal, site } from "@/config/site";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Términos de uso" };

// TODO: base template. Adjust before launch.
export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-12 pb-20 md:pt-16">
      <h1 className="text-4xl font-bold md:text-5xl">Términos de uso</h1>
      <p className="mt-4 text-slate">Última actualización: {formatDate(legal.lastUpdated)}</p>
      <div className="prose-ey mt-10">
        <h2>Quiénes somos</h2>
        <p>
          {site.name} es un nombre comercial de <Pending value={legal.legalName} label="nombre legal" />. Ofrecemos asesoría para
          implementar inteligencia artificial y chatbots con agentes de IA en negocios.
        </p>
        <h2>Uso del sitio</h2>
        <p>
          Este sitio es informativo. El contenido describe nuestros servicios de forma general y no constituye una oferta ni una
          cotización.
        </p>
        <h2>Servicios</h2>
        <p>
          Cada asesoría o proyecto se rige por la propuesta que aceptes por escrito, donde se indican alcance, tiempos, precio y
          forma de pago. Las cuentas y accesos creados para tu negocio quedan a tu nombre.
        </p>
        <h2>Contacto</h2>
        <p>Para cualquier duda sobre estos términos escribe a {contact.email}.</p>
      </div>
    </article>
  );
}
