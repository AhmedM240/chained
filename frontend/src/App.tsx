import { useState } from "react";
import { useGame } from "./useGame";
import { ChainSlot } from "./ChainSlot";
import { Connector } from "./Connector";
import { LivesDisplay } from "./LivesDisplay";
import type { GameState } from "./types";

const STAGGER_MS = 120;

function buildRevealedMap(game: GameState): Record<number, string> {
  const map: Record<number, string> = {};
  for (const w of game.words) map[w.position] = w.revealed;
  return map;
}

function App() {
  const { game, error, guess } = useGame();

  const [lastPos, setLastPos] = useState<number | null>(null);
  const [justAdvancedTo, setJustAdvancedTo] = useState(-1);
  const [latestRevealed, setLatestRevealed] = useState<Record<number, string>>({});
  const [prevRevealed, setPrevRevealed] = useState<Record<number, string>>({});
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  if (game) {
    if (lastPos !== game.current_pos) {
      if (lastPos !== null) setJustAdvancedTo(game.current_pos);
      setLastPos(game.current_pos);
    }

    const nextRevealed = buildRevealedMap(game);
    const changed =
      Object.keys(latestRevealed).length !== Object.keys(nextRevealed).length ||
      Object.entries(nextRevealed).some(([k, v]) => latestRevealed[Number(k)] !== v);
    if (changed) {
      setPrevRevealed(latestRevealed);
      setLatestRevealed(nextRevealed);
    }

    if (lastStatus !== game.game_status) {
      if (lastStatus === "in_progress" && game.game_status === "won") setCelebrate(true);
      setLastStatus(game.game_status);
    }
  }

  if (error) return <div className="p-8 text-danger">Error: {error}</div>;
  if (!game) return <div className="p-8 text-muted">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg">
      <div className="max-w-md mx-auto p-8">
        <h1 className="text-3xl font-extrabold mb-1 text-charcoal">Chained</h1>
        <p className="mb-6 text-muted text-sm">Build the word chain, one link at a time.</p>

        <LivesDisplay lives={game.lives} />

        <div className="flex flex-col items-start">
          {game.words.map((w, i) => {
            const isActive = i === game.current_pos && game.game_status === "in_progress";
            return (
              <div key={w.position} className="flex flex-col items-start">
                {i > 0 && (
                  <Connector
                    connected={i <= game.current_pos}
                    justConnected={i === justAdvancedTo}
                    celebrateDelay={celebrate ? i * STAGGER_MS - STAGGER_MS / 2 : null}
                  />
                )}
                <ChainSlot
                  key={isActive ? `${w.position}-${w.revealed}-${game.lives}` : `${w.position}`}
                  length={w.length}
                  revealed={w.revealed}
                  previousRevealed={prevRevealed[w.position] ?? null}
                  solvedAnswer={w.answer}
                  isActive={isActive}
                  onGuess={guess}
                  celebrateDelay={celebrate ? i * STAGGER_MS : null}
                />
              </div>
            );
          })}
        </div>

        {game.game_status === "won" && (
          <div
            style={
              celebrate
                ? { animationDelay: `${game.words.length * STAGGER_MS + 300}ms` }
                : undefined
            }
            className="mt-8 rounded-2xl bg-surface border-2 border-solved shadow-md p-5 animate-fade-up"
          >
            <p className="text-solved font-extrabold text-xl">Chain complete!</p>
            <p className="text-muted text-sm mt-1">Come back tomorrow for a new chain.</p>
          </div>
        )}

        {game.game_status === "lost" && (
          <div className="mt-8 rounded-2xl bg-surface border-2 border-danger shadow-md p-5 animate-fade-up">
            <p className="text-danger font-extrabold text-xl">The chain broke</p>
            <p className="text-muted text-sm mt-1">
              All the links are revealed above. Try again tomorrow.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;