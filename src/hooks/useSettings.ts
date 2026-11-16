import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// How transitions are announced: bells, a soft tap, both, or nothing.
export type CueMode = 'bells' | 'both' | 'haptics' | 'silent';

export interface Settings {
  cueMode: CueMode;
  keepAwake: boolean;
  reboundSeconds: number;
}

export const DEFAULT_SETTINGS: Settings = { cueMode: 'both', keepAwake: true, reboundSeconds: 45 };

export const hapticsOn = (settings: Settings) => settings.cueMode === 'both' || settings.cueMode === 'haptics';

const KEY = 'settings';

// ponytail: each screen reads its own copy on mount; a context only if two mounted screens must stay in sync.
export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const stored = JSON.parse(raw);
        // Before cue modes there was only a haptics toggle.
        if (!stored.cueMode && stored.haptics === false) stored.cueMode = 'bells';
        delete stored.haptics;
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
      })
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
