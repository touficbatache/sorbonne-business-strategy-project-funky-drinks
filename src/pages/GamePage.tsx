import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/Shell";
import { Stepper } from "@/components/Stepper";
import { ScoreboardMini } from "@/components/ScoreboardMini";
import { MarketBriefModal } from "@/components/MarketBriefModal";
import { EventBanner } from "@/components/EventBanner";
import { PlayerTurnGate } from "@/components/PlayerTurnGate";
import { LeverPicker } from "@/components/LeverPicker";
import { RoundRecap } from "@/components/RoundRecap";
import { RoundOverviewTable } from "@/components/RoundOverviewTable";
import { Leaderboard } from "@/components/Leaderboard";
import { PlayerStatus } from "@/components/PlayerStatus";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { ArrowRight, RotateCcw } from "lucide-react";

const STEPS = [
  { id: "setup", label: "Joueurs" },
  { id: "product", label: "Produit" },
  { id: "rounds", label: "Rounds" },
  { id: "final", label: "Final" },
];

export default function GamePage() {
  const navigate = useNavigate();
  const {
    phase,
    players,
    currentRound,
    currentPlayerIndex,
    currentResult,
    acknowledgeEvent,
    beginPlayerTurn,
    submitDecision,
    acknowledgeRecap,
    nextRound,
    reset,
  } = useGameStore();

  // Redirect if no game
  useEffect(() => {
    if (players.length === 0) {
      navigate("/");
    }
  }, [players, navigate]);

  if (players.length === 0) return null;

  const currentPlayer = players[currentPlayerIndex];
  const stepIndex = phase === "FINAL" ? 3 : 2;

  return (
    <Shell>
      <div className="container py-8">
        <Stepper steps={STEPS} currentStep={stepIndex} />

        <div className="mt-8 flex gap-8">
          {/* Sidebar - always visible except during gate */}
          {phase !== "PLAYER_GATE" && phase !== "FINAL" && (
            <aside className="hidden lg:block w-64 space-y-4 flex-shrink-0">
              <ScoreboardMini
                players={players}
                currentPlayerId={currentPlayer?.id}
              />
              <MarketBriefModal />
            </aside>
          )}

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* ROUND_EVENT phase */}
            {phase === "ROUND_EVENT" && currentRound && (
              <div className="max-w-2xl mx-auto">
                <EventBanner
                  eventKey={currentRound.event}
                  roundIndex={currentRound.roundIndex}
                />
                <div className="flex justify-center mt-8">
                  <Button size="lg" onClick={acknowledgeEvent}>
                    OK, on continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* PLAYER_GATE phase */}
            {phase === "PLAYER_GATE" && currentPlayer && (
              <PlayerTurnGate
                playerName={currentPlayer.name}
                onReady={beginPlayerTurn}
              />
            )}

            {/* PLAYER_DECISION phase */}
            {phase === "PLAYER_DECISION" && currentPlayer && currentRound && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="font-display text-2xl">Tour de {currentPlayer.name}</h2>
                    <p className="text-muted-foreground text-sm">
                      Année {currentRound.roundIndex} sur 5
                    </p>
                  </div>
                  <EventBanner
                    eventKey={currentRound.event}
                    roundIndex={currentRound.roundIndex}
                    compact
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <LeverPicker player={currentPlayer} onSubmit={submitDecision} />
                  </div>
                  <div>
                    <PlayerStatus player={currentPlayer} />
                  </div>
                </div>
              </div>
            )}

            {/* PLAYER_RECAP phase */}
            {phase === "PLAYER_RECAP" && currentResult && currentPlayer && (
              <RoundRecap
                result={currentResult}
                playerName={currentPlayer.name}
                onContinue={acknowledgeRecap}
              />
            )}

            {/* ROUND_OVERVIEW phase */}
            {phase === "ROUND_OVERVIEW" && currentRound && (
              <div className="max-w-3xl mx-auto">
                <RoundOverviewTable
                  players={players}
                  roundIndex={currentRound.roundIndex}
                />
                <div className="flex justify-center mt-8">
                  <Button size="lg" onClick={nextRound}>
                    {currentRound.roundIndex < 5 ? "Année suivante" : "Voir les résultats"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* FINAL phase */}
            {phase === "FINAL" && (
              <div className="max-w-3xl mx-auto">
                <Leaderboard players={players} />
                <div className="flex justify-center mt-8">
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => {
                      reset();
                      navigate("/setup");
                    }}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Rejouer
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}
