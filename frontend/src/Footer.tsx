import { Flame } from "lucide-react";
import { Countdown } from "./Countdown";

type Props = {
  streak: number | null;
};

export function Footer({ streak }: Props) {
  return (
    <footer className="border-t border-locked">
      <div className="max-w-3xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted">
        <span>
          Next chain in <Countdown />
        </span>
        {streak !== null &&
          (streak > 0 ? (
            <span
              key={streak}
              className="flex items-center gap-1 font-semibold text-charcoal animate-fade-up"
            >
              <Flame className="w-4 h-4 text-active" />
              {streak}-day streak
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-locked-text" />
              Win a chain to start a streak
            </span>
          ))}
      </div>
    </footer>
  );
}