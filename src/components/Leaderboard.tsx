import { Player } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Trophy, TrendingUp, PieChart, Smile } from "lucide-react";
import { useState } from "react";

interface LeaderboardProps {
  players: Player[];
}

type SortKey = "profit" | "marketShare" | "satisfaction";

export function Leaderboard({ players }: LeaderboardProps) {
  const [sortKey, setSortKey] = useState<SortKey>("profit");

  const sortedPlayers = [...players].sort((a, b) => {
    switch (sortKey) {
      case "profit":
        return b.profitCum - a.profitCum;
      case "marketShare":
        return b.marketShareLast - a.marketShareLast;
      case "satisfaction":
        return b.satisfactionAvg - a.satisfactionAvg;
    }
  });

  const winner = sortedPlayers[0];

  const getProfile = (player: Player) => {
    const profitRank = [...players]
      .sort((a, b) => b.profitCum - a.profitCum)
      .indexOf(player);
    const shareRank = [...players]
      .sort((a, b) => b.marketShareLast - a.marketShareLast)
      .indexOf(player);
    const satRank = [...players]
      .sort((a, b) => b.satisfactionAvg - a.satisfactionAvg)
      .indexOf(player);

    if (profitRank === 0 && shareRank <= 1)
      return { label: "Rentabilité", color: "text-energy" };
    if (shareRank === 0) return { label: "Croissance", color: "text-info" };
    if (satRank === 0) return { label: "Qualité", color: "text-accent" };
    return { label: "Équilibré", color: "text-muted-foreground" };
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 mb-4">
          <Trophy className="w-10 h-10 text-accent" />
        </div>
        <h2 className="font-display text-4xl mb-2">Partie terminée !</h2>
        <p className="text-muted-foreground">
          {winner.name} remporte la partie
        </p>
      </div>

      <div className="flex justify-center gap-2">
        <SortButton
          active={sortKey === "profit"}
          onClick={() => setSortKey("profit")}
          icon={<TrendingUp className="w-4 h-4" />}
          label="Profit"
        />
        <SortButton
          active={sortKey === "marketShare"}
          onClick={() => setSortKey("marketShare")}
          icon={<PieChart className="w-4 h-4" />}
          label="Part marché"
        />
        <SortButton
          active={sortKey === "satisfaction"}
          onClick={() => setSortKey("satisfaction")}
          icon={<Smile className="w-4 h-4" />}
          label="Satisfaction"
        />
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                #
              </th>
              <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                Joueur
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Profit total
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Part marché
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Satisfaction
              </th>
              <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                Profil
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => {
              const profile = getProfile(player);
              return (
                <tr
                  key={player.id}
                  className={cn(
                    "border-b border-border/50 last:border-0",
                    index === 0 && "bg-primary/5"
                  )}
                >
                  <td className="p-4">
                    {index === 0 ? (
                      <span className="text-accent">🏆</span>
                    ) : index === 1 ? (
                      <span>🥈</span>
                    ) : index === 2 ? (
                      <span>🥉</span>
                    ) : (
                      <span className="text-muted-foreground">{index + 1}</span>
                    )}
                  </td>
                  <td className="p-4 font-medium">{player.name}</td>
                  <td
                    className={cn(
                      "p-4 text-right font-display text-lg",
                      player.profitCum >= 0 ? "text-energy" : "text-danger"
                    )}
                  >
                    {player.profitCum > 0 ? "+" : ""}
                    {player.profitCum.toLocaleString()}
                  </td>
                  <td className="p-4 text-right">
                    {(player.marketShareLast * 100).toFixed(1)}%
                  </td>
                  <td className="p-4 text-right">
                    {player.satisfactionAvg}/100
                  </td>
                  <td className="p-4 text-right">
                    <span className={cn("text-sm", profile.color)}>
                      {profile.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary hover:bg-secondary/80"
      )}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
}
