const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export function formatMXN(value: number): string {
  return mxn.format(value);
}

const date = new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric" });

export function formatDate(iso: string): string {
  return date.format(new Date(`${iso}T12:00:00`));
}
