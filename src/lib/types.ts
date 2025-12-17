export type ProductType = "LEAN" | "BULK" | "PROTEIN" | "PERFORMANCE";

export type LeverKey = "PRICE" | "RD" | "CAPACITY" | "BRAND" | "DIVERSIFY";

export type PriceLevel = "LOW" | "MID" | "PREMIUM";

export type EventCategory = "CLIMATE" | "ECONOMY" | "REGULATION" | "TRENDS" | "BASELINE";

export type EventKey =
  | "BASELINE"
  | "HEATWAVE"
  | "COLD_WINTER"
  | "ECON_CRISIS"
  | "ECON_RECOVERY"
  | "NUTRI_LAW"
  | "INGREDIENT_TAX"
  | "FITNESS_BOOM"
  | "WELLNESS_WAVE";

export type GamePhase =
  | "HOME"
  | "SETUP"
  | "PRODUCT_PICK"
  | "ROUND_EVENT"
  | "PLAYER_GATE"
  | "PLAYER_DECISION"
  | "PLAYER_RECAP"
  | "ROUND_OVERVIEW"
  | "FINAL";

export type Player = {
  id: string;
  name: string;
  cash: number;
  quality: number;
  brand: number;
  capacity: number;
  portfolio: ProductType[];
  lastLever?: LeverKey;
  history: PlayerRoundResult[];
  profitCum: number;
  marketShareLast: number;
  satisfactionAvg: number;
};

export type PlayerRoundDecision =
  | { lever: "PRICE"; price: PriceLevel }
  | { lever: "RD" }
  | { lever: "CAPACITY" }
  | { lever: "BRAND" }
  | { lever: "DIVERSIFY"; addProduct: ProductType };

export type PlayerRoundResult = {
  round: number; // 0 = baseline, 1..5 = normal rounds
  event: EventKey;
  decision: PlayerRoundDecision;
  unitsSold: number;
  revenue: number;
  costs: number;
  profit: number;
  cashEnd: number;
  marketShare: number;
  satisfaction: number;
  notes: string[];
};

export type RoundState = {
  roundIndex: number; // 1..5 (0 is baseline, handled separately)
  event: EventKey;
  category: EventCategory;
  donePlayerIds: string[];
};

export type ProductVote = {
  playerId: string;
  product: ProductType;
};

export type GameState = {
  seed: string;
  phase: GamePhase;
  totalRounds: number;
  productInitial?: ProductType;
  players: Player[];
  currentRound?: RoundState;
  currentPlayerIndex: number;
  usedEvents: EventKey[];
  currentResult?: PlayerRoundResult;
  // Voting system
  productVotes: ProductVote[];
};
