import { useState } from "react";
import {
  Player,
  LeverKey,
  PriceLevel,
  ProductType,
  PlayerRoundDecision,
} from "@/lib/types";
import { LEVER_INFO, PRODUCT_INFO, VARIABLE_LEVER_CONFIG } from "@/lib/config";
import { CardOption } from "./CardOption";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface LeverPickerProps {
  player: Player;
  onSubmit: (decision: PlayerRoundDecision) => void;
}

const LEVERS: LeverKey[] = [
  "PRICE",
  "RD",
  "CAPACITY",
  "BRAND",
  "DIVERSIFY",
  "LOAN",
];
const PRICE_LEVELS: PriceLevel[] = ["LOW", "MID", "PREMIUM"];
const ALL_PRODUCTS: ProductType[] = ["LEAN", "BULK", "PROTEIN", "PERFORMANCE"];

type VariableLever = keyof typeof VARIABLE_LEVER_CONFIG;

const VARIABLE_LEVER_KEYS = Object.keys(
  VARIABLE_LEVER_CONFIG
) as VariableLever[];

const INVESTMENT_COPY: Record<
  VariableLever,
  { title: string; description: string }
> = {
  RD: {
    title: "Budget R&D",
    description: "Choisissez l'intensité de votre effort de recherche.",
  },
  CAPACITY: {
    title: "Budget Capacité",
    description:
      "Plus l'investissement est élevé, plus vous augmentez votre volume de production.",
  },
  BRAND: {
    title: "Budget Marketing",
    description:
      "Investissez pour renforcer votre image de marque et la perception client.",
  },
  DIVERSIFY: {
    title: "Budget Lancement",
    description: "Fixez le budget d'introduction pour votre nouveau produit.",
  },
};

const isVariableLever = (lever: LeverKey): lever is VariableLever =>
  Object.prototype.hasOwnProperty.call(VARIABLE_LEVER_CONFIG, lever);

const PRICE_LABELS: Record<PriceLevel, { label: string; desc: string }> = {
  LOW: { label: "Prix Bas", desc: "Volume max, marge réduite" },
  MID: { label: "Prix Moyen", desc: "Équilibre volume/marge" },
  PREMIUM: { label: "Prix Premium", desc: "Marge max, volume limité" },
};

const LOAN_AMOUNTS = [150, 300] as const;

