import { useCallback, useEffect, useState } from "react";
import { ApiError, createGame, submitGuess } from "./api";
import type { GameState } from "./types";

export function useGame(playerKey: string | null) {
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (playerKey === null) return; // still finding out who the player is
    let cancelled = false;
    createGame()
      .then((g) => {
        if (!cancelled) {
          setGame(g);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setError("No chain is scheduled for today. Check back soon!");
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [playerKey]);

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