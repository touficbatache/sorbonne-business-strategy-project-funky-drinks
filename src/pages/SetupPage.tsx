import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/Shell";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGameStore } from "@/store/gameStore";
import { Plus, Trash2, ArrowRight } from "lucide-react";

const STEPS = [
  { id: "setup", label: "Joueurs" },
  { id: "product", label: "Choix du produit" },
  { id: "rounds", label: "Déroulement du jeu" },
  { id: "final", label: "Résultats" },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const { setPlayers, setSeed } = useGameStore();

  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [newName, setNewName] = useState("");

  const addPlayer = () => {
    const name = newName.trim();
    if (name && playerNames.length < 4 && !playerNames.includes(name)) {
      setPlayerNames([...playerNames, name]);
      setNewName("");
    }
  };

  const removePlayer = (index: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    const seed = Date.now().toString(36);
    setSeed(seed);
    setPlayers(playerNames);
    navigate("/product");
  };

  const canContinue = playerNames.length >= 2;

  return (
    <Shell>
      <div className="container py-8">
        <Stepper steps={STEPS} currentStep={0} />

        <div className="max-w-md mx-auto mt-12 animate-slide-up">
          <h1 className="font-display text-4xl text-center mb-8">
            Créer les joueurs
          </h1>

          <div className="space-y-4 mb-8">
            <div className="flex gap-2">
              <Input
                placeholder="Nom du joueur"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                maxLength={20}
              />
              <Button
                onClick={addPlayer}
                disabled={!newName.trim() || playerNames.length >= 4}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {playerNames.length}/4 joueurs (minimum 2)
            </p>
          </div>

          {playerNames.length > 0 && (
            <div className="space-y-2 mb-8 animate-fade-in">
              {playerNames.map((name, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-card border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-display text-primary">
                      {index + 1}
                    </span>
                    <span className="font-medium">{name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removePlayer(index)}
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={handleContinue}
            disabled={!canContinue}
          >
            Continuer
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {!canContinue && playerNames.length > 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Ajoutez au moins {2 - playerNames.length} joueur
              {2 - playerNames.length > 1 ? "s" : ""} de plus
            </p>
          )}
        </div>
      </div>
    </Shell>
  );
}
