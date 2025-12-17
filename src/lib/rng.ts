import { EventKey, EventCategory, ProductType } from "./types";
import { ALL_EVENTS } from "./events";

// Mulberry32 PRNG for deterministic randomness
export function mulberry32(seed: number): () => number {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

export function seedFromString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function pickEvent(
  seed: string,
  round: number,
  usedEvents: EventKey[],
  lastCategory?: EventCategory
): EventKey {
  const rng = mulberry32(seedFromString(seed) + round * 1000);
  
  // Filter out used events
  let candidates = ALL_EVENTS.filter(e => !usedEvents.includes(e.key));
  
  // Try to avoid same category as last round
  if (lastCategory && candidates.length > 1) {
    const differentCategory = candidates.filter(e => e.category !== lastCategory);
    if (differentCategory.length > 0) {
      candidates = differentCategory;
    }
  }
  
  // Pick random from candidates
  const index = Math.floor(rng() * candidates.length);
  return candidates[index].key;
}

export function seededShuffle<T>(array: T[], seed: string): T[] {
  const rng = mulberry32(seedFromString(seed));
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Tie-break for product voting
export function tieBreakProduct(seed: string, products: ProductType[]): ProductType {
  const rng = mulberry32(seedFromString(seed + "_tiebreak"));
  const index = Math.floor(rng() * products.length);
  return products[index];
}
