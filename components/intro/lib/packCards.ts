/** A card slotted into the test pack. */
export type PackCard = {
  /** Clean English display name. */
  name: string;
  /** Set badge, e.g. "M2a". */
  setCode: string;
  /** Same-origin art path under /public (guaranteed to render as a WebGL texture). */
  image: string;
};

const DIR = "/cards/test-pack";

/**
 * The five grails in the test pack — order = reveal order (left→right in the fan).
 * The art is the real tcgcollector SAR scan for each card, downloaded into
 * /public so it loads same-origin (no cross-origin texture gamble). Provenance:
 *   Mega Charizard X ex — inferno-x (M2)  #110
 *   Mega Gengar ex       — mega-dream (M2a) #240
 *   Pikachu ex           — mega-dream (M2a) #234
 *   Mega Greninja ex     — ninja-spinner (M4) #114
 *   Mega Darkrai ex      — abyss-eye (M5)  #114
 */
export const packCards: PackCard[] = [
  { name: "Mega Charizard X ex", setCode: "M2", image: `${DIR}/mega-charizard-x.webp` },
  { name: "Mega Gengar ex", setCode: "M2a", image: `${DIR}/mega-gengar.webp` },
  { name: "Pikachu ex", setCode: "M2a", image: `${DIR}/pikachu.webp` },
  { name: "Mega Greninja ex", setCode: "M4", image: `${DIR}/mega-greninja.webp` },
  { name: "Mega Darkrai ex", setCode: "M5", image: `${DIR}/mega-darkrai.webp` },
];
