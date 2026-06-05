import type { SetCardData } from "@/lib/sets";
import SetCard from "@/components/SetCard";

export default function SetsGrid({ sets }: { sets: SetCardData[] }) {
  return (
    <section id="sets" className="mx-auto max-w-6xl px-4 py-20">
      <div className="mb-8 flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Master sets
        </h2>
        <p className="text-sm text-muted">
          Accurate JP master set lists with free, print-ready binder
          placeholders.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sets.map((set) => (
          <SetCard key={set.code} set={set} />
        ))}
      </div>
    </section>
  );
}
