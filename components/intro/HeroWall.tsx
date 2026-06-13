import { chaseCards, chaseCount } from "@/lib/chase";
import { sets } from "@/lib/sets";
import { packCards } from "./lib/packCards";
import styles from "./HeroWall.module.css";

// v2-only hero: identical to components/Hero.tsx (same CSS module, same copy),
// except the 5 pack-intro cards are injected into the marquee rows as tagged
// landing targets (data-pack-slot) so the 3D cards can fly into their slots.

const totalCards = sets.reduce((n, s) => n + s.totalCards, 0);

type WallCard = {
  key: string;
  image: string;
  title: string;
  /** Pack-intro landing slot (0–4). */
  slot?: number;
};

// The (setCode, number) identities of packCards — keep in sync with
// components/test-pack/lib/packCards.ts. Used to dedupe the chase wall so an
// injected card never scrolls past its CDN twin.
const PACK_IDS = ["M2-110", "M2a-240", "M2a-234", "M4-114", "M5-114"];

function buildRows(): { rowA: WallCard[]; rowB: WallCard[] } {
  const excluded = new Set(PACK_IDS);
  const wall: WallCard[] = chaseCards
    .filter((c) => !excluded.has(`${c.setCode}-${c.number}`))
    .map((c) => ({
      key: `${c.setCode}-${c.number}`,
      image: c.image,
      title: `${c.name} · ${c.setCode}`,
    }));

  const rowA = wall.filter((_, i) => i % 2 === 0);
  const rowB = wall.filter((_, i) => i % 2 === 1);

  const inject = (row: WallCard[], at: number, slot: number) => {
    const c = packCards[slot];
    row.splice(Math.min(at, row.length), 0, {
      key: `pack-${slot}`,
      image: c.image,
      title: `${c.name} · ${c.setCode}`,
      slot,
    });
  };
  // 3 into the top row, 2 into the bottom — spaced so they land spread apart.
  inject(rowA, 1, 0);
  inject(rowA, 6, 2);
  inject(rowA, 11, 4);
  inject(rowB, 2, 1);
  inject(rowB, 8, 3);

  return { rowA, rowB };
}

function Marquee({ cards, dir }: { cards: WallCard[]; dir: "left" | "right" }) {
  // Doubled so the loop is seamless.
  const loop = [...cards, ...cards];
  return (
    <div className={styles.marquee} aria-hidden="true">
      <div className={`${styles.track} ${dir === "left" ? styles.left : styles.right}`}>
        {loop.map((c, i) => (
          <div
            key={`${c.key}-${i}`}
            className={styles.card}
            title={c.title}
            {...(c.slot !== undefined ? { "data-pack-slot": c.slot } : {})}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HeroV2() {
  const { rowA, rowB } = buildRows();

  return (
    <section className={styles.hero}>
      <Marquee cards={rowA} dir="left" />

      <div className={styles.center}>
        <p className={styles.eyebrow}>JAPANESE POKÉMON · MASTER SETS</p>
        <h1 className={styles.headline}>
          <span className={styles.line}>Every card.</span>
          <span className={styles.line}>Every set.</span>
          <span className={`${styles.line} ${styles.gold}`}>Nothing missing.</span>
        </h1>
        <p className={styles.sub}>
          <b>{totalCards.toLocaleString()}</b> cards across <b>{sets.length}</b> Japanese sets —
          and <b>{chaseCount}</b> of them you&apos;ll have to chase. How many are missing from
          yours?
        </p>
        <div className={styles.actions}>
          <a
            href="#sets"
            className="inline-flex items-center justify-center rounded-full bg-gold px-7 py-3 font-medium text-[#0a0a0f] shadow-[0_0_30px_-6px_rgba(201,162,39,0.6)] transition hover:bg-gold-strong hover:shadow-[0_0_44px_-4px_rgba(227,189,69,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0f]"
          >
            Start the hunt
          </a>
          <a
            href="#how"
            className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 font-medium text-foreground transition hover:border-gold/40 hover:text-gold"
          >
            How it works
          </a>
        </div>
      </div>

      <Marquee cards={rowB} dir="right" />
    </section>
  );
}
