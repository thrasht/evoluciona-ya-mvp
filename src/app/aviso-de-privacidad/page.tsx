import type { Metadata } from "next";
import { Pending } from "@/components/Pending";
import { contact, legal, site } from "@/config/site";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Aviso de privacidad" };

// TODO: base template. Have it reviewed before launch.
// Its URL is also the privacy policy URL Meta asks for when you create an app.
export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-12 pb-20 md:pt-16">
      <h1 className="text-4xl font-bold md:text-5xl">Aviso de privacidad</h1>
      <p className="mt-4 text-slate">Última actualización: {formatDate(legal.lastUpdated)}</p>
      <div className="prose-ey mt-10">
        <h2>Responsable</h2>
        <p>
          <Pending value={legal.legalName} label="nombre legal" />, que opera con el nombre comercial {site.name}, con domicilio
          en <Pending value={legal.address} label="domicilio fiscal" />, es responsable del tratamiento de tus datos personales.
          Puedes contactarnos en {contact.email}.
        </p>
        <h2>Datos que recabamos</h2>
        <p>
          Nombre, nombre de tu negocio, número de teléfono o WhatsApp, correo electrónico y la información que compartas sobre tu
          negocio cuando nos contactas.
        </p>
        <p>
          Cuando nos escribes por WhatsApp guardamos tu número, el nombre de tu perfil de WhatsApp y el contenido de los mensajes
          que intercambiamos, para poder darte seguimiento sin pedirte la misma información otra vez. No te pediremos datos
          sensibles, contraseñas ni datos bancarios por este medio.
        </p>
        <h2>Para qué usamos tus datos</h2>
        <ul>
          <li>Responder tus mensajes y solicitudes de información.</li>
          <li>Preparar propuestas y dar seguimiento a asesorías y proyectos.</li>
          <li>Emitir comprobantes de pago y facturas.</li>
        </ul>
        <p>
          De forma secundaria, y solo si no te opones, para enviarte información sobre nuevos servicios. Puedes negarte escribiendo a{" "}
          {contact.email}.
        </p>
        <h2>Transferencias</h2>
        <p>
          No vendemos ni compartimos tus datos con terceros, salvo con los proveedores necesarios para operar (por ejemplo, la
          plataforma de WhatsApp Business de Meta, el servicio de correo y el alojamiento donde se guardan las conversaciones) y en
          los casos que exija la ley.
        </p>
        <h2>Cuánto tiempo conservamos tus datos</h2>
        <p>
          Conservamos tus datos y el historial de tus conversaciones mientras sean necesarios para atender tu solicitud y dar
          seguimiento a la asesoría o el proyecto. Después los eliminamos, salvo la información que la ley nos obligue a conservar,
          como la relacionada con facturación.
        </p>
        <h2>Tus derechos</h2>
        <p>
          Puedes solicitar el acceso, rectificación, cancelación u oposición al uso de tus datos, o revocar tu consentimiento,
          escribiendo a {contact.email}. Te responderemos en los plazos que establece la ley.
        </p>
        <h2 id="eliminacion-de-datos">Eliminación de datos</h2>
        <p>
          Para solicitar que eliminemos tus datos y el historial de tus conversaciones:
        </p>
        <ol>
          <li>
            Escribe a {contact.email} con el asunto &quot;Eliminación de datos&quot;, o envíanos un mensaje por WhatsApp con esa
            misma frase.
          </li>
          <li>Indica el número de WhatsApp o el correo con el que nos contactaste.</li>
          <li>
            Eliminaremos tus datos y tus conversaciones, salvo lo que la ley nos obligue a conservar, y te confirmaremos por el
            mismo medio en un plazo máximo de 20 días hábiles.
          </li>
        </ol>
        <h2>Cambios a este aviso</h2>
        <p>Cualquier cambio se publicará en esta página.</p>
      </div>
    </article>
  );
}
