import { EventKey, EventCategory } from "./types";

export type EventDef = {
  key: EventKey;
  category: EventCategory;
  title: string;
  description: string;
  demandMult: number;
  costMult?: number;
  special?: "CAPACITY_CHECK" | "REGULATORY_PENALTY" | "BRAND_SHIELD";
};

export const EVENTS: Record<EventKey, EventDef> = {
  HEATWAVE: {
    key: "HEATWAVE",
    category: "CLIMATE",
    title: "Canicule",
    description: "Une vague de chaleur pousse les gens à faire du sport en intérieur. La demande de produits de nutrition explose !",
    demandMult: 1.22,
    special: "CAPACITY_CHECK",
  },
  COLD_WINTER: {
    key: "COLD_WINTER",
    category: "CLIMATE",
    title: "Hiver rigoureux",
    description: "Le froid décourage les activités sportives. La demande baisse, mais les marques fortes résistent mieux.",
    demandMult: 0.90,
    special: "BRAND_SHIELD",
  },
  ECON_CRISIS: {
    key: "ECON_CRISIS",
    category: "ECONOMY",
    title: "Crise économique",
    description: "Le pouvoir d'achat baisse. Les consommateurs privilégient les prix bas, le premium souffre.",
    demandMult: 0.86,
  },
  ECON_RECOVERY: {
    key: "ECON_RECOVERY",
    category: "ECONOMY",
    title: "Reprise économique",
    description: "L'économie redémarre ! Les consommateurs dépensent plus facilement.",
    demandMult: 1.08,
  },
  NUTRI_LAW: {
    key: "NUTRI_LAW",
    category: "REGULATION",
    title: "Nouvelle loi nutrition",
    description: "Une réglementation stricte sur les compléments. Les produits Performance sont scrutés, la qualité R&D aide.",
    demandMult: 0.98,
    special: "REGULATORY_PENALTY",
  },
  INGREDIENT_TAX: {
    key: "INGREDIENT_TAX",
    category: "REGULATION",
    title: "Taxe sur les ingrédients",
    description: "Une nouvelle taxe augmente le coût des matières premières pour tous.",
    demandMult: 1.00,
    costMult: 1.12,
  },
  FITNESS_BOOM: {
    key: "FITNESS_BOOM",
    category: "TRENDS",
    title: "Boom du fitness",
    description: "Les salles de sport affichent complet ! La demande de nutrition sportive s'envole.",
    demandMult: 1.15,
  },
  WELLNESS_WAVE: {
    key: "WELLNESS_WAVE",
    category: "TRENDS",
    title: "Vague bien-être",
    description: "La tendance wellness booste l'intérêt pour les produits sains et naturels.",
    demandMult: 1.05,
  },
};

export const CATEGORY_INFO: Record<EventCategory, { name: string; icon: string; color: string }> = {
  CLIMATE: { name: "Climat", icon: "🌡️", color: "info" },
  ECONOMY: { name: "Économie", icon: "📊", color: "warning" },
  REGULATION: { name: "Réglementation", icon: "⚖️", color: "danger" },
  TRENDS: { name: "Tendances", icon: "📈", color: "energy" },
};

export const ALL_EVENTS = Object.values(EVENTS);
