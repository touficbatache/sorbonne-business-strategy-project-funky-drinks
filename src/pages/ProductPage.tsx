import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shell } from "@/components/Shell";
import { Stepper } from "@/components/Stepper";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { ProductType } from "@/lib/types";
import { PRODUCT_INFO } from "@/lib/config";
import { ArrowRight, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductOption } from "@/components/ProductOption";

const STEPS = [
  { id: "setup", label: "Joueurs" },
  { id: "product", label: "Choix du produit" },
  { id: "rounds", label: "Déroulement du jeu" },
  { id: "final", label: "Résultats" },
];

const PRODUCTS: ProductType[] = ["LEAN", "BULK", "PROTEIN", "PERFORMANCE"];

export default function ProductPage() {
  const navigate = useNavigate();
  const {
    players,
    productVotes,
    submitProductVote,
    getVoteCounts,
    allPlayersVoted,
    finalizeProductVote,
    startGame,
  } = useGameStore();

  const [currentVoterIndex, setCurrentVoterIndex] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(
    null
  );
  const [showingGate, setShowingGate] = useState(true);

  const currentVoter = players[currentVoterIndex];
  const voteCounts = getVoteCounts();
  const allVoted = allPlayersVoted();

  // Redirect if no players
  useEffect(() => {
    if (players.length === 0) {
      navigate("/setup");
    }
  }, [players, navigate]);

  if (players.length === 0) return null;

  const handleVote = () => {
    if (!selectedProduct || !currentVoter) return;

    submitProductVote(currentVoter.id, selectedProduct);

    if (currentVoterIndex < players.length - 1) {
      // More players to vote
      setCurrentVoterIndex(currentVoterIndex + 1);
      setSelectedProduct(null);
      setShowingGate(true);
    }
  };

  const handleStartGate = () => {
    setShowingGate(false);
  };

  const handleConfirmFinal = () => {
    finalizeProductVote();
    startGame();
    navigate("/game");
  };

  // All players voted - show results and confirm
  if (allVoted) {
    const maxVotes = Math.max(...Object.values(voteCounts));
    const winners = PRODUCTS.filter((p) => voteCounts[p] === maxVotes);
    const isTie = winners.length > 1;

    return (
      <Shell>
        <div className="container py-8">
          <Stepper steps={STEPS} currentStep={1} />

          <div className="max-w-2xl mx-auto mt-12 animate-slide-up">
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl mb-2">Résultat du vote</h1>
              <p className="text-muted-foreground">
                {isTie
                  ? "Égalité ! Le produit sera choisi aléatoirement parmi les gagnants."
                  : "Le produit gagnant sera le produit initial de tous les joueurs."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {PRODUCTS.map((product) => {
                const info = PRODUCT_INFO[product];
                const votes = voteCounts[product];
                const isWinner = votes === maxVotes && maxVotes > 0;

                return (
                  <div
                    key={product}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all",
                      isWinner
                        ? "border-primary bg-primary/10"
                        : "border-border bg-card/50"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={`/${info.image}`}
                        alt={info.name}
                        className="w-20 h-20 object-contain"
                      />
                      <span className="font-display text-lg">{info.name}</span>
                      {isWinner && (
                        <Check className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>
                        {votes} vote{votes !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button size="lg" className="w-full" onClick={handleConfirmFinal}>
              Lancer le jeu
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Shell>
    );
  }

  // Voting gate - pass the computer
  if (showingGate && currentVoter) {
    return (
      <Shell>
        <div className="container py-8">
          <Stepper steps={STEPS} currentStep={1} />

          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-primary" />
              </div>

              <h2 className="font-display text-3xl mb-2">Vote du produit</h2>
              <p className="text-muted-foreground mb-4">
                Joueur {currentVoterIndex + 1} sur {players.length}
              </p>

              <div className="bg-card border border-border rounded-xl p-6 mb-8">
                <span className="font-display text-4xl text-primary text-glow">
                  {currentVoter.name}
                </span>
              </div>

              <Button size="lg" onClick={handleStartGate} className="px-8">
                Je suis {currentVoter.name}
              </Button>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // Voting screen
  return (
    <Shell>
      <div className="container py-8">
        <Stepper steps={STEPS} currentStep={1} />

        <div className="max-w-3xl mx-auto mt-12 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl mb-2">
              {currentVoter?.name}, votez pour un produit
            </h1>
            <p className="text-muted-foreground">
              Votant {currentVoterIndex + 1} sur {players.length} • Le produit
              avec le plus de votes sera choisi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {PRODUCTS.map((product) => {
              const info = PRODUCT_INFO[product];
              return (
                <ProductOption
                  key={product}
                  title={info.name}
                  description={info.description}
                  image={info.image}
                  selected={selectedProduct === product}
                  onClick={() => setSelectedProduct(product)}
                />
              );
            })}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleVote}
            disabled={!selectedProduct}
          >
            Confirmer mon vote
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Shell>
  );
}
