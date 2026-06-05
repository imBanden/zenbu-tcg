const STEPS = [
  {
    n: "1",
    title: "Download the PDF",
    body: "Grab the free binder insert for your set.",
  },
  {
    n: "2",
    title: "Print at 100% / Actual Size on A4",
    body: "No scaling — the placeholders come out to true card size.",
  },
  {
    n: "3",
    title: "Cut along the tick marks and slide into a 9-pocket binder",
    body: "Trim, slot in, and your set list is ready to fill.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="mb-10 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          How it works
        </h2>
        <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <li key={step.n} className="flex flex-col gap-3">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-mono text-sm font-medium text-gold"
                aria-hidden="true"
              >
                {step.n}
              </span>
              <h3 className="text-base font-medium text-foreground">
                {step.title}
              </h3>
              <p className="text-sm leading-6 text-muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
