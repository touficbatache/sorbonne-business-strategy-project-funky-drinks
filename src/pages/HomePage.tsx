import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { useNavigate } from "react-router-dom";
import { Zap, Play, BookOpen, RotateCcw } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { phase, players, reset } = useGameStore();
  
  const hasActiveGame = phase !== "HOME" && phase !== "SETUP" && players.length > 0;

  const handleNewGame = () => {
    reset();
    navigate("/setup");
  };

  return (
    <Shell>
      <div className="container py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8 animate-slide-up">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-primary/20 mb-6 animate-pulse-glow">
              <Zap className="w-14 h-14 text-primary" />
            </div>
            <h1 className="font-display text-6xl mb-4 text-glow">POWERFUEL</h1>
            <p className="text-xl text-muted-foreground">
              Le jeu de stratégie business où vous dirigez une entreprise de nutrition sportive
            </p>
          </div>

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {hasActiveGame && (
              <Button
                size="lg"
                className="w-full max-w-xs"
                onClick={() => navigate("/game")}
              >
                <Play className="w-5 h-5 mr-2" />
                Reprendre la partie
              </Button>
            )}
            
            <Button
              size="lg"
              variant={hasActiveGame ? "outline" : "default"}
              className="w-full max-w-xs"
              onClick={handleNewGame}
            >
              {hasActiveGame ? (
                <>
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Nouvelle partie
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Commencer une partie
                </>
              )}
            </Button>
            
            <Button
              size="lg"
              variant="ghost"
              className="w-full max-w-xs"
              onClick={() => navigate("/rules")}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Règles & Marché
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div>
              <div className="font-display text-3xl text-primary">2-4</div>
              <div className="text-sm text-muted-foreground">Joueurs</div>
            </div>
            <div>
              <div className="font-display text-3xl text-primary">15-20</div>
              <div className="text-sm text-muted-foreground">Minutes</div>
            </div>
            <div>
              <div className="font-display text-3xl text-primary">5</div>
              <div className="text-sm text-muted-foreground">Années</div>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
