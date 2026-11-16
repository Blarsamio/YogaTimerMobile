import { useCallback, useEffect, useRef } from 'react';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import type { CueRole } from './segments';
import type { CueMode } from '../hooks/useSettings';

// ponytail: bowl.wav is the only licensed asset, so roles differ by strike count and pitch.
// Give each role its own `require` here when the curated bells arrive.
const CUES: Record<CueRole, { strikes: number; gapMs: number; rate: number }> = {
  session_start: { strikes: 1, gapMs: 0, rate: 0.8 }, // low bowl
  pose_start: { strikes: 1, gapMs: 0, rate: 1 },
  side_switch: { strikes: 1, gapMs: 0, rate: 1.25 }, // lighter, higher
  rebound_start: { strikes: 2, gapMs: 2500, rate: 1 }, // first strike decays before the second
  session_end: { strikes: 3, gapMs: 5000, rate: 0.8 },
};

const soft = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft).catch(() => {});

// Returns cue(role). `sound` is the builder's transition sound; 'none' mutes bells but keeps haptics.
// ponytail: repeat strikes use setTimeout, so a suspended JS thread can delay strikes 2–3; the first is on time.
export const useCues = (mode: CueMode, sound = 'bowl') => {
  const player = useAudioPlayer(require('../../assets/audio/bowl.wav'));
  const pending = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => pending.current.forEach(clearTimeout), []);

  const strike = useCallback((rate: number) => {
    try {
      if (player.playing) player.pause();
      player.shouldCorrectPitch = false;
      player.setPlaybackRate(rate);
      player.seekTo(0);
      player.play();
    } catch (error) {
      console.log('Error playing cue:', error);
    }
  }, [player]);

  return useCallback((role: CueRole) => {
    pending.current.forEach(clearTimeout);
    pending.current = [];
    const cue = CUES[role];

    if ((mode === 'bells' || mode === 'both') && sound !== 'none') {
      for (let i = 0; i < cue.strikes; i++) {
        if (i === 0) strike(cue.rate);
        else pending.current.push(setTimeout(() => strike(cue.rate), i * cue.gapMs));
      }
    }

    if (mode === 'haptics' || mode === 'both') {
      if (role === 'session_end') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      else if (role === 'session_start') soft();
      else {
        soft();
        pending.current.push(setTimeout(soft, 150));
      }
    }
  }, [mode, sound, strike]);
};
