export type ChainWordState = {
  position: number;
  length: number;
  revealed: string;
  answer: string | null;
};

export type GameState = {
  game_id: number;
  puzzle_id: number;
  current_pos: number;
  lives: number;
  game_status: "in_progress" | "won" | "lost";
  words: ChainWordState[];
};

export type GuessResponse = {
  is_correct: boolean;
  game: GameState;
};