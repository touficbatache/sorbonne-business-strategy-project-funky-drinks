import { useState } from "react";
import { Player, LeverKey, PriceLevel, ProductType, PlayerRoundDecision } from "@/lib/types";
import { LEVER_INFO, PRODUCT_INFO } from "@/lib/config";
import { CardOption } from "./CardOption";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LeverPickerProps {
  player: Player;
  onSubmit: (decision: PlayerRoundDecision) => void;
}

const LEVERS: LeverKey[] = ["PRICE", "RD", "CAPACITY", "BRAND", "DIVERSIFY"];
const PRICE_LEVELS: PriceLevel[] = ["LOW", "MID", "PREMIUM"];
const ALL_PRODUCTS: ProductType[] = ["LEAN", "BULK", "PROTEIN", "PERFORMANCE"];

const PRICE_LABELS: Record<PriceLevel, { label: string; desc: string }> = {
  LOW: { label: "Prix Bas", desc: "Volume max, marge réduite" },
  MID: { label: "Prix Moyen", desc: "Équilibre volume/marge" },
  PREMIUM: { label: "Prix Premium", desc: "Marge max, volume limité" },
};

export function LeverPicker({ player, onSubmit }: LeverPickerProps) {
  const [selectedLever, setSelectedLever] = useState<LeverKey | null>(null);
  const [selectedPrice, setSelectedPrice] = useState<PriceLevel>("MID");
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const canAfford = (lever: LeverKey) => {
    if (lever === "PRICE") return true;
    return player.cash >= LEVER_INFO[lever].cost;
  };

  const isDisabled = (lever: LeverKey) => {
    if (player.lastLever === lever) return "Interdit deux rounds de suite";
    if (!canAfford(lever)) return `Cash insuffisant (${LEVER_INFO[lever].cost}€ requis)`;
    // Diversify disabled if all products owned
    if (lever === "DIVERSIFY") {
      const availableProducts = ALL_PRODUCTS.filter((p) => !player.portfolio.includes(p));
      if (availableProducts.length === 0) return "Tous les produits déjà détenus";
    }
    return null;
  };

  const availableProducts = ALL_PRODUCTS.filter((p) => !player.portfolio.includes(p));

  const handleSubmit = () => {
    if (!selectedLever) return;

    let decision: PlayerRoundDecision;

    if (selectedLever === "PRICE") {
      decision = { lever: "PRICE", price: selectedPrice };
    } else if (selectedLever === "DIVERSIFY") {
      if (!selectedProduct) return;
      decision = { lever: "DIVERSIFY", addProduct: selectedProduct };
    } else {
      decision = { lever: selectedLever };
    }

    onSubmit(decision);
  };

  const canSubmit = () => {
    if (!selectedLever) return false;
    if (selectedLever === "DIVERSIFY" && !selectedProduct) return false;
    return true;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h3 className="font-display text-2xl mb-4">Choisissez votre levier stratégique</h3>
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
                badge={info.cost > 0 ? `${info.cost}€` : undefined}
              />
            );
          })}
        </div>
      </div>

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
                <div className="font-display text-lg">{PRICE_LABELS[level].label}</div>
                <div className="text-xs text-muted-foreground">{PRICE_LABELS[level].desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedLever === "DIVERSIFY" && (
        <div className="animate-slide-up">
          <h4 className="font-display text-xl mb-3">Nouveau produit à lancer</h4>
          {availableProducts.length === 0 ? (
            <p className="text-muted-foreground">Vous avez déjà tous les produits !</p>
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
                        {isOwned && <span className="text-xs text-muted-foreground ml-2">(déjà détenu)</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{info.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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
