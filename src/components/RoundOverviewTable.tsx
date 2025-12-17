import { Player } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RoundOverviewTableProps {
  players: Player[];
  roundIndex: number;
}

export function RoundOverviewTable({
  players,
  roundIndex,
}: RoundOverviewTableProps) {
  const roundResults = players.map((p) => ({
    player: p,
    result: p.history.find((h) => h.round === roundIndex),
  }));

  return (
    <div className="animate-slide-up">
      <h2 className="font-display text-3xl text-center mb-6">
        Résumé de l'année {roundIndex}
      </h2>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Joueur
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Ventes
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Profit
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Cash
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Part marché
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Satisfaction
              </th>
            </tr>
          </thead>
          <tbody>
            {roundResults.map(({ player, result }) => (
              <tr
                key={player.id}
                className="border-b border-border/50 last:border-0"
              >
                <td className="p-4 font-medium">{player.name}</td>
                <td className="p-4 text-right">
                  {result?.unitsSold.toLocaleString() ?? "-"}
                </td>
                <td
                  className={cn(
                    "p-4 text-right font-display",
                    (result?.profit ?? 0) >= 0 ? "text-energy" : "text-danger"
                  )}
                >
                  {result
                    ? `${
                        result.profit > 0 ? "+" : ""
                      }${result.profit.toLocaleString()}`
                    : "-"}
                  k€
                </td>
                <td
                  className={cn(
                    "p-4 text-right font-display",
                    player.cash >= 0 ? "text-foreground" : "text-danger"
                  )}
                >
                  {player.cash.toLocaleString()}k€
                </td>
                <td className="p-4 text-right">
                  {result ? `${(result.marketShare * 100).toFixed(1)}%` : "-"}
                </td>
                <td className="p-4 text-right">
                  {result?.satisfaction ?? "-"}/100
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
