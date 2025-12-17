import {
  Player,
  PlayerRoundDecision,
  PlayerRoundResult,
  ProductType,
  PriceLevel,
} from "./types";
import { EventDef } from "./events";
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
  
  // Step 2: Calculate base demand
  let demand = BASE_MARKET_DEMAND * event.demandMult * PRICE_DEMAND_MULT[priceLevel];
  
  // Step 3: Portfolio bonus
  let diversifyFixedCost = 0;
  const isDiversified = portfolio.length > 1;
  if (isDiversified) {
    demand *= 1.06;
    diversifyFixedCost = DIVERSIFY_FIXED_COST_PER_ROUND * (portfolio.length - 1);
    notes.push(`Bonus diversification: demande +6%`);
  }
  
  // Step 4: Event-specific conditional effects
  const hasProtein = portfolio.includes("PROTEIN");
  const hasBulk = portfolio.includes("BULK");
  const hasPerformance = productInitial === "PERFORMANCE" || portfolio.includes("PERFORMANCE");
  
  // ========== HEATWAVE ==========
  if (event.key === "HEATWAVE") {
    // Capacity check - opportunity missed if demand > capacity
    if (demand > capacity) {
      const missed = Math.floor(demand - capacity);
      notes.push(`⚠️ Opportunité ratée: ${missed} unités non produites (capacité insuffisante)`);
    }
  }
  
  // ========== COLD_WINTER ==========
  if (event.key === "COLD_WINTER") {
    // Brand shield - strong brand resists the downturn
    if (brand > 1.2) {
      demand *= 1.08;
      notes.push(`✓ Image forte: résistance à la baisse (+8%)`);
    } else {
      notes.push(`💡 Une image de marque > 120% aurait atténué la baisse`);
    }
  }
  
  // ========== ECON_CRISIS ==========
  if (event.key === "ECON_CRISIS") {
    // Premium severely penalized
    if (priceLevel === "PREMIUM") {
      demand *= 0.82;
      notes.push(`⚠️ Premium en crise: demande lourdement réduite (-18%)`);
    }
    // Low price mitigates the crisis effect
    if (priceLevel === "LOW") {
      demand *= 1.10;
      notes.push(`✓ Prix bas attractif en période de crise (+10%)`);
    }
  }
  
  // ========== ECON_RECOVERY ==========
  if (event.key === "ECON_RECOVERY") {
    // Premium slightly favored during recovery
    if (priceLevel === "PREMIUM") {
      demand *= 1.08;
      notes.push(`✓ Le premium profite de la reprise (+8%)`);
    } else if (priceLevel === "LOW") {
      notes.push(`💡 Un prix premium aurait mieux profité de la reprise`);
    }
  }
  
  // ========== NUTRI_LAW ==========
  if (event.key === "NUTRI_LAW") {
    // Performance products penalized
    if (hasPerformance) {
      demand *= 0.88;
      notes.push(`⚠️ Produit Performance scruté par la régulation (-12%)`);
    }
    // High quality mitigates regulatory impact
    if (quality > 1.2) {
      demand *= 1.06;
      notes.push(`✓ Qualité R&D: conformité facilitée (+6%)`);
    } else if (hasPerformance) {
      notes.push(`💡 Une qualité R&D > 120% aurait réduit l'impact réglementaire`);
    }
  }
  
  // ========== INGREDIENT_TAX ==========
  // costMult is handled below, but add conditional effects
  if (event.key === "INGREDIENT_TAX") {
    // Premium can pass costs to consumers
    if (priceLevel === "PREMIUM") {
      notes.push(`✓ Le prix premium absorbe mieux la taxe`);
    }
    // High quality improves perception despite costs
    if (quality > 1.15) {
      demand *= 1.04;
      notes.push(`✓ Qualité perçue: les clients acceptent le surcoût (+4%)`);
    } else {
      notes.push(`💡 Une qualité > 115% améliorerait l'acceptation du surcoût`);
    }
  }
  
  // ========== FITNESS_BOOM ==========
  if (event.key === "FITNESS_BOOM") {
    // Protein and Bulk products benefit
    if (hasProtein || hasBulk) {
      demand *= 1.12;
      notes.push(`✓ Vos produits Protein/Bulk surfent sur la tendance (+12%)`);
    } else {
      notes.push(`💡 Des produits Protein ou Bulk auraient profité du boom`);
    }
    // Diversified companies capture more of the trend
    if (isDiversified) {
      demand *= 1.05;
      notes.push(`✓ Gamme diversifiée: meilleure captation de la tendance (+5%)`);
    } else {
      notes.push(`💡 Une diversification aurait capté plus de demande`);
    }
  }
  
  // ========== WELLNESS_WAVE ==========
  if (event.key === "WELLNESS_WAVE") {
    // Strong brand benefits
    if (brand > 1.15) {
      demand *= 1.10;
      notes.push(`✓ Image de marque forte: vous incarnez le bien-être (+10%)`);
    }
    // Low price damages brand perception
    if (priceLevel === "LOW") {
      brand *= 0.97; // Slight brand damage
      notes.push(`⚠️ Prix bas: image ternie par la perception "low-cost" (-3% marque)`);
    }
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
  
  // Step 9: Satisfaction (0-100) with event-specific modifiers
  let satisfaction = 60;
  satisfaction += (quality - 1.0) * 25;
  satisfaction += (brand - 1.0) * 18;
  
  // Event-specific satisfaction modifiers
  if (event.key === "ECON_CRISIS") {
    if (priceLevel === "PREMIUM") {
      satisfaction -= 10;
      notes.push(`😟 Clients insatisfaits du premium en période difficile`);
    }
    // Strong brand mitigates crisis satisfaction impact
    if (brand > 1.2) {
      satisfaction += 5;
      notes.push(`✓ Image de marque: fidélité client maintenue`);
    }
  }
  
  if (priceLevel === "LOW") {
    satisfaction -= 5; // Low price = perceived lower quality
  }
  
  // Clamp satisfaction 0-100
  satisfaction = Math.max(0, Math.min(100, Math.round(satisfaction)));
  
  // Step 10: Market share
  const offerStrength = (quality * 0.45) + (brand * 0.35) + (PRICE_DEMAND_MULT[priceLevel] * 0.20);
  const marketShare = Math.max(0, Math.min(1, offerStrength / (offerStrength + BASE_COMPETITOR_STRENGTH)));
  
  // Build result with proper rounding
  const result: PlayerRoundResult = {
    round,
    event: event.key,
    decision,
    unitsSold: Math.round(unitsSold),
    revenue: Math.round(revenue),
    costs: Math.round(totalCosts),
    profit: Math.round(profit),
    cashEnd: Math.round(cashEnd),
    marketShare: Math.round(marketShare * 1000) / 1000, // 3 decimal precision
    satisfaction,
    notes,
  };
  
  // Update player
  const newHistory = [...player.history, result];
  const newProfitCum = player.profitCum + profit;
  // Calculate satisfaction average only for rounds > 0 (exclude baseline from avg)
  const roundsForAvg = newHistory.filter(r => r.round > 0);
  const newSatisfactionAvg = roundsForAvg.length > 0 
    ? roundsForAvg.reduce((sum, r) => sum + r.satisfaction, 0) / roundsForAvg.length
    : satisfaction;
  
  const updatedPlayer: Player = {
    ...player,
    cash: Math.round(cashEnd),
    quality: Math.round(quality * 100) / 100, // 2 decimal precision
    brand: Math.round(brand * 100) / 100,
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

// Baseline simulation: uses MID price, no investment
export function simulateBaseline(params: {
  event: EventDef;
  productInitial: ProductType;
  player: Player;
}): { updatedPlayer: Player; result: PlayerRoundResult } {
  return simulateRound({
    round: 0,
    event: params.event,
    productInitial: params.productInitial,
    player: params.player,
    decision: { lever: "PRICE", price: "MID" },
  });
}
