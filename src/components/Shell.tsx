import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, Home } from "lucide-react";

interface ShellProps {
  children: ReactNode;
}

export function Shell({ children }: ShellProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      {/* <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display text-2xl tracking-wide">
              POWERFUEL
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {!isGame && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Accueil
                </Link>
              </Button>
            )}
            <Button variant="ghost" size="sm" asChild>
              <Link to="/rules">
                <BookOpen className="w-4 h-4 mr-2" />
                Règles
              </Link>
            </Button>
          </nav>
        </div>
      </header> */}

      {!isHome && (
        <Link to="/" className="absolute top-6 left-6 z-10">
          <img src="/logo.png" alt="FunkyDrinks home" className="h-20 w-auto" />
        </Link>
      )}

      <Button
        className="absolute top-6 right-6 z-10"
        variant="ghost"
        size="sm"
        asChild
      >
        <Link to="/rules">
          <BookOpen className="w-4 h-4 mr-2" />
          Règles
        </Link>
      </Button>

      {/* <header className="absolute top-6 left-6 right-6 z-10">
        <nav className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Accueil
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/rules">
              <BookOpen className="w-4 h-4 mr-2" />
              Règles
            </Link>
          </Button>
        </nav>
      </header> */}

      <main className="flex-1">{children}</main>
    </div>
  );
}
