import { useEffect, useState, type ReactNode } from "react";
import { useGame } from "./useGame";
import { ChainSlot } from "./ChainSlot";
import { Connector } from "./Connector";
import { LivesDisplay } from "./LivesDisplay";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { HowToPlay } from "./HowToPlay";
import { ResultModal } from "./ResultModal";
import type { GameState } from "./types";
import { StatsModal } from "./StatsModal";
import { totalMisses } from "./Share";
import { useStats } from "./UseStats";
import { SettingsModal } from "./SettingsModal";
import { useSettings } from "./useSettings";
import { useAuth } from "./useAuth";

const STAGGER_MS = 120;
const HELP_SEEN_KEY = "chained-seen-help";


function buildRevealedMap(game: GameState): Record<number, string> {
  const map: Record<number, string> = {};
  for (const w of game.words) map[w.position] = w.revealed;
  return map;
}

function formatPuzzleDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function App() {
  const auth = useAuth();
  const playerKey = auth.checked ? `user:${auth.user?.id ?? "guest"}` : null;
  const { game, error, guess } = useGame(playerKey);
  const stats = useStats(game ? `${playerKey}:${game.game_id}:${game.game_status}` : null);
  const { settings, updateSettings } = useSettings();

  const [trackedGameId, setTrackedGameId] = useState<number | null>(null);
  const [lastPos, setLastPos] = useState<number | null>(null);
  const [justAdvancedTo, setJustAdvancedTo] = useState(-1);
  const [latestRevealed, setLatestRevealed] = useState<Record<number, string>>({});
  const [prevRevealed, setPrevRevealed] = useState<Record<number, string>>({});
  const [lastStatus, setLastStatus] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [justFinished, setJustFinished] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(() => localStorage.getItem(HELP_SEEN_KEY) === null);

  const closeHelp = () => {
    localStorage.setItem(HELP_SEEN_KEY, "1");
    setShowHelp(false);
    requestAnimationFrame(() => {
      document.querySelector<HTMLInputElement>("main input")?.focus();
    });
  };

  if (game && trackedGameId !== game.game_id) {
    // a different game was loaded (first load, sign-in, or sign-out):
    // record its current state as the baseline, with no animations
    setTrackedGameId(game.game_id);
    setLastPos(game.current_pos);
    setLastStatus(game.game_status);
    setLatestRevealed(buildRevealedMap(game));
    setPrevRevealed({});
    setJustAdvancedTo(-1);
    setCelebrate(false);
    setJustFinished(false);
  } else if (game) {
    if (lastPos !== game.current_pos) {
      setJustAdvancedTo(game.current_pos);
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
      if (lastStatus === "in_progress" && game.game_status !== "in_progress") {
        setJustFinished(true);
        if (game.game_status === "won") setCelebrate(true);
      }
      setLastStatus(game.game_status);
    }
  }
  // wait for the win wave (or a beat after a loss) before opening the results
  const resultDelay =
    game?.game_status === "won" ? game.words.length * STAGGER_MS + 700 : 900;

  useEffect(() => {
    if (!justFinished) return;
    const id = setTimeout(() => setShowResult(true), resultDelay);
    return () => clearTimeout(id);
  }, [justFinished, resultDelay]);

  let content: ReactNode;

  if (error) {
    content = <p className="text-danger font-medium">Error: {error}</p>;
  } else if (!game) {
    content = <p className="text-muted">Loading today's chain...</p>;
  } else {
    content = (
      <>
        <div className="text-center mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            Puzzle #{game.puzzle_number}
          </p>
          <h1 className="text-2xl font-extrabold text-charcoal mt-1">
            {formatPuzzleDate(game.puzzle_date)}
          </h1>
          <p className="text-sm text-muted mt-1">Build the chain, one link at a time.</p>
        </div>

        <LivesDisplay lives={game.lives} />

        <div className="w-fit flex flex-col items-start">
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
                  autoSubmit={settings.autoSubmit}
                />
              </div>
            );
          })}
        </div>

        {game.game_status !== "in_progress" && (
          <button
            onClick={() => setShowResult(true)}
            style={justFinished ? { animationDelay: `${resultDelay}ms` } : undefined}
            className="mt-10 rounded-xl border-2 border-locked bg-surface px-6 py-2.5 font-semibold text-charcoal shadow-sm hover:border-active transition-colors animate-fade-up"
          >
            View results
          </button>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <Header
  onHelp={() => setShowHelp(true)}
  onStats={() => setShowStats(true)}
  onSettings={() => setShowSettings(true)}
/>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 flex flex-col items-center">
        {content}
      </main>
      <Footer streak={stats?.current_streak ?? null} />
      {showHelp && <HowToPlay onClose={closeHelp} />}
      {showResult && game && <ResultModal game={game} onClose={() => setShowResult(false)} />}
        {showStats && (
  <StatsModal
    highlightMisses={game?.game_status === "won" ? totalMisses(game) : null}
    onClose={() => setShowStats(false)}
  />
)}
{showSettings && (
  <SettingsModal
    settings={settings}
    onChange={updateSettings}
    auth={auth}
    onClose={() => setShowSettings(false)}
  />
)}
    </div>
  );
}

export default App;