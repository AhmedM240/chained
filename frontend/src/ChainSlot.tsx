import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react";

type Props = {
  length: number;
  revealed: string;
  previousRevealed: string | null;
  solvedAnswer: string | null;
  isActive: boolean;
  onGuess: (text: string) => Promise<boolean | undefined>;
  celebrateDelay?: number | null;
  autoSubmit: boolean;
};

function fixedCountOf(revealed: string, length: number): number {
  const idx = revealed.indexOf("_");
  return idx === -1 ? length : idx;
}

const TILE =
  "w-11 h-11 flex items-center justify-center rounded-lg border-2 font-bold text-lg uppercase transition-all";

export function ChainSlot({
  length,
  revealed,
  previousRevealed,
  solvedAnswer,
  isActive,
  onGuess,
  celebrateDelay = null,
  autoSubmit,
}: Props) {
  const fixedCount = fixedCountOf(revealed, length);
  const prevFixedCount = previousRevealed ? fixedCountOf(previousRevealed, length) : 0;

  const [letters, setLetters] = useState<string[]>(() => Array(length - fixedCount).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const box = (
    ch: string,
    key: string,
    variant: "solved" | "locked" | "fixed",
    extraClass = "",
    style?: CSSProperties
  ) => {
    const styles = {
      solved: "bg-solved text-white border-solved shadow-sm",
      locked: "bg-locked text-locked-text border-locked",
      fixed: "bg-surface text-charcoal border-active",
    }[variant];
    return (
      <div key={key} style={style} className={`${TILE} ${styles} ${extraClass}`}>
        {ch}
      </div>
    );
  };

  if (solvedAnswer) {
    return (
      <div className="flex gap-1.5">
        {solvedAnswer.split("").map((ch, i) =>
          celebrateDelay !== null
            ? box(ch, `s${i}`, "solved", "animate-chain-pulse", {
                animationDelay: `${celebrateDelay + i * 30}ms`,
              })
            : box(ch, `s${i}`, "solved")
        )}
      </div>
    );
  }

  if (!isActive) {
    return (
      <div className="flex gap-1.5">
        {revealed.split("").map((ch, i) => box(ch === "_" ? "" : ch, `r${i}`, "locked"))}
      </div>
    );
  }

  const submit = async (fullLetters: string[]) => {
    if (fullLetters.some((l) => !l)) return;
    const guessText = revealed.slice(0, fixedCount) + fullLetters.join("");
    await onGuess(guessText);
  };

  const handleChange = (index: number, value: string) => {
  const char = value.slice(-1).toUpperCase();
  const next = [...letters];
  next[index] = char;
  setLetters(next);
  if (char && index + 1 < next.length) {
    inputsRef.current[index + 1]?.focus();
  } else if (char && autoSubmit) {
    submit(next);
  }
};

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !letters[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "Enter") submit(letters);
  };

  const allFilled = letters.every((l) => l !== "");

  return (
  <div className="relative flex items-center">
    <div className="flex gap-1.5">
      {revealed
        .slice(0, fixedCount)
        .split("")
        .map((ch, i) =>
          box(ch, `f${i}`, "fixed", i >= prevFixedCount ? "animate-letter-reveal" : "")
        )}
      {letters.map((char, i) => (
        <input
          key={`i${i}`}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          value={char}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          maxLength={1}
          autoFocus={i === 0}
          className="w-11 h-11 text-center rounded-lg border-2 border-active bg-surface font-bold text-lg uppercase
                     text-charcoal shadow-[0_0_0_3px_var(--color-active-glow)] focus:outline-none
                     transition-all"
        />
      ))}
    </div>
    {allFilled && !autoSubmit && (
  <span className="absolute left-full ml-3 whitespace-nowrap text-sm text-muted font-medium">
    press Enter ↵
  </span>
)}
  </div>
);
}