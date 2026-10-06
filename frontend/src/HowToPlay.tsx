import { Modal } from "./Modal";

const tile =
  "w-8 h-8 flex items-center justify-center rounded-md border-2 text-sm font-bold uppercase";

function SolvedWord({ word }: { word: string }) {
  return (
    <div className="flex gap-1">
      {word.split("").map((ch, i) => (
        <div key={i} className={`${tile} bg-solved border-solved text-white`}>
          {ch}
        </div>
      ))}
    </div>
  );
}

function ActiveWord({ first, length }: { first: string; length: number }) {
  return (
    <div className="flex gap-1">
      <div className={`${tile} bg-surface border-active text-charcoal`}>{first}</div>
      {Array.from({ length: length - 1 }).map((_, i) => (
        <div
          key={i}
          className={`${tile} bg-surface border-active shadow-[0_0_0_2px_var(--color-active-glow)]`}
        />
      ))}
    </div>
  );
}

function Link() {
  return <div className="ml-[15px] h-4 w-0.5 bg-solved" />;
}

type Props = {
  onClose: () => void;
};

export function HowToPlay({ onClose }: Props) {
  return (
    <Modal title="How to play" onClose={onClose}>
      <p className="text-charcoal">
        Build today's chain. Each word joins the next one to make a compound word or phrase.
      </p>

      <div className="mt-5 rounded-xl bg-bg p-4">
        <SolvedWord word="fire" />
        <Link />
        <SolvedWord word="fly" />
        <Link />
        <ActiveWord first="w" length={5} />
        <p className="mt-3 text-xs text-muted">
          FIRE + FLY = FIREFLY · FLY + WHEEL = FLYWHEEL
        </p>
      </div>

      <ul className="mt-5 space-y-2 text-sm text-charcoal">
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-active" />
          You only see the first letter of the current word. Type the rest and press Enter.
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-active" />
          A wrong guess breaks one of your 3 links and reveals another letter.
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-active" />
          Lose all 3 links and the chain breaks.
        </li>
        <li className="flex gap-2">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-active" />
          A new chain arrives every day.
        </li>
      </ul>

      <button
        onClick={onClose}
        className="mt-6 w-full rounded-xl bg-active py-3 font-bold text-white shadow-sm hover:brightness-105 transition"
      >
        Start playing
      </button>
    </Modal>
  );
}