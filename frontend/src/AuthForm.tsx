import { useId, useState, type FormEventHandler } from "react";
import type { Auth } from "./useAuth";

export type AuthMode = "signup" | "signin";

type Props = {
  mode: AuthMode;
  auth: Auth;
  onModeChange: (mode: AuthMode) => void;
  onCancel: () => void;
};

const inputClass =
  "w-full rounded-xl border-2 border-locked bg-surface px-3 py-2.5 text-charcoal focus:border-active focus:outline-none transition-colors";

export function AuthForm({ mode, auth, onModeChange, onCancel }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailId = useId();
  const passwordId = useId();

  const isSignup = mode === "signup";

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (isSignup) {
        await auth.signUp(email, password);
      } else {
        await auth.signIn(email, password);
      }
      // on success the account section switches to the signed-in card, replacing this form
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  const switchMode = () => {
    setError(null);
    onModeChange(isSignup ? "signin" : "signup");
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-bg p-4">
      <p className="mb-4 font-semibold text-charcoal">
        {isSignup ? "Create your account" : "Welcome back"}
      </p>

      <label htmlFor={emailId} className="mb-1 block text-sm font-medium text-charcoal">
        Email
      </label>
      <input
        id={emailId}
        type="email"
        autoComplete="email"
        autoFocus
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={inputClass}
      />

      <label htmlFor={passwordId} className="mt-3 mb-1 block text-sm font-medium text-charcoal">
        Password
      </label>
      <input
        id={passwordId}
        type="password"
        autoComplete={isSignup ? "new-password" : "current-password"}
        required
        minLength={isSignup ? 8 : undefined}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={inputClass}
      />
      {isSignup && <p className="mt-1 text-xs text-muted">At least 8 characters.</p>}

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-xl bg-active py-2.5 font-bold text-white shadow-sm hover:brightness-105 transition disabled:opacity-60"
      >
        {submitting ? "One moment..." : isSignup ? "Create account" : "Sign in"}
      </button>

      <div className="mt-3 flex items-center justify-between text-sm">
        <button type="button" onClick={switchMode} className="font-medium text-charcoal hover:text-active">
          {isSignup ? "Have an account? Sign in" : "New here? Create an account"}
        </button>
        <button type="button" onClick={onCancel} className="text-muted hover:text-charcoal">
          Cancel
        </button>
      </div>
    </form>
  );
}