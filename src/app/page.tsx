import { ChatDemo } from "@/components/ChatDemo";
import { WhatsAppButton } from "@/components/ContactButtons";
import { contact } from "@/config/site";

const benefits = [
  {
    title: "Atiendes a cualquier hora",
    text: "Tus clientes reciben respuesta en segundos, también de noche, en fin de semana y en temporada alta.",
  },
  {
    title: "No pierdes ventas por contestar tarde",
    text: "Quien pregunta y no recibe respuesta le compra a otro. Un agente atiende en el momento en que el cliente tiene interés.",
  },
  {
    title: "Menos tareas repetitivas",
    text: "Precios, horarios, ubicación, disponibilidad: las preguntas de siempre se responden solas y tu tiempo se va a lo importante.",
  },
  {
    title: "Respuestas consistentes",
    text: "La misma información correcta para todos los clientes, sin depender de quién conteste ni de cómo amaneció.",
  },
  {
    title: "Información para decidir",
    text: "Cada conversación deja datos: qué preguntan, qué piden y dónde se detienen. Con eso ajustas tu oferta.",
  },
  {
    title: "Creces sin saturarte",
    text: "Atiendes más conversaciones al mismo tiempo sin tener que contratar al mismo ritmo que crecen tus mensajes.",
  },
];

const comparison = [
  {
    aspect: "Cómo entiende al cliente",
    menuBot: "Solo con opciones fijas: \"escribe 1 para precios\"",
    agent: "Entiende mensajes escritos con las palabras del cliente",
  },
  {
    aspect: "Qué puede hacer",
    menuBot: "Responder lo que se programó palabra por palabra",
    agent: "Consultar tu catálogo, cotizar, agendar citas y tomar pedidos",
  },
  {
    aspect: "Cuando no sabe algo",
    menuBot: "Se atora o repite el menú",
    agent: "Te pasa la conversación a ti con el contexto completo",
  },
  {
    aspect: "Cuando cambia tu negocio",
    menuBot: "Hay que reprogramar cada flujo",
    agent: "Se actualiza la información del negocio y el agente la usa",
  },
];

const useCases = [
  "Responder preguntas frecuentes sobre precios, horarios y ubicación",
  "Mostrar tu catálogo y recomendar productos o servicios",
  "Agendar citas y enviar recordatorios",
  "Tomar pedidos y confirmar datos de entrega",
  "Identificar a los clientes con intención de compra y avisarte",
  "Dar seguimiento a quien preguntó y no volvió a escribir",
];

const steps = [
  {
    title: "Asesoría",
    text: "Revisamos cómo atiendes y vendes hoy, y detectamos dónde la IA te ahorra tiempo o te genera ventas.",
  },
  {
    title: "Implementación",
    text: "Configuramos el agente con la información de tu negocio y lo conectamos a tu WhatsApp.",
  },
  {
    title: "Ajuste y acompañamiento",
    text: "Revisamos conversaciones reales y mejoramos las respuestas hasta que el agente trabaje como tú lo harías.",
  },
];

