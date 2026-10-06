import { useEffect, useState } from "react";
import { getStats } from "./api";
import { getSessionId } from "./session";
import type { StatsResponse } from "./types";

export function useStats(refreshKey: string | null) {
  const [stats, setStats] = useState<StatsResponse | null>(null);

  useEffect(() => {
    if (refreshKey === null) return;
    let cancelled = false;
    getStats(getSessionId())
      .then((s) => {
        if (!cancelled) setStats(s);
      })
      .catch(() => {
        // the streak is decorative; if it fails to load, the footer just leaves it out
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return stats;
}