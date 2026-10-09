import { useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { AuthForm, type AuthMode } from "./AuthForm";
import type { Auth } from "./useAuth";

type Props = {
  auth: Auth;
};

export function AccountSection({ auth }: Props) {
  const [formMode, setFormMode] = useState<AuthMode | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  if (!auth.checked) {
    return <p className="text-sm text-muted">Loading account...</p>;
  }

  if (auth.user) {
    const handleSignOut = async () => {
      setSigningOut(true);
      await auth.signOut();
      setSigningOut(false);
    };

    return (
      <div className="rounded-xl bg-bg p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-solved text-white font-bold uppercase">
            {auth.user.email[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-charcoal">Signed in</p>
            <p className="truncate text-sm text-muted">{auth.user.email}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-locked bg-surface py-2.5 font-semibold text-charcoal
                     hover:border-danger hover:text-danger transition-colors disabled:opacity-60"
        >
          <LogOut className="w-4 h-4" />
          {signingOut ? "Signing out..." : "Sign out"}
        </button>
      </div>
    );
  }

  if (formMode) {
    return (
      <AuthForm
        mode={formMode}
        auth={auth}
        onModeChange={setFormMode}
        onCancel={() => setFormMode(null)}
      />
    );
  }

  return (
    <div className="rounded-xl bg-bg p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-locked text-locked-text">
          <UserRound className="w-5 h-5" />
        </div>
        <div>
          <p className="font-semibold text-charcoal">Playing as a guest</p>
          <p className="text-sm text-muted">Your games and stats are saved in this browser.</p>
        </div>
      </div>
      <p className="mt-3 text-sm text-charcoal">
        Create an account to keep your streak across devices.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          onClick={() => setFormMode("signup")}
          className="rounded-xl bg-active py-2.5 font-bold text-white shadow-sm hover:brightness-105 transition"
        >
          Create account
        </button>
        <button
          onClick={() => setFormMode("signin")}
          className="rounded-xl border-2 border-locked bg-surface py-2.5 font-semibold text-charcoal hover:border-active transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}