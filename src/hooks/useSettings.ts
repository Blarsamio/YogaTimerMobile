import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Settings {
  haptics: boolean;
  keepAwake: boolean;
  reboundSeconds: number;
}

export const DEFAULT_SETTINGS: Settings = { haptics: true, keepAwake: true, reboundSeconds: 45 };

const KEY = 'settings';

// ponytail: each screen reads its own copy on mount; a context only if two mounted screens must stay in sync.
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) }))
      .catch(() => {});
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((previous) => {
      const next = { ...previous, ...patch };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  return [settings, update] as const;
};
