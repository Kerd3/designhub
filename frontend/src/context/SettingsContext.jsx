import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocalStorage, useMediaQuery } from '@/hooks/useMisc.js';
import { DEMO_ACCOUNT } from '@/services/authService.js';

export const SETTINGS_KEY = 'designhub.settings';

export const DEFAULT_SETTINGS = {
  profile: { name: DEMO_ACCOUNT.name, title: DEMO_ACCOUNT.role, email: DEMO_ACCOUNT.email },
  appearance: { theme: 'system', projectView: 'grid', taskView: 'board' },
  notifications: { inquiries: true, taskDue: true, activity: true },
  workspace: { name: 'DesignHub Studio', timezone: 'America/New_York', weekStart: 'monday' },
};

const SettingsContext = createContext(null);

/** Workspace preferences, persisted to localStorage (no server account exists in the demo). */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useLocalStorage(SETTINGS_KEY, DEFAULT_SETTINGS);
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  const update = useCallback((section, patch) => {
    setSettings((s) => ({ ...s, [section]: { ...DEFAULT_SETTINGS[section], ...s[section], ...patch } }));
  }, [setSettings]);

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [setSettings]);

  const merged = useMemo(() => {
    const out = {};
    for (const key of Object.keys(DEFAULT_SETTINGS)) out[key] = { ...DEFAULT_SETTINGS[key], ...settings[key] };
    return out;
  }, [settings]);

  const theme = merged.appearance.theme;
  const resolvedTheme = theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme;

  const value = useMemo(() => ({ settings: merged, update, reset, resolvedTheme }), [merged, update, reset, resolvedTheme]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}
