import { Player, PlayerRoundResult } from "@/lib/types";
import { PRODUCT_INFO } from "@/lib/config";
import { cn } from "@/lib/utils";

interface PlayerStatusProps {
  player: Player;
  showLastRound?: boolean;
}

export function PlayerStatus({ player, showLastRound = true }: PlayerStatusProps) {
  // Get last round result (either baseline round 0 or last played round)
  const lastResult = player.history.length > 0 
    ? player.history[player.history.length - 1] 
    : null;

  return (
    <div className="space-y-4">
      {/* Current Enterprise Stats */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h4 className="font-display text-lg mb-3">Votre entreprise</h4>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatItem label="Cash" value={`${player.cash}€`} highlight={player.cash < 30} danger={player.cash < 0} />
          <StatItem label="Capacité" value={`${player.capacity.toLocaleString()} u/an`} />
          <StatItem label="Qualité R&D" value={`${(player.quality * 100).toFixed(0)}%`} />
          <StatItem label="Image marque" value={`${(player.brand * 100).toFixed(0)}%`} />
        </div>

        <div>
          <span className="text-xs text-muted-foreground">Portfolio</span>
          <div className="flex flex-wrap gap-2 mt-1">
            {player.portfolio.map((product) => {
              const info = PRODUCT_INFO[product];
              return (
                <span
                  key={product}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-sm"
                >
                  {info.icon} {info.name}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Previous Round KPIs */}
      {showLastRound && lastResult && (
        <div className="bg-secondary/30 border border-border rounded-xl p-4">
          <h4 className="font-display text-sm text-muted-foreground mb-3">
            {lastResult.round === 0 ? "Année de référence (baseline)" : `Résultats Année ${lastResult.round}`}
          </h4>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <KpiItem label="Unités vendues" value={lastResult.unitsSold.toLocaleString()} />
            <KpiItem label="Revenus" value={`${lastResult.revenue.toLocaleString()}€`} />
            <KpiItem label="Coûts" value={`${lastResult.costs.toLocaleString()}€`} />
            <KpiItem 
              label="Profit" 
              value={`${lastResult.profit >= 0 ? '+' : ''}${lastResult.profit.toLocaleString()}€`}
              color={lastResult.profit >= 0 ? "text-energy" : "text-danger"}
            />
            <KpiItem label="Part de marché" value={`${(lastResult.marketShare * 100).toFixed(1)}%`} />
            <KpiItem label="Satisfaction" value={`${lastResult.satisfaction}/100`} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatItem({
  label,
  value,
  highlight,
  danger,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="p-2 rounded-lg bg-secondary/50">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn(
        "font-display text-lg",
        danger && "text-danger",
        highlight && !danger && "text-warning"
      )}>
        {value}
      </div>
    </div>
  );
}

function KpiItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-border/30 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("font-medium", color)}>{value}</span>
    </div>
  );
}
