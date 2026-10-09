import { useEffect, useState } from "react";
import { getMe, login, logout, register } from "./api";
import type { User } from "./types";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        // treat a failed check as signed out
      })
      .finally(() => {
        if (!cancelled) setChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    setUser(await register(email, password));
  };

  const signIn = async (email: string, password: string) => {
    setUser(await login(email, password));
  };

  const signOut = async () => {
    await logout();
    setUser(null);
  };

  return { user, checked, signUp, signIn, signOut };
}

export type Auth = ReturnType<typeof useAuth>;