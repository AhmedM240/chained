type Props = {
  connected: boolean;
  justConnected: boolean;
  celebrateDelay?: number | null;
};

export function Connector({ connected, justConnected, celebrateDelay = null }: Props) {
  const line = `w-0.5 flex-1 transition-colors duration-500 ${
    connected ? "bg-solved" : "bg-locked border-l-2 border-dashed border-locked-text"
  }`;

  const nodeAnimation =
    celebrateDelay !== null ? "animate-chain-pulse" : justConnected ? "animate-link-pop" : "";

  return (
    <div className="flex flex-col items-center h-8 w-11">
      <div className={line} />
      <div
        style={celebrateDelay !== null ? { animationDelay: `${celebrateDelay}ms` } : undefined}
        className={`w-3 h-3 rounded-full border-2 -my-1.5 transition-all duration-500 ${
          connected
            ? "bg-solved border-solved shadow-[0_0_8px_var(--color-solved)]"
            : "bg-bg border-locked-text"
        } ${nodeAnimation}`}
      />
      <div className={line} />
    </div>
  );
}