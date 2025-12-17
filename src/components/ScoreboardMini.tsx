import { Player } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ScoreboardMiniProps {
  players: Player[];
  currentPlayerId?: string;
  minimal?: boolean; // Hide detailed stats for privacy
}

export function ScoreboardMini({
  players,
  currentPlayerId,
  minimal = false,
}: ScoreboardMiniProps) {
  return (
    <div className="bg-card/50 border border-border rounded-xl p-4">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">
        {minimal ? "Joueurs" : "Scores"}
      </h4>
      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={player.id}
            className={cn(
              "flex items-center justify-between p-2 rounded-lg transition-colors",
              currentPlayerId === player.id &&
                "bg-primary/10 border border-primary/30"
            )}
          >
            <span className="font-medium truncate max-w-[100px]">
              {player.name}
            </span>
            {!minimal && (
              <div className="flex items-center gap-3 text-sm">
                <span
                  className={cn(
                    player.cash >= 0 ? "text-energy" : "text-danger"
                  )}
                >
                  {player.cash.toLocaleString()} k€
                </span>
                <span className="text-muted-foreground">
                  {(player.marketShareLast * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
