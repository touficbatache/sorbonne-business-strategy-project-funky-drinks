import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GameState,
  GamePhase,
  Player,
  ProductType,
  PlayerRoundDecision,
  ProductVote,
} from "@/lib/types";
import { TOTAL_ROUNDS, STARTING_CASH, START_CAPACITY } from "@/lib/config";
import { EVENTS } from "@/lib/events";
import {
  pickEvent,
  tieBreakProduct,
  mulberry32,
  seedFromString,
} from "@/lib/rng";
import { simulateRound, simulateBaseline } from "@/lib/simulate";

const initialState: GameState = {
  seed: "",
  phase: "HOME",
  totalRounds: TOTAL_ROUNDS,
  initialQuality: undefined,
  initialBrand: undefined,
  players: [],
  currentPlayerIndex: 0,
  usedEvents: [],
  productVotes: [],
};

const INITIAL_QUALITY_RANGE: [number, number] = [0.6, 0.8];
const INITIAL_BRAND_RANGE: [number, number] = [0.4, 0.6];

function rollInitialStats(seed: string) {
  const seedLabel = seed && seed.length > 0 ? seed : Date.now().toString(36);
  const rng = mulberry32(seedFromString(`${seedLabel}_init`));
  const sample = (range: [number, number]) => {
    const [min, max] = range;
    return Number((min + rng() * (max - min)).toFixed(3));
  };

  return {
    initialQuality: sample(INITIAL_QUALITY_RANGE),
    initialBrand: sample(INITIAL_BRAND_RANGE),
  };
}

type GameActions = {
  reset: () => void;
  setPlayers: (names: string[]) => void;
  setSeed: (seed: string) => void;
  // Voting system
  submitProductVote: (playerId: string, product: ProductType) => void;
  getVoteCounts: () => Record<ProductType, number>;
  allPlayersVoted: () => boolean;
  finalizeProductVote: () => void;
  // Game flow
  startGame: () => void;
  acknowledgeEvent: () => void;
  beginPlayerTurn: () => void;
  submitDecision: (decision: PlayerRoundDecision) => void;
  acknowledgeRecap: () => void;
  nextRound: () => void;
  goToPhase: (phase: GamePhase) => void;
  hasActiveGame: () => boolean;
};

