import { PlayerRoundResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Smile,
  PieChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface RoundRecapProps {
  result: PlayerRoundResult;
  playerName: string;
  onContinue: () => void;
}

export function RoundRecap({
  result,
  playerName,
  onContinue,
}: RoundRecapProps) {
  const isProfitable = result.profit > 0;

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="text-center mb-6">
        <h2 className="font-display text-3xl mb-2">
          Résultats de {playerName}
        </h2>
        <p className="text-muted-foreground">Année {result.round}</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<Package className="w-5 h-5" />}
            label="Unités vendues"
            value={result.unitsSold.toLocaleString()}
          />
          <StatCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Revenus"
            value={`${result.revenue.toLocaleString()} k€`}
            color="energy"
          />
          <StatCard
            icon={<TrendingDown className="w-5 h-5" />}
            label="Coûts"
            value={`${result.costs.toLocaleString()} k€`}
            color="warning"
          />
          <StatCard
            icon={
              isProfitable ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )
            }
            label="Profit"
            value={`${
              result.profit > 0 ? "+" : ""
            }${result.profit.toLocaleString()} k€`}
            color={isProfitable ? "energy" : "danger"}
            highlight
          />
          <StatCard
            icon={<PieChart className="w-5 h-5" />}
            label="Part de marché"
            value={`${(result.marketShare * 100).toFixed(1)}%`}
          />
          <StatCard
            icon={<Smile className="w-5 h-5" />}
            label="Satisfaction"
            value={`${result.satisfaction}/100`}
            color={result.satisfaction >= 60 ? "energy" : "warning"}
          />
        </div>

        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between text-lg">
            <span className="text-muted-foreground">Cash disponible</span>
            <span
              className={cn(
                "font-display text-2xl",
                result.cashEnd >= 0 ? "text-energy" : "text-danger"
              )}
            >
              {result.cashEnd.toLocaleString()} k€
            </span>
          </div>
        </div>
      </div>

      {result.notes.length > 0 && (
        <div className="bg-secondary/50 border border-border rounded-xl p-4 mb-6">
          <h4 className="font-medium mb-2">📊 Analyse</h4>
          <ul className="space-y-1">
            {result.notes.map((note, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                • {note}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-center">
        <Button size="lg" onClick={onContinue}>
          Terminer mon tour
        </Button>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: "energy" | "warning" | "danger";
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg",
        highlight ? "bg-primary/10 border border-primary/30" : "bg-secondary/50"
      )}
    >
      <div className="flex items-center gap-2 text-muted-foreground mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <div
        className={cn(
          "font-display text-xl",
          color === "energy" && "text-energy",
          color === "warning" && "text-warning",
          color === "danger" && "text-danger"
        )}
      >
        {value}
      </div>
    </div>
  );
}
