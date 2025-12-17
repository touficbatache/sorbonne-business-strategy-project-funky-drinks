import {
  Player,
  PlayerRoundDecision,
  PlayerRoundResult,
  ProductType,
  PriceLevel,
} from "./types";
import { EventDef, EVENTS } from "./events";
import {
  BASE_MARKET_DEMAND,
  BASE_COST_PER_UNIT,
  BASE_COMPETITOR_STRENGTH,
  RD_COST,
  RD_QUALITY_DELTA,
  BRAND_COST,
  BRAND_DELTA,
  CAPEX_COST,
  CAPACITY_DELTA,
  DIVERSIFY_COST,
  DIVERSIFY_FIXED_COST_PER_ROUND,
  PRICE_TABLE,
  PRICE_DEMAND_MULT,
} from "./config";

export function simulateRound(params: {
  round: number;
  event: EventDef;
  productInitial: ProductType;
  player: Player;
  decision: PlayerRoundDecision;
}): { updatedPlayer: Player; result: PlayerRoundResult } {
  const { round, event, productInitial, player, decision } = params;
  const notes: string[] = [];
  
  // Clone player for mutation
  let cash = player.cash;
  let quality = player.quality;
  let brand = player.brand;
  let capacity = player.capacity;
  let portfolio = [...player.portfolio];
  
  // Determine price level (default MID if not PRICE lever)
  let priceLevel: PriceLevel = "MID";
  let investmentCost = 0;
  
  // Step 1: Apply lever
  switch (decision.lever) {
    case "PRICE":
      priceLevel = decision.price;
      notes.push(`Prix ${priceLevel === "LOW" ? "bas" : priceLevel === "PREMIUM" ? "premium" : "moyen"} appliqué`);
      break;
    case "RD":
      cash -= RD_COST;
      investmentCost = RD_COST;
      quality += RD_QUALITY_DELTA;
      notes.push(`R&D: qualité +${(RD_QUALITY_DELTA * 100).toFixed(0)}%`);
      break;
    case "CAPACITY":
      cash -= CAPEX_COST;
      investmentCost = CAPEX_COST;
      capacity += CAPACITY_DELTA;
      notes.push(`Capacité: +${CAPACITY_DELTA} unités/an`);
      break;
    case "BRAND":
      cash -= BRAND_COST;
      investmentCost = BRAND_COST;
      brand += BRAND_DELTA;
      notes.push(`Marketing: image +${(BRAND_DELTA * 100).toFixed(0)}%`);
      break;
    case "DIVERSIFY":
      cash -= DIVERSIFY_COST;
      investmentCost = DIVERSIFY_COST;
      portfolio.push(decision.addProduct);
      notes.push(`Nouveau produit lancé: ${decision.addProduct}`);
      break;
  }
  
  // Step 2: Calculate demand
  let demand = BASE_MARKET_DEMAND * event.demandMult * PRICE_DEMAND_MULT[priceLevel];
  
  // Step 3: Portfolio bonus
  let diversifyFixedCost = 0;
  if (portfolio.length > 1) {
    demand *= 1.06;
    diversifyFixedCost = DIVERSIFY_FIXED_COST_PER_ROUND * (portfolio.length - 1);
    notes.push(`Bonus diversification: demande +6%`);
  }
  
  // Step 4: Special effects
  if (event.special === "CAPACITY_CHECK" && demand > capacity) {
    const missed = Math.floor(demand - capacity);
    notes.push(`⚠️ Opportunité ratée: ${missed} unités non produites (capacité insuffisante)`);
  }
  
  if (event.special === "BRAND_SHIELD" && brand > 1.2) {
    demand *= 1.05;
    notes.push(`✓ Image forte: résistance à la baisse (+5%)`);
  }
  
  if (event.special === "REGULATORY_PENALTY") {
    const hasPerformance = productInitial === "PERFORMANCE" || portfolio.includes("PERFORMANCE");
    if (hasPerformance) {
      demand *= 0.92;
      notes.push(`⚠️ Produit Performance scruté par la régulation (-8%)`);
    }
    if (quality > 1.2) {
      demand *= 1.04;
      notes.push(`✓ Qualité R&D: conformité facilitée (+4%)`);
    }
  }
  
  // Economic crisis penalty for premium
  if (event.key === "ECON_CRISIS" && priceLevel === "PREMIUM") {
    demand *= 0.88;
    notes.push(`⚠️ Premium en crise: demande réduite (-12%)`);
  }
  
  // Step 5: Capacity constraint
  const unitsSold = Math.min(Math.floor(demand), capacity);
  
  // Step 6: Revenue
  const revenue = unitsSold * PRICE_TABLE[priceLevel].price;
  
  // Step 7: Costs
  const unitCost = BASE_COST_PER_UNIT * (event.costMult ?? 1);
  const prodCosts = unitsSold * unitCost;
  const totalCosts = prodCosts + investmentCost + diversifyFixedCost;
  
  // Step 8: Profit and cash
  const profit = revenue - totalCosts;
  const cashEnd = cash + profit;
  
  if (cashEnd < 0) {
    notes.push(`⚠️ Entreprise en dette!`);
  }
  
  // Step 9: Satisfaction (0-100)
  let satisfaction = 60;
  satisfaction += (quality - 1.0) * 20;
  satisfaction += (brand - 1.0) * 15;
  if (event.key === "ECON_CRISIS" && priceLevel === "PREMIUM") {
    satisfaction -= 8;
  }
  if (priceLevel === "LOW") {
    satisfaction -= 5; // Low price = perceived lower quality
  }
  satisfaction = Math.max(0, Math.min(100, Math.round(satisfaction)));
  
  // Step 10: Market share
  const offerStrength = (quality * 0.45) + (brand * 0.35) + (PRICE_DEMAND_MULT[priceLevel] * 0.20);
  const marketShare = Math.max(0, Math.min(1, offerStrength / (offerStrength + BASE_COMPETITOR_STRENGTH)));
  
  // Build result
  const result: PlayerRoundResult = {
    round,
    event: event.key,
    decision,
    unitsSold,
    revenue: Math.round(revenue),
    costs: Math.round(totalCosts),
    profit: Math.round(profit),
    cashEnd: Math.round(cashEnd),
    marketShare,
    satisfaction,
    notes,
  };
  
  // Update player
  const newHistory = [...player.history, result];
  const newProfitCum = player.profitCum + profit;
  const newSatisfactionAvg = newHistory.reduce((sum, r) => sum + r.satisfaction, 0) / newHistory.length;
  
  const updatedPlayer: Player = {
    ...player,
    cash: Math.round(cashEnd),
    quality,
    brand,
    capacity,
    portfolio,
    lastLever: decision.lever,
    history: newHistory,
    profitCum: Math.round(newProfitCum),
    marketShareLast: marketShare,
    satisfactionAvg: Math.round(newSatisfactionAvg),
  };
  
  return { updatedPlayer, result };
}
