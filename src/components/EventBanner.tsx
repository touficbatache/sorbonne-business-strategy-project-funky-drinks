import { EventKey, EventCategory } from "@/lib/types";
import { EVENTS, CATEGORY_INFO } from "@/lib/events";
import { cn } from "@/lib/utils";

interface EventBannerProps {
  eventKey: EventKey;
  roundIndex: number;
  compact?: boolean;
}

export function EventBanner({
  eventKey,
  roundIndex,
  compact,
}: EventBannerProps) {
  const event = EVENTS[eventKey];
  const categoryInfo = CATEGORY_INFO[event.category];

  if (compact) {
    return (
      <div
        className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border"
        title={event.description}
      >
        <span className="text-xl">{categoryInfo.icon}</span>
        <div>
          <span className="text-sm font-medium">{event.title}</span>
          <span className="text-xs text-muted-foreground ml-2">
            Année {roundIndex}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      <div className="text-center mb-4">
        <span className="text-sm text-muted-foreground">
          Année {roundIndex} sur 5
        </span>
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium",
              event.category === "CLIMATE" && "bg-info/20 text-info",
              event.category === "ECONOMY" && "bg-warning/20 text-warning",
              event.category === "REGULATION" && "bg-danger/20 text-danger",
              event.category === "TRENDS" && "bg-energy/20 text-energy"
            )}
          >
            {categoryInfo.icon} {categoryInfo.name}
          </span>
        </div>

        <h2 className="font-display text-4xl text-center mb-4">
          {event.title}
        </h2>

        <p className="text-center text-muted-foreground text-lg">
          {event.description}
        </p>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm">
          <div
            className={cn(
              "px-3 py-1.5 rounded-lg",
              event.demandMult > 1
                ? "bg-energy/20 text-energy"
                : "bg-danger/20 text-danger"
            )}
          >
            Demande: {event.demandMult > 1 ? "+" : ""}
            {((event.demandMult - 1) * 100).toFixed(0)}%
          </div>
          {event.costMult && event.costMult !== 1 && (
            <div className="px-3 py-1.5 rounded-lg bg-warning/20 text-warning">
              Coûts: +{((event.costMult - 1) * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
