export const TOTAL_ROUNDS = 5;

export const STARTING_CASH = 120;
export const BASE_MARKET_DEMAND = 10000;
export const BASE_COST_PER_UNIT = 1.0;
export const BASE_COMPETITOR_STRENGTH = 1.15;

export const START_QUALITY = 1.0;
export const START_BRAND = 1.0;
export const START_CAPACITY = 8000;

export const RD_COST = 35;
export const RD_QUALITY_DELTA = 0.15;

export const BRAND_COST = 25;
export const BRAND_DELTA = 0.12;

export const CAPEX_COST = 45;
export const CAPACITY_DELTA = 2000;

export const DIVERSIFY_COST = 55;
export const DIVERSIFY_FIXED_COST_PER_ROUND = 8;

export const PRICE_TABLE = {
  LOW: { price: 2.0, marginFactor: 0.90 },
  MID: { price: 2.6, marginFactor: 1.00 },
  PREMIUM: { price: 3.3, marginFactor: 1.10 },
} as const;

export const PRICE_DEMAND_MULT = {
  LOW: 1.18,
  MID: 1.00,
  PREMIUM: 0.82,
} as const;

export const PRODUCT_INFO = {
  LEAN: {
    name: "PowerFuel Lean",
    description: "Formule légère pour maintien du poids",
    icon: "🥗",
    color: "energy",
  },
  BULK: {
    name: "PowerFuel Bulk",
    description: "Prise de masse et récupération",
    icon: "💪",
    color: "accent",
  },
  PROTEIN: {
    name: "PowerFuel Protein+",
    description: "Haute teneur protéique quotidienne",
    icon: "🥤",
    color: "info",
  },
  PERFORMANCE: {
    name: "PowerFuel Performance",
    description: "Formule pro pour athlètes",
    icon: "⚡",
    color: "warning",
  },
} as const;

export const LEVER_INFO = {
  PRICE: {
    name: "Politique de prix",
    description: "Ajustez vos prix pour ce round",
    icon: "💰",
    cost: 0,
  },
  RD: {
    name: "R&D",
    description: "Investir en recherche (+qualité)",
    icon: "🔬",
    cost: RD_COST,
  },
  CAPACITY: {
    name: "Capacité",
    description: "Augmenter la production",
    icon: "🏭",
    cost: CAPEX_COST,
  },
  BRAND: {
    name: "Marketing",
    description: "Renforcer l'image de marque",
    icon: "📢",
    cost: BRAND_COST,
  },
  DIVERSIFY: {
    name: "Diversification",
    description: "Lancer un nouveau produit",
    icon: "🎯",
    cost: DIVERSIFY_COST,
  },
} as const;
