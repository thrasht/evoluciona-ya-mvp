/** Shows a value, or a highlighted placeholder while it hasn't been configured. */
export function Pending({ value, label }: { value: string; label: string }) {
  return value ? <>{value}</> : <mark className="rounded bg-marigold-soft px-1 text-ink">[Pendiente: {label}]</mark>;
}
