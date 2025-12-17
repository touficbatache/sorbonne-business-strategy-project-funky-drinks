import { Shell } from "@/components/Shell";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  BASE_MARKET_DEMAND,
  LEVER_INFO,
  PRODUCT_INFO,
  TOTAL_ROUNDS,
  STARTING_CASH,
  START_CAPACITY,
} from "@/lib/config";
import { CATEGORY_INFO, ALL_EVENTS } from "@/lib/events";
import { ArrowLeft, Play } from "lucide-react";

export default function RulesPage() {
  const navigate = useNavigate();

  return (
    <Shell>
      <div className="container py-8 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>

        <h1 className="font-display text-5xl mb-8 text-glow">Règles & Market Brief</h1>

        <div className="space-y-12">
          {/* Introduction */}
          <section className="animate-slide-up">
            <h2 className="font-display text-3xl mb-4">🎯 Objectif</h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <p className="text-lg text-muted-foreground">
                Vous dirigez une entreprise de nutrition sportive. En <strong className="text-foreground">{TOTAL_ROUNDS} années</strong> (rounds),
                maximisez votre <strong className="text-primary">profit cumulé</strong> tout en gérant vos ressources et en vous adaptant
                aux événements du marché.
              </p>
            </div>
          </section>

          {/* Market */}
          <section className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <h2 className="font-display text-3xl mb-4">📊 Le Marché</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="font-display text-4xl text-primary">{BASE_MARKET_DEMAND.toLocaleString()}</div>
                <div className="text-muted-foreground">Unités/an</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="font-display text-4xl text-accent">{STARTING_CASH}€</div>
                <div className="text-muted-foreground">Cash initial</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <div className="font-display text-4xl text-info">{START_CAPACITY.toLocaleString()}</div>
                <div className="text-muted-foreground">Capacité initiale</div>
              </div>
            </div>
          </section>

          {/* Products */}
          <section className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <h2 className="font-display text-3xl mb-4">🥤 Segments Produits</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(PRODUCT_INFO).map(([key, info]) => (
                <div key={key} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-secondary flex items-center justify-center text-3xl">
                    {info.icon}
                  </div>
                  <div>
                    <div className="font-display text-xl">{info.name}</div>
                    <div className="text-sm text-muted-foreground">{info.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Levers */}
          <section className="animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <h2 className="font-display text-3xl mb-4">⚡ Leviers Stratégiques</h2>
            <p className="text-muted-foreground mb-4">
              Chaque round, choisissez <strong className="text-foreground">UN seul levier</strong>.
            </p>
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 mb-4">
              <p className="text-warning text-sm">
                ⚠️ <strong>Règle importante :</strong> Vous ne pouvez pas choisir le même levier deux rounds de suite !
              </p>
            </div>
            <div className="space-y-3">
              {Object.entries(LEVER_INFO).map(([key, info]) => (
                <div key={key} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center text-2xl">
                    {info.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{info.name}</div>
                    <div className="text-sm text-muted-foreground">{info.description}</div>
                  </div>
                  {info.cost > 0 && (
                    <div className="text-accent font-display text-lg">{info.cost}€</div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Events */}
          <section className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <h2 className="font-display text-3xl mb-4">🌍 Événements</h2>
            <p className="text-muted-foreground mb-4">
              Chaque année, un événement aléatoire impacte le marché. Les événements ne se répètent jamais dans une partie.
            </p>
            
            <div className="mb-6">
              <h3 className="font-display text-xl mb-3">Catégories</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <span
                    key={key}
                    className="px-4 py-2 rounded-lg bg-secondary text-sm"
                  >
                    {info.icon} {info.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ALL_EVENTS.map((event) => {
                const catInfo = CATEGORY_INFO[event.category];
                return (
                  <div key={event.key} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{catInfo.icon}</span>
                      <span className="font-medium">{event.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${event.demandMult > 1 ? "bg-energy/20 text-energy" : "bg-danger/20 text-danger"}`}>
                        Demande {event.demandMult > 1 ? "+" : ""}{((event.demandMult - 1) * 100).toFixed(0)}%
                      </span>
                      {event.costMult && event.costMult !== 1 && (
                        <span className="text-xs px-2 py-0.5 rounded bg-warning/20 text-warning">
                          Coûts +{((event.costMult - 1) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Scoring */}
          <section className="animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <h2 className="font-display text-3xl mb-4">🏆 Scoring</h2>
            <div className="bg-card border border-border rounded-xl p-6">
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Profit cumulé :</strong> Critère principal pour déterminer le gagnant</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Part de marché :</strong> Votre force face à la concurrence</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Satisfaction :</strong> Impact de votre qualité et image sur les clients</span>
                </li>
              </ul>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center pt-8">
            <Button size="lg" onClick={() => navigate("/setup")}>
              <Play className="w-5 h-5 mr-2" />
              Commencer une partie
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
