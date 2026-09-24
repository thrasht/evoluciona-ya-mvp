type Message = { from: "client" | "business"; text: string; time: string };

const conversation: Message[] = [
  { from: "client", text: "Hola, ¿tienen citas para el sábado?", time: "21:47" },
  { from: "business", text: "¡Hola! Sí. El sábado tenemos 10:00, 11:30 y 13:00. ¿Cuál te acomoda?", time: "21:47" },
  { from: "client", text: "11:30 porfa", time: "21:48" },
  {
    from: "business",
    text: "Listo, quedó tu cita el sábado a las 11:30. Un día antes te mando un recordatorio por aquí.",
    time: "21:48",
  },
];

/**
 * Hero demo: a WhatsApp conversation answered automatically after hours.
 * Plays once on load (CSS only); with reduced motion everything is shown at once.
 */
export function ChatDemo() {
  return (
    <figure className="mx-auto w-full max-w-sm">
      <div className="overflow-hidden rounded-[2rem] border-[6px] border-ink bg-[#efeae2] shadow-2xl shadow-ink/20">
        <div className="flex items-center gap-3 bg-[#0f5f4a] px-4 py-3 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-display font-bold">
            TN
          </div>
          <div className="leading-tight">
            <p className="font-semibold">Tu negocio</p>
            <p className="text-xs text-white/75">en línea</p>
          </div>
        </div>
        <ol className="flex min-h-[21rem] flex-col gap-2.5 p-4" aria-label="Ejemplo de conversación">
          {conversation.map((m, i) => (
            <li
              key={i}
              className={`chat-bubble max-w-[82%] rounded-2xl px-3.5 py-2 text-[0.93rem] leading-snug text-[#111b21] shadow-sm ${
                m.from === "client" ? "self-end rounded-tr-sm bg-[#d9fdd3]" : "self-start rounded-tl-sm bg-white"
              }`}
              style={{ animationDelay: `${400 + i * 1100}ms` }}
            >
              <span className="sr-only">{m.from === "client" ? "Cliente: " : "Negocio: "}</span>
              {m.text}
              <span className="ml-2 inline-block translate-y-0.5 text-[0.68rem] text-[#667781]">{m.time}</span>
            </li>
          ))}
        </ol>
      </div>
      <figcaption className="mt-4 text-center text-sm text-slate">
        Son las 21:47 y nadie está en el mostrador. Así contesta un WhatsApp con IA.
      </figcaption>
    </figure>
  );
}