export const useGameStore = create<GameState & GameActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      reset: () => set(initialState),

      setPlayers: (names: string[]) => {
        const players: Player[] = names.map((name, i) => ({
          id: `player_${i}`,
          name,
          cash: STARTING_CASH,
          quality: 0,
          brand: 0,
          capacity: START_CAPACITY,
          portfolio: [],
          history: [],
          profitCum: 0,
          marketShareLast: 0,
          satisfactionAvg: 0,
        }));
        set({
          players,
          phase: "SETUP",
          productVotes: [],
          productInitial: undefined,
          initialQuality: undefined,
          initialBrand: undefined,
        });
      },

      setSeed: (seed: string) => set({ seed }),

      // ========== Voting System ==========
      submitProductVote: (playerId: string, product: ProductType) => {
        const { productVotes } = get();
        // Remove existing vote from this player
        const filtered = productVotes.filter((v) => v.playerId !== playerId);
        set({ productVotes: [...filtered, { playerId, product }] });
      },

      getVoteCounts: () => {
        const { productVotes } = get();
        const counts: Record<ProductType, number> = {
          LEAN: 0,
          BULK: 0,
          PROTEIN: 0,
          PERFORMANCE: 0,
        };
        productVotes.forEach((v) => counts[v.product]++);
        return counts;
      },

      allPlayersVoted: () => {
        const { players, productVotes } = get();
        return productVotes.length >= players.length;
      },

      finalizeProductVote: () => {
        const { seed, players, initialQuality, initialBrand } = get();
        const counts = get().getVoteCounts();

        // Find max votes
        const maxVotes = Math.max(...Object.values(counts));
        const winners = (Object.keys(counts) as ProductType[]).filter(
          (p) => counts[p] === maxVotes
        );

        // Tie-break with RNG if needed
        const winner =
          winners.length === 1 ? winners[0] : tieBreakProduct(seed, winners);

        // Update all players with the winning product and calculate baseline
        const baselineEvent = EVENTS.BASELINE;
        const stats =
          initialQuality != null && initialBrand != null
            ? { initialQuality, initialBrand }
            : rollInitialStats(seed);

        const updatedPlayers = players.map((p) => {
          const playerWithProduct = {
            ...p,
            portfolio: [winner],
            quality: stats.initialQuality,
            brand: stats.initialBrand,
          };
          // Simulate baseline round
          const { updatedPlayer } = simulateBaseline({
            event: baselineEvent,
            productInitial: winner,
            player: playerWithProduct,
          });
          // Reset lastLever since baseline doesn't count
          return {
            ...updatedPlayer,
            lastLever: undefined,
          };
        });

        set({
          productInitial: winner,
          players: updatedPlayers,
          initialQuality: stats.initialQuality,
          initialBrand: stats.initialBrand,
        });
      },

      // ========== Game Flow ==========
      startGame: () => {
        const { seed, usedEvents } = get();
        const eventKey = pickEvent(seed, 1, usedEvents);
        const event = EVENTS[eventKey];

        set({
          phase: "ROUND_EVENT",
          currentRound: {
            roundIndex: 1,
            event: eventKey,
            category: event.category,
            donePlayerIds: [],
          },
          usedEvents: [eventKey],
          currentPlayerIndex: 0,
        });
      },

      acknowledgeEvent: () => set({ phase: "PLAYER_GATE" }),

      beginPlayerTurn: () => set({ phase: "PLAYER_DECISION" }),

      submitDecision: (decision: PlayerRoundDecision) => {
        const { players, currentPlayerIndex, currentRound, productInitial } =
          get();
        if (!currentRound || !productInitial) return;

        const player = players[currentPlayerIndex];
        const event = EVENTS[currentRound.event];

        const { updatedPlayer, result } = simulateRound({
          round: currentRound.roundIndex,
          event,
          productInitial,
          player,
          decision,
        });

        const newPlayers = [...players];
        newPlayers[currentPlayerIndex] = updatedPlayer;

        const newDonePlayerIds = [...currentRound.donePlayerIds, player.id];

        set({
          players: newPlayers,
          currentRound: {
            ...currentRound,
            donePlayerIds: newDonePlayerIds,
          },
          currentResult: result,
          phase: "PLAYER_RECAP",
        });
      },

      acknowledgeRecap: () => {
        const { players, currentPlayerIndex, currentRound } = get();
        if (!currentRound) return;

        const nextPlayerIndex = currentPlayerIndex + 1;

        if (nextPlayerIndex < players.length) {
          // More players this round
          set({
            currentPlayerIndex: nextPlayerIndex,
            phase: "PLAYER_GATE",
            currentResult: undefined,
          });
        } else {
          // Round complete
          set({
            phase: "ROUND_OVERVIEW",
            currentResult: undefined,
          });
        }
      },

      nextRound: () => {
        const { currentRound, totalRounds, seed, usedEvents } = get();
        if (!currentRound) return;

        if (currentRound.roundIndex >= totalRounds) {
          set({ phase: "FINAL" });
        } else {
          const lastCategory = currentRound.category;
          const nextRoundIndex = currentRound.roundIndex + 1;
          const eventKey = pickEvent(
            seed,
            nextRoundIndex,
            usedEvents,
            lastCategory
          );
          const event = EVENTS[eventKey];

          set({
            currentRound: {
              roundIndex: nextRoundIndex,
              event: eventKey,
              category: event.category,
              donePlayerIds: [],
            },
            usedEvents: [...usedEvents, eventKey],
            currentPlayerIndex: 0,
            phase: "ROUND_EVENT",
          });
        }
      },

      goToPhase: (phase: GamePhase) => set({ phase }),

      hasActiveGame: () => {
        const { phase, players } = get();
        return phase !== "HOME" && phase !== "SETUP" && players.length > 0;
      },
    }),
    {
      name: "powerfuel_game_v1",
    }
  )
);
