export const TOTAL_ROUNDS = 5;

// Tout ce qui est "budget" est en k€
export const STARTING_CASH = 100;

// Le marché & unités restent en "unités vendues" (bouteilles)
export const BASE_MARKET_DEMAND = 10000;

// Coût unitaire en € / unité (bouteille)
export const BASE_COST_PER_UNIT = 1.4;

export const BASE_COMPETITOR_STRENGTH = 1.15;

// Capacité en unités/an (bouteilles)
export const START_CAPACITY = 6000;

// Leviers en k€
export const RD_COST = 120;
export const RD_QUALITY_DELTA = 0.15;

export const BRAND_COST = 90;
export const BRAND_DELTA = 0.12;

export const CAPEX_COST = 150;
export const CAPACITY_DELTA = 2000;

export const DIVERSIFY_COST = 200;
export const DIVERSIFY_FIXED_COST_PER_ROUND = 25;

export const VARIABLE_LEVER_CONFIG = {
  BRAND: { min: 10, max: 150, step: 10, defaultValue: BRAND_COST },
  RD: { min: 50, max: 190, step: 10, defaultValue: RD_COST },
  CAPACITY: { min: 100, max: 200, step: 10, defaultValue: CAPEX_COST },
  DIVERSIFY: { min: 100, max: 300, step: 10, defaultValue: DIVERSIFY_COST },
} as const;

export const LOAN_OPTIONS = [150, 300] as const;
export const LOAN_RATE_PER_ROUND = 0.1;
export const LOAN_TERM_ROUNDS = 3;

// Prix en € / unité
export const PRICE_TABLE = {
  LOW: { price: 2.4, marginFactor: 0.85 },
  MID: { price: 3.0, marginFactor: 1.0 },
  PREMIUM: { price: 3.8, marginFactor: 1.15 },
} as const;

export const PRICE_DEMAND_MULT = {
  LOW: 1.18,
  MID: 1.0,
  PREMIUM: 0.82,
} as const;

export const PRODUCT_INFO = {
  LEAN: {
    name: "PowerFuel Lean",
    description: "Formule légère pour maintien du poids",
    image: "drink_lean.png",
    color: "energy",
  },
  BULK: {
    name: "PowerFuel Bulk",
    description: "Prise de masse et récupération",
    image: "drink_bulk.png",
    color: "accent",
  },
  PROTEIN: {
    name: "PowerFuel Protein+",
    description: "Haute teneur protéique quotidienne",
    image: "drink_protein.png",
    color: "info",
  },
  PERFORMANCE: {
    name: "PowerFuel Performance",
    description: "Formule pro pour athlètes",
    image: "drink_performance.png",
    color: "warning",
  },
} as const;

export const LEVER_INFO: {
  [key in LeverKey]: {
    name: string;
    description: string;
    icon: string;
    cost: number;
    variableCost?: {
      min: number;
      max: number;
      step: number;
      defaultValue: number;
    };
  };
} = {
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
    variableCost: VARIABLE_LEVER_CONFIG.RD,
  },
  CAPACITY: {
    name: "Capacité",
    description: "Augmenter la production",
    icon: "🏭",
    cost: CAPEX_COST,
    variableCost: VARIABLE_LEVER_CONFIG.CAPACITY,
  },
  BRAND: {
    name: "Marketing",
    description: "Renforcer l'image de marque",
    icon: "📢",
    cost: BRAND_COST,
    variableCost: VARIABLE_LEVER_CONFIG.BRAND,
  },
  DIVERSIFY: {
    name: "Diversification",
    description: "Lancer un nouveau produit",
    icon: "🎯",
    cost: DIVERSIFY_COST,
    variableCost: VARIABLE_LEVER_CONFIG.DIVERSIFY,
  },
  LOAN: {
    name: "Financement",
    description: "Prendre un prêt pour financer votre stratégie",
    icon: "🏦",
    cost: 0,
  },
} as const;
