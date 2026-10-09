import { Modal } from "./Modal";
import { AccountSection } from "./AccountSection";
import type { Settings } from "./useSettings";
import type { Auth } from "./useAuth";

type ToggleProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
};

function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-solved" : "bg-locked"
      }`}
    >
      <span
        className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

type Props = {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  auth : Auth;
  onClose: () => void;
};

export function SettingsModal({ settings, onChange, auth, onClose }: Props) {
  return (
    <Modal title="Settings" onClose={onClose}>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Gameplay</h3>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-charcoal">Auto-submit</p>
          <p className="text-sm text-muted">
            Submit your guess as soon as the last box is filled, instead of pressing Enter.
          </p>
        </div>
        <Toggle
          label="Auto-submit"
          checked={settings.autoSubmit}
          onChange={(value) => onChange({ autoSubmit: value })}
        />
      </div>

      <h3 className="mt-6 mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Account</h3>
      <AccountSection auth={auth} />
    </Modal>
  );
}