import { Player, ProductType } from "@/lib/types";
import { PRODUCT_INFO } from "@/lib/config";
import { cn } from "@/lib/utils";

interface PlayerStatusProps {
  player: Player;
}

export function PlayerStatus({ player }: PlayerStatusProps) {
  return (
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