export function LeverPicker({ player, onSubmit }: LeverPickerProps) {
  const [investments, setInvestments] = useState<Record<VariableLever, number>>(
    () =>
      VARIABLE_LEVER_KEYS.reduce((acc, lever) => {
        acc[lever] = VARIABLE_LEVER_CONFIG[lever].defaultValue;
        return acc;
      }, {} as Record<VariableLever, number>)
  );
  const [selectedLever, setSelectedLever] = useState<LeverKey | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<PriceLevel>("MID");
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [selectedLoanAmount, setSelectedLoanAmount] = useState<
    (typeof LOAN_AMOUNTS)[number] | null
  >(LOAN_AMOUNTS[0]);

  const getMinimumCost = (lever: LeverKey) => {
    if (isVariableLever(lever)) {
      return VARIABLE_LEVER_CONFIG[lever].min;
    }
    return LEVER_INFO[lever].cost ?? 0;
  };

  const getInvestmentValue = (lever: VariableLever) => {
    const config = VARIABLE_LEVER_CONFIG[lever];
    const max = Math.min(config.max, player.cash);
    return Math.min(Math.max(investments[lever], config.min), max);
  };

  const updateInvestment = (lever: VariableLever, value: number) => {
    setInvestments((prev) => ({ ...prev, [lever]: value }));
  };

  const getCostBadge = (lever: LeverKey) => {
    if (isVariableLever(lever)) {
      const { min, max } = VARIABLE_LEVER_CONFIG[lever];
      return `${min}k€-${max}k€`;
    }
    const cost = LEVER_INFO[lever].cost;
    return cost > 0 ? `${cost}k€` : undefined;
  };

  const canAfford = (lever: LeverKey) => {
    if (lever === "PRICE" || lever === "LOAN") return true;
    return player.cash >= getMinimumCost(lever);
  };

  const isDisabled = (lever: LeverKey) => {
    if (player.lastLever === lever) return "Interdit deux rounds de suite";
    if (!canAfford(lever))
      return `Cash insuffisant (${getMinimumCost(lever)} k€ requis)`;
    // Diversify disabled if all products owned
    if (lever === "DIVERSIFY") {
      const availableProducts = ALL_PRODUCTS.filter(
        (p) => !player.portfolio.includes(p)
      );
      if (availableProducts.length === 0)
        return "Tous les produits déjà détenus";
    }
    return null;
  };

  const availableProducts = ALL_PRODUCTS.filter(
    (p) => !player.portfolio.includes(p)
  );

  const renderInvestmentSlider = (lever: VariableLever) => {
    const config = VARIABLE_LEVER_CONFIG[lever];
    const max = Math.min(config.max, player.cash);
    if (max < config.min) return null;

    const value = getInvestmentValue(lever);

    return (
      <div className="animate-slide-up">
        <h4 className="font-display text-xl mb-1">
          {INVESTMENT_COPY[lever].title}
        </h4>
        <p className="text-sm text-muted-foreground mb-3">
          {INVESTMENT_COPY[lever].description}
        </p>
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Budget</span>
            <span className="font-display text-2xl text-primary">
              {value} k€
            </span>
          </div>
          <Slider
            value={[value]}
            min={config.min}
            max={max}
            step={config.step}
            onValueChange={([val]) =>
              updateInvestment(
                lever,
                Math.min(Math.max(val ?? config.min, config.min), max)
              )
            }
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{config.min} k€</span>
            <span>{max} k€</span>
          </div>
        </div>
      </div>
    );
  };

  const handleSubmit = () => {
    if (!selectedLever) return;

    let decision: PlayerRoundDecision;

    if (selectedLever === "PRICE") {
      decision = { lever: "PRICE", price: selectedPrice };
    } else if (selectedLever === "DIVERSIFY") {
      if (!selectedProduct) return;
      decision = {
        lever: "DIVERSIFY",
        addProduct: selectedProduct,
        amount: getInvestmentValue("DIVERSIFY"),
      };
    } else if (selectedLever === "LOAN") {
      if (!selectedLoanAmount) return;
      decision = { lever: "LOAN", amount: selectedLoanAmount };
    } else if (selectedLever === "RD") {
      decision = { lever: "RD", amount: getInvestmentValue("RD") };
    } else if (selectedLever === "CAPACITY") {
      decision = {
        lever: "CAPACITY",
        amount: getInvestmentValue("CAPACITY"),
      };
    } else if (selectedLever === "BRAND") {
      decision = { lever: "BRAND", amount: getInvestmentValue("BRAND") };
    } else {
      decision = { lever: selectedLever };
    }

    onSubmit(decision);
  };

  const canSubmit = () => {
    if (!selectedLever) return false;
    if (selectedLever === "DIVERSIFY" && !selectedProduct) return false;
    if (selectedLever === "LOAN" && !selectedLoanAmount) return false;
    return true;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="font-display text-2xl mb-4">
          Choisissez votre levier stratégique
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LEVERS.map((lever) => {
            const info = LEVER_INFO[lever];
            const disabledReason = isDisabled(lever);

            return (
              <CardOption
                key={lever}
                title={info.name}
                description={info.description}
                icon={<span>{info.icon}</span>}
                selected={selectedLever === lever}
                disabled={!!disabledReason}
                disabledReason={disabledReason || undefined}
                onClick={() => {
                  setSelectedLever(lever);
                  // Reset sub-selections when changing lever
                  if (lever !== "DIVERSIFY") setSelectedProduct(null);
                }}
                badge={getCostBadge(lever)}
              />
            );
          })}
        </div>
      </div>

      {selectedLever &&
        isVariableLever(selectedLever) &&
        selectedLever !== "DIVERSIFY" &&
        renderInvestmentSlider(selectedLever)}

      {selectedLever === "PRICE" && (
        <div className="animate-slide-up">
          <h4 className="font-display text-xl mb-3">Niveau de prix</h4>
          <div className="grid grid-cols-3 gap-3">
            {PRICE_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedPrice(level)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-center",
                  selectedPrice === level
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className="font-display text-lg">
                  {PRICE_LABELS[level].label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {PRICE_LABELS[level].desc}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedLever === "DIVERSIFY" && (
        <div className="animate-slide-up">
          <h4 className="font-display text-xl mb-3">
            Nouveau produit à lancer
          </h4>
          {availableProducts.length === 0 ? (
            <p className="text-muted-foreground">
              Vous avez déjà tous les produits !
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_PRODUCTS.map((product) => {
                const info = PRODUCT_INFO[product];
                const isOwned = player.portfolio.includes(product);

                return (
                  <button
                    key={product}
                    onClick={() => !isOwned && setSelectedProduct(product)}
                    disabled={isOwned}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all text-left flex items-center gap-3",
                      isOwned
                        ? "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
                        : selectedProduct === product
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <div className="font-medium">
                        {info.name}
                        {isOwned && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (déjà détenu)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {info.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {availableProducts.length > 0 && (
            <div className="mt-6">{renderInvestmentSlider("DIVERSIFY")}</div>
          )}
        </div>
      )}

      {selectedLever === "LOAN" && (
        <div className="animate-slide-up">
          <h4 className="font-display text-xl mb-3">Choisir un financement</h4>

          {player.loan?.principalRemaining > 0 ? (
            <p className="text-muted-foreground">
              Vous avez déjà un prêt en cours. Vous devez le rembourser avant
              d’en contracter un nouveau.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {LOAN_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSelectedLoanAmount(amount)}
                  className={cn(
                    "p-4 rounded-lg border-2 transition-all text-left",
                    "border-border hover:border-primary/50",
                    selectedLoanAmount === amount
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="font-display text-lg">+{amount} k€</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Prêt bancaire avec remboursement sur plusieurs rounds
                  </div>
                </button>
              ))}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-3">
            ⚠️ Un prêt apporte du cash immédiat mais réduit votre flexibilité
            future (remboursement automatique chaque année).
          </p>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button size="lg" onClick={handleSubmit} disabled={!canSubmit()}>
          Valider ma décision
        </Button>
      </div>
    </div>
  );
}
