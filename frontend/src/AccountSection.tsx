import { LogOut, UserRound } from "lucide-react";

export type AccountUser = {
  email: string;
};

type Props = {
  user: AccountUser | null;
};

export function AccountSection({ user }: Props) {
  if (user) {
    return (
      <div className="rounded-xl bg-bg p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-solved text-white font-bold uppercase">
            {user.email[0]}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-charcoal">Signed in</p>
            <p className="truncate text-sm text-muted">{user.email}</p>
          </div>
        </div>
        <button
          disabled
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-locked bg-surface py-2.5 font-semibold text-charcoal
                     hover:border-danger hover:text-danger transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
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
          disabled
          className="rounded-xl bg-active py-2.5 font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Create account
        </button>
        <button
          disabled
          className="rounded-xl border-2 border-locked bg-surface py-2.5 font-semibold text-charcoal disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sign in
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Accounts are coming soon.</p>
    </div>
  );
}