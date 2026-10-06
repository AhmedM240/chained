import { useEffect, useState } from "react";

function msUntilNextUtcMidnight(): number {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return next - now.getTime();
}

function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function Countdown() {
  const [ms, setMs] = useState(msUntilNextUtcMidnight);

  useEffect(() => {
    const id = setInterval(() => setMs(msUntilNextUtcMidnight()), 1000);
    return () => clearInterval(id);
  }, []);

  return <span className="font-semibold tabular-nums text-charcoal">{formatDuration(ms)}</span>;
}