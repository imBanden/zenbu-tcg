export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-20 sm:pb-24 sm:pt-28">
      <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
        Japanese Pokémon TCG · master sets
      </p>
      <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground sm:text-6xl">
        Every card. Every Japanese set.
      </h1>
      <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted">
        Free printable binder placeholders and accurate master set lists for
        every Japanese Pokémon set — download, print, and fill the gaps in your
        collection.
      </p>
      <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <a
          href="#sets"
          className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 font-medium text-[#0a0a0f] shadow-[0_0_30px_-6px_rgba(201,162,39,0.6)] transition hover:bg-gold-strong hover:shadow-[0_0_40px_-4px_rgba(227,189,69,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
        >
          Browse the sets
        </a>
        <span className="text-sm text-muted">
          Always free · No account · Print-ready A4 PDFs
        </span>
      </div>
    </section>
  );
}
