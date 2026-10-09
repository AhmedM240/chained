export type ChainWordState = {
  position: number;
  length: number;
  revealed: string;
  misses : number;
  answer: string | null;
};

export type GameState = {
  game_id: number;
  puzzle_id: number;
  puzzle_number : number;
  puzzle_date : string;
  current_pos: number;
  lives: number;
  game_status: "in_progress" | "won" | "lost";
  words: ChainWordState[];
};

export type GuessResponse = {
  is_correct: boolean;
  game: GameState;
};

export type StatsResponse = {
  played: number;
  wins: number;
  win_rate: number;
  current_streak: number;
  max_streak: number;
  miss_distribution: number[];
};

export type User = {
  id: number;
  email: string;
};