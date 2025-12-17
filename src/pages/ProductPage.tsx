import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Shell } from "@/components/Shell";
import { Stepper } from "@/components/Stepper";
import { CardOption } from "@/components/CardOption";
import { Button } from "@/components/ui/button";
import { useGameStore } from "@/store/gameStore";
import { ProductType } from "@/lib/types";
import { PRODUCT_INFO } from "@/lib/config";
import { ArrowRight } from "lucide-react";

const STEPS = [
  { id: "setup", label: "Joueurs" },
  { id: "product", label: "Produit" },
  { id: "rounds", label: "Rounds" },
  { id: "final", label: "Final" },
];

const PRODUCTS: ProductType[] = ["LEAN", "BULK", "PROTEIN", "PERFORMANCE"];

export default function ProductPage() {
  const navigate = useNavigate();
  const { setProductInitial, startGame, players } = useGameStore();
  const [selected, setSelected] = useState<ProductType | null>(null);

  const handleConfirm = () => {
    if (selected) {
      setProductInitial(selected);
      startGame();
      navigate("/game");
    }
  };

  // Redirect if no players
  if (players.length === 0) {
    navigate("/setup");
    return null;
  }

  return (
    <Shell>
      <div className="container py-8">
        <Stepper steps={STEPS} currentStep={1} />

        <div className="max-w-3xl mx-auto mt-12 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="font-display text-4xl mb-2">Choisissez votre produit</h1>
            <p className="text-muted-foreground">
              Tous les joueurs commencent avec le même produit initial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {PRODUCTS.map((product) => {
              const info = PRODUCT_INFO[product];
              return (
                <CardOption
                  key={product}
                  title={info.name}
                  description={info.description}
                  icon={<span className="text-3xl">{info.icon}</span>}
                  selected={selected === product}
                  onClick={() => setSelected(product)}
                />
              );
            })}
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Confirmer le choix commun
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </Shell>
  );
}
