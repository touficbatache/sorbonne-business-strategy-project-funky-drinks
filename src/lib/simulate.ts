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
  LOAN_RATE_PER_ROUND,
  LOAN_TERM_ROUNDS,
  VARIABLE_LEVER_CONFIG,
} from "./config";

const clampInvestment = (
  lever: keyof typeof VARIABLE_LEVER_CONFIG,
  amount: number
) => {
  const config = VARIABLE_LEVER_CONFIG[lever];
  return Math.min(Math.max(amount, config.min), config.max);
};

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
  const portfolio = [...player.portfolio];
  const qualityStartOfRound = quality;
  const brandStartOfRound = brand;

  let loan = player.loan ? { ...player.loan } : undefined;
  let debtCost = 0;

  if (loan && loan.principalRemaining > 0) {
    const interest = loan.principalRemaining * LOAN_RATE_PER_ROUND;

    // payment = paiement "prévu" (principal fixe) + intérêts implicites via interest calc
    const payment = Math.min(
      loan.payment + interest,
      loan.principalRemaining + interest
    );

    debtCost = payment;

    const principalPaid = Math.max(0, payment - interest);
    loan.principalRemaining = Math.max(
      0,
      loan.principalRemaining - principalPaid
    );

    notes.push(`💳 Service de la dette: -${Math.round(payment)} k€`);

    if (loan.principalRemaining === 0) {
      notes.push(`✅ Prêt remboursé: vous retrouvez plus de flexibilité`);
    }
  }

  // Determine price level (default MID if not PRICE lever)
  let priceLevel: PriceLevel = "MID";
  let investmentCost = 0;

  // Step 1: Apply lever
  switch (decision.lever) {
    case "PRICE":
      priceLevel = decision.price;
      notes.push(
        `Prix ${
          priceLevel === "LOW"
            ? "bas"
            : priceLevel === "PREMIUM"
            ? "premium"
            : "moyen"
        } appliqué`
      );
      break;
    case "RD":
      (() => {
        const investment = clampInvestment("RD", decision.amount);
        const qualityDelta = RD_QUALITY_DELTA * (investment / RD_COST);
        cash -= investment;
        investmentCost = investment;
        quality += qualityDelta;
        notes.push(
          `R&D: qualité +${(qualityDelta * 100).toFixed(0)}% (${investment} k€)`
        );
      })();
      break;
    case "CAPACITY":
      (() => {
        const investment = clampInvestment("CAPACITY", decision.amount);
        const capacityDelta = Math.round(
          CAPACITY_DELTA * (investment / CAPEX_COST)
        );
        cash -= investment;
        investmentCost = investment;
        capacity += capacityDelta;
        notes.push(`Capacité: +${capacityDelta} unités/an (${investment} k€)`);
      })();
      break;
    case "BRAND":
      (() => {
        const investment = clampInvestment("BRAND", decision.amount);
        const brandDelta = BRAND_DELTA * (investment / BRAND_COST);
        cash -= investment;
        investmentCost = investment;
        brand += brandDelta;
        notes.push(
          `Marketing: image +${(brandDelta * 100).toFixed(
            0
          )}% (${investment} k€)`
        );
      })();
      break;
    case "DIVERSIFY":
      (() => {
        const investment = clampInvestment("DIVERSIFY", decision.amount);
        cash -= investment;
        investmentCost = investment;
        portfolio.push(decision.addProduct);
        notes.push(
          `Nouveau produit lancé: ${decision.addProduct} (${investment} k€)`
        );
      })();
      break;
    case "LOAN": {
      const amount = decision.amount;

      if (loan && loan.principalRemaining > 0) {
        notes.push("⚠️ Prêt refusé: un prêt est déjà actif");
        break;
      }

      cash += amount;

      const term = LOAN_TERM_ROUNDS;
      const paymentPrincipal = Math.ceil(amount / term); // principal fixe / round

      loan = {
        principalRemaining: amount,
        payment: paymentPrincipal,
        rate: LOAN_RATE_PER_ROUND,
      };

      notes.push(
        `🏦 Prêt obtenu: +${amount} k€ (remboursement sur ${term} rounds)`
      );
      notes.push(
        "🏦 Financement externe : vous gagnez du cash maintenant, mais vous réduisez votre liberté stratégique sur les prochains rounds."
      );
      break;
    }
  }

  const qualityGainThisRound = Math.max(0, quality - qualityStartOfRound);
  const brandGainThisRound = Math.max(0, brand - brandStartOfRound);

  // Step 2: Calculate base demand
  let demand =
    BASE_MARKET_DEMAND * event.demandMult * PRICE_DEMAND_MULT[priceLevel];

  // Step 3: Portfolio bonus
  let diversifyFixedCost = 0;
  const isDiversified = portfolio.length > 1;
  if (isDiversified) {
    demand *= 1.06;
    diversifyFixedCost =
      DIVERSIFY_FIXED_COST_PER_ROUND * (portfolio.length - 1);
    notes.push(`Bonus diversification: demande +6%`);
  }

  // Step 4: Event-specific conditional effects
  let effectiveCostMult = event.costMult ?? 1;
  const hasProtein = portfolio.includes("PROTEIN");
  const hasBulk = portfolio.includes("BULK");
  const hasPerformance =
    productInitial === "PERFORMANCE" || portfolio.includes("PERFORMANCE");

  // ========== HEATWAVE ==========
  if (event.key === "HEATWAVE") {
    // Capacity check - opportunity missed if demand > capacity
    if (demand > capacity) {
      const missed = Math.floor(demand - capacity);
      notes.push(
        `⚠️ Opportunité ratée: ${missed} unités non produites (capacité insuffisante)`
      );
    }
  }

  // ========== COLD_WINTER ==========
  if (event.key === "COLD_WINTER") {
    // Résilience basée sur amélioration de marque (stratégique, pas arbitraire)
    const brandLevel = Math.max(0, brand - 1.0); // stock de marque accumulé
    const brandBoostFromLevel = Math.min(0.1, brandLevel * 0.7); // cap +10%

    const brandBoostFromThisRound = Math.min(0.12, brandGainThisRound * 1.5); // cap +12%

    const totalBoost = brandBoostFromLevel + brandBoostFromThisRound;

    if (totalBoost > 0.001) {
      demand *= 1 + totalBoost;
      notes.push(
        `✓ Image de marque atténue l’hiver: demande +${Math.round(
          totalBoost * 100
        )}%`
      );
    } else {
      notes.push(
        `💡 Investir en marketing (même un peu) aide à résister aux hivers difficiles`
      );
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
      demand *= 1.1;
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
    // Performance products penalized by regulation
    if (hasPerformance) {
      demand *= 0.88;
      notes.push(`⚠️ Produit Performance scruté par la régulation (-12%)`);
    }

    // R&D improvement mitigates regulatory impact (dynamic, no hard threshold)
    if (qualityGainThisRound > 0) {
      const mitigation = Math.min(
        0.08,
        qualityGainThisRound * 0.7 + Math.max(0, quality - 1.0) * 0.4
      );
      demand *= 1 + mitigation;

      notes.push(
        `✓ Amélioration R&D ce round: conformité renforcée (+${Math.round(
          mitigation * 100
        )}%)`
      );
    } else if (hasPerformance) {
      notes.push(
        `💡 Investir en R&D ce round aurait atténué l'impact de la réglementation`
      );
    }
  }

  // ========== INGREDIENT_TAX ==========
  // costMult is handled below, but add conditional effects
  if (event.key === "INGREDIENT_TAX") {
    // Premium répercute mieux la taxe => effet coût plus faible mais un peu moins de volume
    if (priceLevel === "PREMIUM") {
      effectiveCostMult *= 0.9; // (au lieu de 0.85) évite premium auto-win
      demand *= 0.94;
      notes.push(`✓ Le prix premium absorbe mieux la taxe`);
      notes.push(`⚖️ Premium: marge protégée mais volume légèrement réduit`);
    }

    // Low = marge fine => la taxe fait un peu plus mal
    if (priceLevel === "LOW") {
      effectiveCostMult *= 1.06; // un peu moins violent que 1.08
      notes.push(`⚠️ Prix bas: taxe plus difficile à absorber`);
    }

    // --- R&D / Qualité atténue l'impact de la taxe ---
    // Effet "stratégie" : plus la qualité est élevée OU progresse ce round,
    // plus la taxe pèse moins sur les coûts unitaires (sourcing, formulation, conformité).
    const qualityLevel = Math.max(0, quality - 1.0); // ex: 1.08 => 0.08
    const reliefFromLevel = Math.min(0.12, qualityLevel * 0.8); // cap -12%

    const reliefFromThisRound = Math.min(0.18, qualityGainThisRound * 1.6); // cap -18%

    const totalRelief = Math.min(0.25, reliefFromLevel + reliefFromThisRound); // cap global -25%

    if (totalRelief > 0.001) {
      effectiveCostMult *= 1 - totalRelief;

      // petit bonus de demande (acceptation du surcoût) — optionnel mais logique
      const demandBoost = Math.min(0.06, totalRelief * 0.35); // cap +6%
      demand *= 1 + demandBoost;

      notes.push(
        `✅ R&D/qualité atténue la taxe: coûts -${Math.round(
          totalRelief * 100
        )}%, demande +${Math.round(demandBoost * 100)}%`
      );
    } else {
      notes.push(
        `💡 Investir en R&D (même un peu) réduit l'impact de la taxe sur vos coûts`
      );
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
      notes.push(
        `✓ Gamme diversifiée: meilleure captation de la tendance (+5%)`
      );
    } else {
      notes.push(`💡 Une diversification aurait capté plus de demande`);
    }
  }

  // ========== WELLNESS_WAVE ==========
  if (event.key === "WELLNESS_WAVE") {
    // La vague bien-être favorise les marques qui investissent / progressent en image
    const brandLevel = Math.max(0, brand - 1.0);
    const boostFromLevel = Math.min(0.08, brandLevel * 0.6); // cap +8%
    const boostFromThisRound = Math.min(0.12, brandGainThisRound * 1.8); // cap +12%
    const totalBoost = boostFromLevel + boostFromThisRound; // cap implicite via caps

    if (totalBoost > 0.001) {
      demand *= 1 + totalBoost;
      notes.push(
        `✓ Vague bien-être: votre image de marque porte la demande (+${Math.round(
          totalBoost * 100
        )}%)`
      );
    } else {
      notes.push(
        `💡 Investir en marketing ce round vous ferait mieux profiter de la vague bien-être`
      );
    }

    // Low price damages brand perception (effet cohérent, mais limité)
    if (priceLevel === "LOW") {
      const penalty = 0.02; // -2% plutôt que -3% si tu veux moins punitif
      brand *= 1 - penalty;
      notes.push(
        `⚠️ Prix bas: perception "low-cost" (-${Math.round(
          penalty * 100
        )}% marque)`
      );
    }
  }

  // Step 5A: Market share
  const offerStrength =
    quality * 0.45 + brand * 0.35 + PRICE_DEMAND_MULT[priceLevel] * 0.2;
  const marketShare = Math.max(
    0,
    Math.min(1, offerStrength / (offerStrength + BASE_COMPETITOR_STRENGTH))
  );

  // Step 5B: Demand captured by your company
  const yourDemand = demand * marketShare;
  console.log("yourDemand", yourDemand, demand, marketShare);
  const unitsSold = Math.min(Math.floor(yourDemand), capacity);

  // Step 6: Revenue
  const revenue = (unitsSold * PRICE_TABLE[priceLevel].price) / 1000;

  // Step 7: Costs
  const unitCostEur = BASE_COST_PER_UNIT * effectiveCostMult;
  const prodCosts = (unitsSold * unitCostEur) / 1000;
  const totalCosts = prodCosts + investmentCost + diversifyFixedCost + debtCost;

  // Step 8: Profit and cash
  const profit = revenue - totalCosts;
  const cashEnd = cash + profit;
  console.log("cashend", cashEnd, cash, profit);

  if (cashEnd < 0) {
    notes.push(
      "⚠️ Dette mal maîtrisée : votre trésorerie devient critique, " +
        "ce qui pénalise la satisfaction et la crédibilité de l’entreprise."
    );
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
  const roundsForAvg = newHistory.filter((r) => r.round > 0);
  const newSatisfactionAvg =
    roundsForAvg.length > 0
      ? roundsForAvg.reduce((sum, r) => sum + r.satisfaction, 0) /
        roundsForAvg.length
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
    loan:
      loan && loan.principalRemaining > 0
        ? {
            principalRemaining: Math.round(loan.principalRemaining),
            payment: Math.round(loan.payment),
            rate: loan.rate,
          }
        : undefined,
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
