import { useEffect, useState } from "react";
import { Modal } from "./Modal";
import { getStats } from "./api";
import { getSessionId } from "./session";
import type { StatsResponse } from "./types";

const LABELS = ["Perfect", "1 miss", "2 misses"];

type Props = {
  highlightMisses: number | null; // today's result, if won, gets highlighted
  onClose: () => void;
};

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-extrabold tabular-nums text-charcoal">{value}</span>
      <span className="mt-1 text-center text-xs leading-tight text-muted">{label}</span>
    </div>
  );
}

export function StatsModal({ highlightMisses, onClose }: Props) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getStats(getSessionId())
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  let body;
  if (error) {
    body = <p className="text-sm text-danger">{error}</p>;
  } else if (!stats) {
    body = <p className="text-sm text-muted">Loading...</p>;
  } else if (stats.played === 0) {
    body = <p className="text-charcoal">Finish your first chain to start tracking stats.</p>;
  } else {
    const maxCount = Math.max(...stats.miss_distribution, 1);
    const losses = stats.played - stats.wins;
    body = (
      <>
        <div className="grid grid-cols-4 gap-2">
          <Stat value={stats.played} label="Played" />
          <Stat value={`${stats.win_rate}%`} label="Win rate" />
          <Stat value={stats.current_streak} label="Current streak" />
          <Stat value={stats.max_streak} label="Best streak" />
        </div>

        <h3 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
          Miss distribution
        </h3>
        <div className="space-y-2">
          {stats.miss_distribution.map((count, misses) => {
            const color =
              count === 0
                ? "bg-locked text-locked-text"
                : misses === highlightMisses
                  ? "bg-active text-white"
                  : "bg-solved text-white";
            return (
              <div key={misses} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 text-muted">{LABELS[misses]}</span>
                <div className="flex-1">
                  <div
                    style={{ width: `${(count / maxCount) * 100}%` }}
                    className={`flex h-6 min-w-7 items-center justify-end rounded-md px-2 text-xs font-bold ${color}`}
                  >
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {losses > 0 && (
          <p className="mt-4 text-xs text-muted">
            {losses} broken {losses === 1 ? "chain" : "chains"}
          </p>
        )}
      </>
    );
  }

  return (
    <Modal title="Statistics" onClose={onClose}>
      {body}
    </Modal>
  );
}