import { useCallback, useEffect, useState } from "react";
import { createGame, submitGuess } from "./api";
import type { GameState } from "./types";

const SESSION_KEY = "chained-session-id";

function getSessionId(): string {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function useGame() {
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    createGame(getSessionId())
      .then(setGame)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong");
      });
  }, []);

  const guess = useCallback(
    async (text: string) => {
      if (!game) return;
      try {
        const result = await submitGuess(game.game_id, text);
        setGame(result.game);
        return result.is_correct;
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    },
    [game]
  );

  return { game, error, guess };
}