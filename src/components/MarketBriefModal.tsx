import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { BASE_MARKET_DEMAND, LEVER_INFO, PRODUCT_INFO } from "@/lib/config";
import { CATEGORY_INFO } from "@/lib/events";
import { LeverKey } from "@/lib/types";

export function MarketBriefModal() {
  const leverEntries = Object.entries(LEVER_INFO) as Array<
    [LeverKey, (typeof LEVER_INFO)[LeverKey]]
  >;

  const formatCostLabel = (info: (typeof LEVER_INFO)[LeverKey]) => {
    if (info.variableCost) {
      const { min, max } = info.variableCost;
      return `${min}-${max} k€`;
    }
    if (info.cost > 0) {
      return `${info.cost} k€`;
    }
    return null;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BookOpen className="w-4 h-4 mr-2" />
          Market Brief
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            Market Brief
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <section>
            <h3 className="font-display text-xl mb-2">📊 Le Marché</h3>
            <p className="text-muted-foreground text-sm">
              Le marché de la nutrition sportive représente{" "}
              <strong className="text-foreground">
                {BASE_MARKET_DEMAND.toLocaleString()} unités/an
              </strong>
              . Vous êtes en concurrence avec d'autres acteurs établis. Votre
              objectif : maximiser votre rentabilité sur 5 ans.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl mb-2">🎯 Segments Produits</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PRODUCT_INFO).map(([key, info]) => (
                <div key={key} className="p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span>{info.icon}</span>
                    <span className="font-medium text-sm">{info.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {info.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display text-xl mb-2">
              ⚡ Leviers Stratégiques
            </h3>
            <div className="space-y-2">
              {leverEntries.map(([key, info]) => {
                const costLabel = formatCostLabel(info);
                return (
                  <div
                    key={key}
                    className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30"
                  >
                    <span className="text-xl">{info.icon}</span>
                    <div className="flex-1">
                      <span className="font-medium text-sm">{info.name}</span>
                      <p className="text-xs text-muted-foreground">
                        {info.description}
                      </p>
                    </div>
                    {costLabel && (
                      <span className="text-xs text-accent">{costLabel}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              ⚠️ Règle : vous ne pouvez pas choisir le même levier deux rounds
              de suite.
            </p>
          </section>

          <section>
            <h3 className="font-display text-xl mb-2">🌍 Événements</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Chaque année, un événement aléatoire impacte le marché. Anticipez
              et adaptez-vous !
            </p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                <span
                  key={key}
                  className="px-3 py-1 rounded-full text-xs bg-secondary"
                >
                  {info.icon} {info.name}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display text-xl mb-2">🏆 Objectif</h3>
            <p className="text-muted-foreground text-sm">
              Après 5 années, le joueur avec le{" "}
              <strong className="text-primary">
                profit cumulé le plus élevé
              </strong>{" "}
              gagne. Mais attention aux indicateurs secondaires : part de marché
              et satisfaction client peuvent faire la différence !
            </p>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
