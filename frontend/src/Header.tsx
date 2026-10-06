import { ChartColumn, CircleHelp, Settings } from "lucide-react";

type Props = {
  onHelp?: () => void;
  onStats?: () => void;
  onSettings?: () => void;
};

function LogoMark() {
  return (
    <svg viewBox="0 0 26 24" className="w-7 h-7" fill="none" strokeWidth="2.5">
      <rect x="2" y="7" width="12" height="10" rx="5" stroke="var(--color-solved)" />
      <rect x="12" y="7" width="12" height="10" rx="5" stroke="var(--color-active)" />
    </svg>
  );
}

const iconButton =
  "p-2 rounded-full text-charcoal/70 hover:text-charcoal hover:bg-locked/60 transition-colors";

export function Header({ onHelp, onStats, onSettings }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-locked bg-surface/80 backdrop-blur">
      <div className="max-w-3xl mx-auto h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LogoMark />
          <span className="text-xl font-extrabold tracking-tight text-charcoal">Chained</span>
        </div>
        <nav className="flex items-center gap-1">
          <button aria-label="How to play" onClick={onHelp} className={iconButton}>
            <CircleHelp className="w-5 h-5" />
          </button>
          <button aria-label="Statistics" onClick={onStats} className={iconButton}>
            <ChartColumn className="w-5 h-5" />
          </button>
          <button aria-label="Settings" onClick={onSettings} className={iconButton}>
            <Settings className="w-5 h-5" />
          </button>
        </nav>
      </div>
    </header>
  );
}