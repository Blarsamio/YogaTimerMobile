// Run: node src/practice/segments.check.ts
import assert from 'node:assert/strict';
import { buildSegments, positionAt, totalSeconds, pause, resume, seekTo, elapsedSeconds, formatClock, SIDE_SWITCH_SECONDS, cueRoleAt } from './segments.ts';

const segments = buildSegments(
  [
    { title: 'Opening Meditation', duration: 180, kind: 'centering' },
    { title: 'Shoelace', duration: 240, side: 'left', asana_id: 1 },
    { title: 'Shoelace', duration: 240, side: 'right', asana_id: 1 },
    { title: 'Sphinx', duration: 300, asana_id: 2 },
    { title: 'Switch Pose', duration: 60, kind: 'rebound' },
    { title: 'Saddle', duration: 300, asana_id: 3 },
  ],
  45,
);

assert.deepEqual(
  segments.map(s => s.kind),
  ['centering', 'pose', 'switch', 'pose', 'rebound', 'pose', 'rebound', 'pose'],
  'switch between sides, rebound between poses, none next to explicit rebound or after centering',
);
assert.equal(segments[2].duration, SIDE_SWITCH_SECONDS);
assert.equal(totalSeconds(segments), 180 + 240 + 15 + 240 + 45 + 300 + 60 + 300);
assert.equal(buildSegments([{ title: 'A', duration: 60 }, { title: 'B', duration: 60 }], 0).length, 2, 'rebound 0 inserts nothing');

assert.deepEqual(positionAt(segments, 0), { index: 0, remaining: 180, done: false });
assert.deepEqual(positionAt(segments, 180), { index: 1, remaining: 240, done: false }, 'boundary belongs to next segment');
assert.equal(positionAt(segments, 10_000).done, true);

// 10 s run, paused 5 s, run 3 s more → 13 s elapsed; skip to 420 s.
let clock = { startedAt: 0, pausedAt: null as number | null, pausedMs: 0 };
clock = pause(clock, 10_000);
assert.equal(elapsedSeconds(clock, 99_000), 10, 'paused clock does not advance');
clock = resume(clock, 15_000);
assert.equal(elapsedSeconds(clock, 18_000), 13);
clock = seekTo(clock, 18_000, 420);
assert.equal(elapsedSeconds(clock, 18_000), 420);

assert.equal(formatClock(59.2), '1:00');
assert.equal(formatClock(240), '4:00');
assert.equal(formatClock(-3), '0:00');

assert.deepEqual(
  [0, 1, 2, 3, 4, 8].map(index => cueRoleAt(segments, index)),
  ['session_start', 'pose_start', 'side_switch', 'pose_start', 'rebound_start', 'session_end'],
  'each boundary gets its own cue role',
);

console.log('segments: ok');
