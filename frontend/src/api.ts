import type { GameState, GuessResponse, StatsResponse } from "./types";

const API_BASE = "http://127.0.0.1:8000";

export async function getPuzzleToday() {
  const res = await fetch(`${API_BASE}/api/puzzle/today`);
  if (!res.ok) throw new Error("Failed to fetch today's puzzle");
  return res.json();
}

export async function createGame(sessionId: string): Promise<GameState> {
  const res = await fetch(`${API_BASE}/api/games`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId }),
  });
  if (!res.ok) throw new Error("Failed to create game");
  return res.json();
}

export async function submitGuess(gameId: number, guess: string): Promise<GuessResponse> {
  const res = await fetch(`${API_BASE}/api/games/${gameId}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ guess }),
  });
  if (!res.ok) throw new Error("Failed to submit guess");
  return res.json();
}

export async function getStats(sessionId: string): Promise<StatsResponse> {
  const res = await fetch(`${API_BASE}/api/stats?session_id=${encodeURIComponent(sessionId)}`);
  if (!res.ok) throw new Error("Failed to load stats");
  return res.json();
}