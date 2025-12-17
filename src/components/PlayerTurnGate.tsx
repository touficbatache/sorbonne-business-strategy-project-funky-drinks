import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

interface PlayerTurnGateProps {
  playerName: string;
  onReady: () => void;
}

export function PlayerTurnGate({ playerName, onReady }: PlayerTurnGateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
          <User className="w-12 h-12 text-primary" />
        </div>
        
        <h2 className="font-display text-4xl mb-2">Passe l'ordinateur</h2>
        <p className="text-muted-foreground mb-8">
          C'est au tour de...
        </p>
        
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <span className="font-display text-5xl text-primary text-glow">
            {playerName}
          </span>
        </div>
        
        <Button size="lg" onClick={onReady} className="px-8">
          Je suis {playerName}
        </Button>
      </div>
    </div>
  );
}
