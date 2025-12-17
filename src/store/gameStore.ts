import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GameState,
  GamePhase,
  Player,
  ProductType,
  PlayerRoundDecision,
  PlayerRoundResult,
} from "@/lib/types";
import {
  TOTAL_ROUNDS,
  STARTING_CASH,
  START_QUALITY,
  START_BRAND,
  START_CAPACITY,
} from "@/lib/config";
import { EVENTS } from "@/lib/events";
import { pickEvent } from "@/lib/rng";
import { simulateRound } from "@/lib/simulate";

const initialState: GameState = {
  seed: "",
  phase: "HOME",
  totalRounds: TOTAL_ROUNDS,
  players: [],
  currentPlayerIndex: 0,
  usedEvents: [],
};

type GameActions = {
  reset: () => void;
  setPlayers: (names: string[]) => void;
  setSeed: (seed: string) => void;
  setProductInitial: (product: ProductType) => void;
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
          quality: START_QUALITY,
          brand: START_BRAND,
          capacity: START_CAPACITY,
          portfolio: [],
          history: [],
          profitCum: 0,
          marketShareLast: 0,
          satisfactionAvg: 0,
        }));
        set({ players, phase: "SETUP" });
      },

      setSeed: (seed: string) => set({ seed }),

      setProductInitial: (product: ProductType) => {
        const { players } = get();
        const updatedPlayers = players.map((p) => ({
          ...p,
          portfolio: [product],
        }));
        set({ productInitial: product, players: updatedPlayers });
      },

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
        const { players, currentPlayerIndex, currentRound, productInitial } = get();
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
          const eventKey = pickEvent(seed, nextRoundIndex, usedEvents, lastCategory);
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
