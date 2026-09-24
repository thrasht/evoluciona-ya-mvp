import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-28">
      <h1 className="text-4xl font-bold md:text-5xl">Esta página no existe</h1>
      <p className="mt-4 text-lg text-slate">Puede que el enlace haya cambiado. Desde el inicio encuentras todas las secciones.</p>
      <Link href="/" className="mt-8 inline-flex rounded-full bg-ink px-6 py-3 font-semibold text-paper">
        Ir al inicio
      </Link>
    </div>
  );
}
