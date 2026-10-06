import { Fragment, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { Modal } from "./Modal";
import { Countdown } from "./Countdown";
import { buildShareText, totalMisses } from "./Share";
import type { GameState } from "./types";

type Props = {
  game: GameState;
  onClose: () => void;
};

export function ResultModal({ game, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const won = game.game_status === "won";
  const misses = totalMisses(game);

  const summary = won
    ? misses === 0
      ? "Perfect chain, no misses"
      : `${misses} ${misses === 1 ? "miss" : "misses"}`
    : `Broke at link ${game.current_pos + 1} of ${game.words.length}`;

  const share = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText(game));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access was blocked; leave the button as-is
    }
  };

  return (
    <Modal title={won ? "Chain complete!" : "The chain broke"} onClose={onClose}>
      <p className="text-sm text-muted">
        Puzzle #{game.puzzle_number} · {summary}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-x-1.5 gap-y-2">
        {game.words.map((w, i) => (
          <Fragment key={w.position}>
            {i > 0 && <span className="text-muted">→</span>}
            <span
              className={`rounded-lg px-2.5 py-1 text-sm font-bold uppercase ${
                i < game.current_pos ? "bg-solved-light text-solved" : "bg-danger/10 text-danger"
              }`}
            >
              {w.answer}
            </span>
          </Fragment>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-bg p-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Next chain in</p>
        <p className="mt-1 text-2xl">
          <Countdown />
        </p>
      </div>

      <button
        onClick={share}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-active py-3 font-bold text-white shadow-sm hover:brightness-105 transition"
      >
        {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
        {copied ? "Copied to clipboard!" : "Share result"}
      </button>
    </Modal>
  );
}