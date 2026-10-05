type Props = {
  lives: number;
  maxLives?: number;
};

export function LivesDisplay({ lives, maxLives = 3 }: Props) {
  return (
    <div className="flex items-center gap-1.5 mb-6">
      {Array.from({ length: maxLives }).map((_, i) => {
        const broken = i >= lives;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className={`w-6 h-6 transition-all duration-500 ${
              broken ? "text-locked-text scale-90 opacity-50" : "text-solved"
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            {broken ? (
              <>
                <path d="M7 7a4 4 0 0 1 5-3.9M9 15a4 4 0 0 0 5 3.9" />
                <path d="M4 20l4-4M16 8l4-4" strokeDasharray="2 2" />
              </>
            ) : (
              <>
                <rect x="3" y="7" width="8" height="10" rx="4" />
                <rect x="13" y="7" width="8" height="10" rx="4" />
              </>
            )}
          </svg>
        );
      })}
    </div>
  );
}