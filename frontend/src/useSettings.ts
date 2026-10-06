import { useState } from "react";

export type Settings = {
  autoSubmit: boolean;
};

const SETTINGS_KEY = "chained-settings";
const DEFAULTS: Settings = { autoSubmit: false };

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  const updateSettings = (patch: Partial<Settings>) => {
    const next = { ...settings, ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSettings(next);
  };

  return { settings, updateSettings };
}