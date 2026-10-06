import type { GameState } from "./types";

const SOLVED_SQUARES = ["🟩", "🟨", "🟧"];

export function totalMisses(game: GameState): number {
  return game.words.reduce((sum, w) => sum + w.misses, 0);
}

export function buildShareText(game: GameState): string {
  const squares = game.words.map((w, i) => {
    if (i < game.current_pos) return SOLVED_SQUARES[Math.min(w.misses, 2)];
    if (i === game.current_pos) return "🟥";
    return "⬛";
  });

  const misses = totalMisses(game);
  const summary =
    game.game_status === "won"
      ? `${misses} ${misses === 1 ? "miss" : "misses"}`
      : "chain broken";

  return [`Chained #${game.puzzle_number} · ${summary}`, squares.join("🔗"), window.location.origin].join(
    "\n"
  );
}