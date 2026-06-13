import { sets } from "./sets";
import type { Card } from "./cards/types";
import { abyssEyeCards } from "./cards/abyss-eye";
import { ninjaSpinnerCards } from "./cards/ninja-spinner";
import { munikisZeroCards } from "./cards/munikis-zero";
import { megaDreamCards } from "./cards/mega-dream";
import { infernoXCards } from "./cards/inferno-x";
import { megaBraveCards } from "./cards/mega-brave";
import { megaSymphoniaCards } from "./cards/mega-symphonia";

const REGISTRY: Record<string, Card[]> = {
  "abyss-eye": abyssEyeCards,
  "ninja-spinner": ninjaSpinnerCards,
  "munikis-zero": munikisZeroCards,
  "mega-dream": megaDreamCards,
  "inferno-x": infernoXCards,
  "mega-brave": megaBraveCards,
  "mega-symphonia": megaSymphoniaCards,
};

export type ChaseCard = {
  number: number;
  name: string;
  image: string;
  holoTier: number;
  setCode: string;
};

/** Total secret "chase" cards across every set — the number that haunts collectors. */
export const chaseCount = sets.reduce((n, s) => n + s.secretCards, 0);

/**
 * The prettiest secrets — SAR / MA / MUR full-arts, up to 4 per set — used as the
 * scrolling "wall of grails" in the hero. (Real art, hotlinked from tcgcollector.)
 */
export const chaseCards: ChaseCard[] = sets.flatMap((s) =>
  (REGISTRY[s.slug] ?? [])
    .filter((c) => Boolean(c.image) && c.holoTier >= 4)
    .sort((a, b) => b.holoTier - a.holoTier)
    .slice(0, 4)
    .map((c) => ({
      number: c.number,
      name: c.name,
      image: c.image as string,
      holoTier: c.holoTier,
      setCode: s.code,
    })),
);
