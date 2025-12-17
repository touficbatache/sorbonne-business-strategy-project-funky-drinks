import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ProductOptionProps {
  title: string;
  description: string;
  image: string;
  selected?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  onClick?: () => void;
  badge?: string;
  className?: string;
}

export function ProductOption({
  title,
  description,
  image,
  selected,
  disabled,
  disabledReason,
  onClick,
  badge,
  className,
}: ProductOptionProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative p-4 rounded-xl border-2 text-left transition-all duration-300",
        "hover:border-primary/50 hover:-translate-y-1",
        selected &&
          "border-primary bg-primary/10 shadow-[0_0_30px_hsl(var(--primary)/0.2)]",
        !selected && !disabled && "border-border bg-card hover:bg-card/80",
        disabled &&
          "opacity-50 cursor-not-allowed hover:translate-y-0 border-border bg-card/50",
        className
      )}
      title={disabled ? disabledReason : undefined}
    >
      {badge && (
        <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full bg-accent text-accent-foreground">
          {badge}
        </span>
      )}

      <div className="flex items-start gap-4">
        <img
          src={`/${image}`}
          alt={title}
          className="w-20 h-20 object-contain"
        />

        <div className="flex-1">
          <h3 className="font-display text-xl mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          {disabled && disabledReason && (
            <p className="text-xs text-destructive mt-2">{disabledReason}</p>
          )}
        </div>
      </div>
    </button>
  );
}
