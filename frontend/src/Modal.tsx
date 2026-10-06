import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function Modal({ title, onClose, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const close = () => dialogRef.current?.close();

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) close(); // click on the backdrop
      }}
      className="m-auto w-[min(92vw,28rem)] p-0 bg-transparent
                 backdrop:bg-[rgba(43,40,36,0.45)] backdrop:backdrop-blur-sm"
    >
      <div className="rounded-2xl bg-surface text-charcoal p-6 shadow-xl animate-fade-up">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-xl font-extrabold">{title}</h2>
          <button
            aria-label="Close"
            onClick={close}
            className="p-1 -m-1 rounded-full text-muted hover:text-charcoal hover:bg-locked/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </dialog>
  );
}