const faqs = [
  {
    q: "¿Necesito saber de tecnología?",
    a: "No. Tú conoces tu negocio; nosotros nos encargamos de la parte técnica y te explicamos todo en palabras simples.",
  },
  {
    q: "¿Funciona con el número de WhatsApp que ya uso?",
    a: "En muchos casos sí. Lo revisamos en la asesoría antes de hacer cualquier cambio a tu número.",
  },
  {
    q: "¿Y si la IA responde algo incorrecto?",
    a: "El agente se limita a la información de tu negocio y, cuando no tiene la respuesta, te pasa la conversación en lugar de inventar.",
  },
  {
    q: "¿Puedo solo pedir asesoría, sin implementar?",
    a: "Sí. Puedes llevarte las recomendaciones y aplicarlas por tu cuenta, o pedirnos que lo implementemos.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "Depende del tamaño de tu negocio y de lo que quieras automatizar. Escríbenos por WhatsApp y te damos un estimado.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pt-12 pb-20 md:grid-cols-[1.25fr_1fr] md:pt-20">
        <div>
          <h1 className="text-5xl font-bold md:text-7xl">Pon a trabajar la inteligencia artificial en tu negocio.</h1>
          <p className="mt-6 max-w-xl text-lg text-slate md:text-xl">
            Te asesoramos para implementar IA y chatbots con agentes que atienden, venden y agendan por WhatsApp, aunque tú
            no estés disponible.
          </p>
          <div className="mt-9">
            <WhatsAppButton />
          </div>
          <p className="mt-4 text-slate">Te respondemos directamente, sin formularios.</p>
        </div>
        <ChatDemo />
      </section>

      {/* Benefits */}
      <section id="ventajas" className="scroll-mt-20 bg-mist/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-3xl text-4xl font-bold md:text-5xl">Ventajas de usar IA en tu negocio</h2>
          <p className="mt-4 max-w-2xl text-lg text-slate">
            La IA no reemplaza el trato con tus clientes: se encarga de lo repetitivo para que tú atiendas lo que sí necesita a
            una persona.
          </p>
          <dl className="mt-12 grid gap-x-14 border-t border-line md:grid-cols-2">
            {benefits.map((b) => (
              <div key={b.title} className="border-b border-line py-7">
                <dt className="text-xl font-bold md:text-2xl">{b.title}</dt>
                <dd className="mt-2 text-slate">{b.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Agents vs menu bots */}
      <section id="agentes" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
        <h2 className="max-w-3xl text-4xl font-bold md:text-5xl">Un agente de IA no es un chatbot de menús</h2>
        <p className="mt-4 max-w-2xl text-lg text-slate">
          Los chatbots de siempre obligan al cliente a elegir opciones. Un agente de IA conversa, entiende lo que le piden y
          realiza tareas por ti.
        </p>
        {/* Mobile: stacked comparison, so the agent column is never scrolled out of view */}
        <dl className="mt-10 divide-y divide-line border-y border-line md:hidden">
          {comparison.map((row) => (
            <div key={row.aspect} className="py-5">
              <dt className="font-semibold">{row.aspect}</dt>
              <dd className="mt-2 text-slate">
                <span className="font-semibold">Chatbot de menús:</span> {row.menuBot}
              </dd>
              <dd className="mt-2 rounded-xl bg-marigold-soft px-3 py-2 font-medium">
                <span className="font-semibold">Agente de IA:</span> {row.agent}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-12 hidden md:block">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b-2 border-ink">
                <th scope="col" className="w-1/4 py-3 pr-6 font-semibold text-slate">
                  <span className="sr-only">Aspecto</span>
                </th>
                <th scope="col" className="w-[37.5%] py-3 pr-6 font-display text-xl font-bold text-slate">
                  Chatbot de menús
                </th>
                <th scope="col" className="w-[37.5%] rounded-t-2xl bg-marigold-soft px-5 py-3 font-display text-xl font-bold">
                  Agente de IA
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={row.aspect} className="border-b border-line">
                  <th scope="row" className="py-5 pr-6 align-top font-semibold">
                    {row.aspect}
                  </th>
                  <td className="py-5 pr-6 align-top text-slate">{row.menuBot}</td>
                  <td
                    className={`bg-marigold-soft px-5 py-5 align-top font-medium ${
                      i === comparison.length - 1 ? "rounded-b-2xl" : ""
                    }`}
                  >
                    {row.agent}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <h3 className="text-3xl font-bold">Qué puede hacer un agente en tu WhatsApp</h3>
            <p className="mt-3 text-slate">Empezamos por lo que más tiempo te quita y crecemos a partir de ahí.</p>
          </div>
          <ul className="divide-y divide-line border-y border-line">
            {useCases.map((u) => (
              <li key={u} className="flex gap-3 py-4">
                <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-marigold" />
                {u}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process: a real sequence, so it is numbered */}
      <section id="como-trabajamos" className="scroll-mt-20 bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="max-w-2xl text-4xl font-bold md:text-5xl">Cómo trabajamos</h2>
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={step.title} className="border-t-4 border-marigold pt-5">
                <span className="font-display text-5xl font-bold text-marigold">{i + 1}</span>
                <h3 className="mt-3 text-2xl font-bold">{step.title}</h3>
                <p className="mt-2 text-paper/75">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-12 max-w-2xl text-paper/75">
            Tú decides hasta dónde llegar: solo la asesoría o la implementación completa.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="preguntas" className="mx-auto grid max-w-6xl scroll-mt-20 gap-10 px-5 py-20 md:grid-cols-[1fr_1.6fr]">
        <h2 className="text-4xl font-bold md:text-5xl">Preguntas frecuentes</h2>
        <dl className="divide-y divide-line border-y border-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-6">
              <dt className="text-lg font-semibold">{f.q}</dt>
              <dd className="mt-2 text-slate">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Contact */}
      <section className="bg-mist/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-[1.4fr_1fr] md:items-center">
          <div>
            <h2 className="text-4xl font-bold md:text-5xl">Cuéntanos cómo atiendes hoy a tus clientes</h2>
            <p className="mt-4 max-w-xl text-lg text-slate">
              Escríbenos por WhatsApp y te decimos qué parte de tu negocio conviene automatizar primero.
            </p>
            <div className="mt-8">
              <WhatsAppButton />
            </div>
          </div>
          <dl className="grid gap-2 text-[0.95rem]">
            <dt className="font-semibold">Horario de atención</dt>
            {contact.hours.map((h) => (
              <dd key={h.days} className="text-slate">
                {h.days}: {h.time}
              </dd>
            ))}
            <dd className="mt-2 text-slate">Atendemos en línea a negocios de todo México.</dd>
          </dl>
        </div>
      </section>
    </>
  );
}
