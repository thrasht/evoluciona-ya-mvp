import type { Metadata } from "next";
import Link from "next/link";
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
        <h2>Comunicación por WhatsApp</h2>
        <ul>
          <li>
            Respondemos los mensajes en nuestro horario de atención (
            {contact.hours.map((h) => `${h.days}, ${h.time}`).join("; ")}). Los mensajes que llegan fuera de ese horario se
            contestan el siguiente día hábil.
          </li>
          <li>
            La información que damos por WhatsApp es orientativa. Precios, alcances y tiempos solo son definitivos en la propuesta
            que aceptes por escrito.
          </li>
          <li>No compartas por este medio contraseñas, datos bancarios ni otros datos sensibles.</li>
          <li>
            Si ya no quieres recibir mensajes nuestros, pídelo por el mismo chat y dejaremos de escribirte.
          </li>
        </ul>
        <h2>Privacidad</h2>
        <p>
          El tratamiento de tus datos se describe en el <Link href="/aviso-de-privacidad">aviso de privacidad</Link>, incluida la
          forma de <Link href="/aviso-de-privacidad#eliminacion-de-datos">solicitar la eliminación de tus datos</Link>.
        </p>
        <h2>Contacto</h2>
        <p>Para cualquier duda sobre estos términos escribe a {contact.email}.</p>
      </div>
    </article>
  );
}
