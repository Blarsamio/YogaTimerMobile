// Pure timing model for a practice run. No React, so it can be checked with plain node:
//   node src/practice/segments.check.ts

export type SegmentKind = 'pose' | 'rebound' | 'counterpose' | 'centering' | 'savasana' | 'closing' | 'switch';

export interface TimerLike {
  title?: string;
  duration: number; // seconds
  kind?: string;
  side?: string | null;
  asana_id?: number | null;
  instruction?: string | null;
}

export interface Segment {
  title: string;
  duration: number; // seconds
  kind: SegmentKind;
  side: 'left' | 'right' | null;
  instruction: string | null;
}

// ponytail: features doc M4 assumes 10–20 s between sides; make it a setting if practitioners ask.
export const SIDE_SWITCH_SECONDS = 15;

const sameAsana = (a: TimerLike, b: TimerLike) =>
  a.asana_id != null ? a.asana_id === b.asana_id : !!a.title && a.title === b.title;

const isPose = (t: TimerLike) => (t.kind ?? 'pose') === 'pose';

// Inserts runtime rests: a short "switch sides" between two sides of one pose,
// otherwise a rebound between two poses. Explicit rebound/counterpose timers are left as they are.
export function buildSegments(timers: TimerLike[], reboundSeconds: number): Segment[] {
  const segments: Segment[] = [];
  timers.forEach((timer, index) => {
    const previous = timers[index - 1];
    if (previous && isPose(previous) && isPose(timer)) {
      if (sameAsana(previous, timer) && previous.side && timer.side && previous.side !== timer.side) {
        segments.push({ title: 'Switch sides', duration: SIDE_SWITCH_SECONDS, kind: 'switch', side: null, instruction: 'Come out slowly' });
      } else if (reboundSeconds > 0) {
        segments.push({ title: 'Rebound', duration: reboundSeconds, kind: 'rebound', side: null, instruction: 'Come out slowly, let it settle' });
      }
    }
    segments.push({
      title: timer.title || 'Hold',
      duration: timer.duration,
      kind: (timer.kind as SegmentKind) ?? 'pose',
      side: timer.side === 'left' || timer.side === 'right' ? timer.side : null,
      instruction: timer.instruction ?? null,
    });
  });
  return segments;
}

export interface Position {
  index: number; // current segment; segments.length when finished
  remaining: number; // seconds left in current segment
  done: boolean;
}

export function positionAt(segments: Segment[], elapsedSeconds: number): Position {
  let boundary = 0;
  for (let index = 0; index < segments.length; index++) {
    boundary += segments[index].duration;
    if (elapsedSeconds < boundary) return { index, remaining: boundary - elapsedSeconds, done: false };
  }
  return { index: segments.length, remaining: 0, done: true };
}

// Seconds from the start of the run to the start of segment `index`.
export const startOf = (segments: Segment[], index: number) =>
  segments.slice(0, index).reduce((sum, segment) => sum + segment.duration, 0);

export const totalSeconds = (segments: Segment[]) => startOf(segments, segments.length);

// Clock state is three numbers, so it survives being persisted and the JS thread being suspended.
export interface Clock {
  startedAt: number; // epoch ms
  pausedAt: number | null; // epoch ms while paused
  pausedMs: number; // total ms spent paused before pausedAt
}

export const elapsedSeconds = (clock: Clock, now: number) =>
  ((clock.pausedAt ?? now) - clock.startedAt - clock.pausedMs) / 1000;

export const pause = (clock: Clock, now: number): Clock => (clock.pausedAt ? clock : { ...clock, pausedAt: now });

export const resume = (clock: Clock, now: number): Clock =>
  clock.pausedAt ? { ...clock, pausedMs: clock.pausedMs + (now - clock.pausedAt), pausedAt: null } : clock;

// Moves the clock so the run is at `seconds` elapsed (used by skip).
export const seekTo = (clock: Clock, now: number, seconds: number): Clock => ({
  ...clock,
  startedAt: clock.startedAt - (seconds - elapsedSeconds(clock, now)) * 1000,
});

export const formatClock = (seconds: number) => {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};
