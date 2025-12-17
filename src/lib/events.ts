import { EventKey, EventCategory } from "./types";

export type EventDef = {
  key: EventKey;
  category: EventCategory;
  title: string;
  description: string;
  demandMult: number;
  costMult?: number;
  // Each event now has specific conditional effects handled in simulate.ts
};

export const EVENTS: Record<EventKey, EventDef> = {
  BASELINE: {
    key: "BASELINE",
    category: "BASELINE",
    title: "Année de référence",
    description: "Conditions de marché normales. C'est le point de départ pour évaluer vos performances futures.",
    demandMult: 1.0,
  },
  HEATWAVE: {
    key: "HEATWAVE",
    category: "CLIMATE",
    title: "Canicule",
    description: "Une vague de chaleur pousse les gens à faire du sport en intérieur. La demande explose ! Les capacités de production sont mises à l'épreuve.",
    demandMult: 1.22,
  },
  COLD_WINTER: {
    key: "COLD_WINTER",
    category: "CLIMATE",
    title: "Hiver rigoureux",
    description: "Le froid décourage les activités sportives. La demande baisse, mais les marques avec une image forte résistent mieux.",
    demandMult: 0.90,
  },
  ECON_CRISIS: {
    key: "ECON_CRISIS",
    category: "ECONOMY",
    title: "Crise économique",
    description: "Le pouvoir d'achat chute. Les consommateurs fuient le premium et cherchent les prix bas. Une image de marque forte peut atténuer l'impact sur la satisfaction.",
    demandMult: 0.86,
  },
  ECON_RECOVERY: {
    key: "ECON_RECOVERY",
    category: "ECONOMY",
    title: "Reprise économique",
    description: "L'économie redémarre ! Les consommateurs dépensent plus facilement, le premium retrouve ses lettres de noblesse.",
    demandMult: 1.08,
  },
  NUTRI_LAW: {
    key: "NUTRI_LAW",
    category: "REGULATION",
    title: "Nouvelle loi nutrition",
    description: "Une réglementation stricte sur les compléments. Les produits Performance sont scrutés de près. Une qualité R&D élevée facilite la conformité.",
    demandMult: 0.98,
  },
  INGREDIENT_TAX: {
    key: "INGREDIENT_TAX",
    category: "REGULATION",
    title: "Taxe sur les ingrédients",
    description: "Une nouvelle taxe augmente le coût des matières premières. Les prix premium permettent d'absorber l'impact, et une qualité élevée améliore la perception.",
    demandMult: 1.00,
    costMult: 1.12,
  },
  FITNESS_BOOM: {
    key: "FITNESS_BOOM",
    category: "TRENDS",
    title: "Boom du fitness",
    description: "Les salles de sport affichent complet ! La demande pour les produits Protein et Bulk s'envole. Les entreprises diversifiées captent mieux cette tendance.",
    demandMult: 1.15,
  },
  WELLNESS_WAVE: {
    key: "WELLNESS_WAVE",
    category: "TRENDS",
    title: "Vague bien-être",
    description: "La tendance wellness booste l'intérêt pour l'image de marque et les produits sains. Attention : les prix bas peuvent ternir votre image.",
    demandMult: 1.05,
  },
};

export const CATEGORY_INFO: Record<EventCategory, { name: string; icon: string; color: string }> = {
  BASELINE: { name: "Référence", icon: "📊", color: "muted" },
  CLIMATE: { name: "Climat", icon: "🌡️", color: "info" },
  ECONOMY: { name: "Économie", icon: "📊", color: "warning" },
  REGULATION: { name: "Réglementation", icon: "⚖️", color: "danger" },
  TRENDS: { name: "Tendances", icon: "📈", color: "energy" },
};

// Exclude BASELINE from random picking
export const ALL_EVENTS = Object.values(EVENTS).filter(e => e.key !== "BASELINE");
