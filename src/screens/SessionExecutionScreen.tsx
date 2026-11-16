import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, Alert, Animated, Modal } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useSettings } from '../hooks/useSettings';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useAudioPlayer, AudioModule } from 'expo-audio';
import { ApiService } from '../config/api';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useDeviceUser } from '../hooks/useDeviceUser';
import {
  buildSegments, positionAt, Segment, startOf, elapsedSeconds, pause, resume, seekTo, formatClock, totalSeconds, Clock,
} from '../practice/segments';

type SessionExecutionRouteProp = RouteProp<RootStackParamList, 'SessionExecution'>;

const DEFAULT_REBOUND_SECONDS = 45;
// One in-progress run, so a killed app resumes where it was and Home can offer Continue.
export const RUN_STORAGE_KEY = 'practice_run';

// Ember & Clay
const TAUPE = '#A99985';
const CLAY = '#C08A6A';
const UMBER = '#17130F';
const REFLECTIONS = ['Open', 'Heavy', 'Calm', 'Restless', 'Tender'];

// "Shoelace · left", but not "Bananasana to the left · left".
const sideLabel = (segment: { title: string; side: string | null }) =>
  segment.side && !segment.title.toLowerCase().includes(segment.side) ? ` · ${segment.side}` : '';

const isRest = (kind?: string) => kind === 'rebound' || kind === 'switch';

const withExtra = (segments: Segment[], extra: Record<number, number>) =>
  segments.map((segment, index) => (extra[index] ? { ...segment, duration: segment.duration + extra[index] } : segment));

export const SessionExecutionScreen: React.FC = () => {
  const route = useRoute<SessionExecutionRouteProp>();
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const [settings] = useSettings();

  // Screen stays on for the practice unless turned off in Settings; released on unmount.
  useEffect(() => {
    if (!settings.keepAwake) return;
    activateKeepAwakeAsync('practice').catch(() => {});
    return () => { deactivateKeepAwake('practice').catch(() => {}); };
  }, [settings.keepAwake]);

  const { session } = route.params;

  // Seconds added with "+1 min", per segment index.
  const [extra, setExtra] = useState<Record<number, number>>({});
  const baseSegments = useMemo(() => {
    const ordered = [...session.timers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return buildSegments(ordered, session.rebound_seconds ?? DEFAULT_REBOUND_SECONDS);
  }, [session]);
  const segments = useMemo(() => withExtra(baseSegments, extra), [baseSegments, extra]);

  const [showEdge, setShowEdge] = useState(false);
  const [clock, setClock] = useState<Clock | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [showControls, setShowControls] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [reflection, setReflection] = useState<string | null>(null); // ponytail: not stored yet; persist when there's a history screen
  const [isSaving, setIsSaving] = useState(false);
  const { deviceId } = useDeviceUser();

  const completionOpacity = useRef(new Animated.Value(0)).current;
  const previousIndex = useRef<number | null>(null);

  const transitionPlayer = useAudioPlayer(
    require('../../assets/audio/bowl.wav')
  );

  const backgroundColor = isDark ? '#0E0B08' : '#FAF7F2';
  const textColor = isDark ? '#EDE4D6' : UMBER;
  const mutedColor = isDark ? '#A89C8C' : '#6B5E4F';
  const lineColor = isDark ? '#3A3128' : '#E3D9CB';
  const cardBgColor = isDark ? '#2A231C' : '#F5F1ED';

  // Position is derived from timestamps, never from counting ticks, so it can't drift.
  const elapsed = clock ? elapsedSeconds(clock, now) : 0;
  const position = positionAt(segments, elapsed);
  const currentSegment = segments[position.index];
  const nextSegment = segments[position.index + 1];
  const isPaused = !!clock?.pausedAt;
  const resting = isRest(currentSegment?.kind);
  const circularProgress = currentSegment ? 1 - position.remaining / currentSegment.duration : 1;
  const poses = segments.filter((segment) => !isRest(segment.kind));

  const isCustomSession = !session.id ||
    session.id.toString().startsWith('custom_') ||
    session.name === 'Custom Practice' ||
    (typeof session.id === 'number' && session.id > 1000000000000);
  const totalMinutes = Math.round(totalSeconds(segments) / 60);
  const suggestedName = `${session.timers[0]?.title ?? 'Practice'} · ${totalMinutes}′`;

  const persistRun = useCallback((nextClock: Clock, nextExtra: Record<number, number>) => {
    AsyncStorage.setItem(RUN_STORAGE_KEY, JSON.stringify({ sessionId: session.id, session, extra: nextExtra, ...nextClock })).catch(() => {});
  }, [session]);

  const updateClock = useCallback((next: Clock) => {
    setClock(next);
    setNow(Date.now());
    persistRun(next, extra);
  }, [persistRun, extra]);

  const clearRun = () => AsyncStorage.removeItem(RUN_STORAGE_KEY).catch(() => {});

  // Start, or resume a run of this same session that the OS killed.
  useEffect(() => {
    (async () => {
      try {
        await AudioModule.setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'mixWithOthers',
        });
      } catch (error) {
        console.log('Error configuring audio:', error);
      }

      let resumed: Clock | null = null;
      let resumedExtra: Record<number, number> = {};
      try {
        const stored = JSON.parse((await AsyncStorage.getItem(RUN_STORAGE_KEY)) ?? 'null');
        if (stored?.sessionId === session.id &&
            !positionAt(withExtra(baseSegments, stored.extra ?? {}), elapsedSeconds(stored, Date.now())).done) {
          resumed = { startedAt: stored.startedAt, pausedAt: stored.pausedAt, pausedMs: stored.pausedMs };
          resumedExtra = stored.extra ?? {};
        }
      } catch {
        // Corrupt or unavailable storage: start fresh.
      }
      const clockToUse = resumed ?? { startedAt: Date.now(), pausedAt: null, pausedMs: 0 };
      setExtra(resumedExtra);
      setClock(clockToUse);
      setNow(Date.now());
      persistRun(clockToUse, resumedExtra);
    })();
    // Runs once per session: later clock changes go through updateClock.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  // Re-render a few times a second; the tick only refreshes the display.
  useEffect(() => {
    if (!clock || isPaused || position.done) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [clock, isPaused, position.done]);

  const playBell = useCallback(() => {
    try {
      if (transitionPlayer.playing) transitionPlayer.pause();
      transitionPlayer.seekTo(0);
      transitionPlayer.play();
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  }, [transitionPlayer]);

  const handleSessionComplete = useCallback(() => {
    clearRun();
    setShowControls(false);
    setShowCompletion(true);
    Animated.timing(completionOpacity, { toValue: 1, duration: 1500, useNativeDriver: true }).start();
  }, [completionOpacity]);

  // Cue every boundary once. After a long suspension several boundaries collapse into one bell.
  useEffect(() => {
    if (!clock) return;
    const index = position.index;
    if (previousIndex.current !== null && index !== previousIndex.current) {
      playBell();
      if (settings.haptics && (currentSegment?.kind === 'switch' || currentSegment?.side)) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      if (position.done) handleSessionComplete();
    }
    previousIndex.current = index;
  }, [clock, position.index, position.done, currentSegment, playBell, handleSessionComplete, settings.haptics]);

  const jumpTo = (index: number) => {
    if (clock) updateClock(seekTo(clock, Date.now(), startOf(segments, Math.max(0, index))));
  };

  // Lengthens only the current hold; later poses keep their place in the sequence.
  const addMinute = () => {
    if (!clock || position.done) return;
    const nextExtra = { ...extra, [position.index]: (extra[position.index] ?? 0) + 60 };
    setExtra(nextExtra);
    persistRun(clock, nextExtra);
  };

  const handlePlayPause = () => {
    if (!clock) return;
    updateClock(isPaused ? resume(clock, Date.now()) : pause(clock, Date.now()));
  };

  // Long press, not an Alert: ending is deliberate but never a modal mid-practice.
  const handleEnd = () => {
    if (settings.haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    clearRun();
    navigation.navigate('Home');
  };

  const handleSaveSession = async () => {
    setIsSaving(true);
    try {
      const sessionResponse = await ApiService.createSession({
        name: suggestedName,
        description: 'Custom yoga session',
        deviceId: deviceId || undefined,
        rebound_seconds: session.rebound_seconds ?? DEFAULT_REBOUND_SECONDS,
        timers: session.timers.map((timer, index) => ({
          title: timer.title,
          duration: timer.duration,
          position: index + 1,
          kind: timer.kind,
          side: timer.side,
          asana_id: timer.asana_id,
          instruction: timer.instruction,
        })),
      });

      if (sessionResponse.error || !sessionResponse.data) {
        throw new Error(sessionResponse.error || 'Failed to create session');
      }
      navigation.navigate('Home');
    } catch (error) {
      console.error('Session save failed:', error);
      Alert.alert('Save failed', 'Unable to save your session. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const ring = (() => {
    const size = 280;
    const strokeWidth = 2;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={center} cy={center} r={radius} stroke={lineColor} strokeWidth={strokeWidth} fill="none" />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={resting ? mutedColor : TAUPE}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - circularProgress)}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <Text
            accessibilityLabel={`${formatClock(position.remaining)} remaining${isPaused ? ', paused' : ''}`}
            style={{
              fontSize: resting ? 64 : 96,
              fontFamily: 'ZenAntiqueSoft_400Regular',
              color: resting ? mutedColor : TAUPE,
              fontVariant: ['tabular-nums'],
              opacity: isPaused ? 0.4 : 1,
            }}
          >
            {formatClock(position.remaining)}
          </Text>
          {isPaused && (
            <Text style={{ color: mutedColor, fontSize: 14, marginTop: 4 }}>Paused</Text>
          )}
        </View>
      </View>
    );
  })();

  const roundButton = (icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void, big = false) => (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.7}
      style={{
        width: big ? 72 : 56,
        height: big ? 72 : 56,
        borderRadius: 9999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: big ? TAUPE : cardBgColor,
      }}
    >
      <Ionicons name={icon} size={big ? 30 : 22} color={big ? UMBER : TAUPE} />
    </TouchableOpacity>
  );

  if (showCompletion) {
    return (
      <Animated.View style={{ flex: 1, backgroundColor: isDark ? UMBER : '#FAF7F2', opacity: completionOpacity, paddingTop: 120, paddingHorizontal: 24, paddingBottom: 36 }}>
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Text accessibilityRole="header" style={{ fontFamily: 'ZenAntiqueSoft_400Regular', fontSize: 40, lineHeight: 48, color: textColor, textAlign: 'center' }}>
            {totalMinutes} minutes{'\n'}of stillness
          </Text>
          <Text style={{ fontSize: 14, lineHeight: 20, color: mutedColor, textAlign: 'center' }}>
            {poses.map((segment) => segment.title).join(' · ')}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: lineColor, marginVertical: 32 }} />

        <Text style={{ fontFamily: 'ZenAntiqueSoft_400Regular', fontSize: 20, lineHeight: 28, color: textColor, textAlign: 'center', marginBottom: 16 }}>
          How does your body feel?
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
          {REFLECTIONS.map((label) => {
            const on = reflection === label;
            return (
              <TouchableOpacity
                key={label}
                onPress={() => setReflection(on ? null : label)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={{
                  height: 44,
                  paddingHorizontal: 18,
                  borderRadius: 9999,
                  justifyContent: 'center',
                  borderWidth: 1,
                  borderColor: on ? CLAY : lineColor,
                  backgroundColor: on ? CLAY : 'transparent',
                }}
              >
                <Text style={{ fontSize: 15, color: on ? UMBER : textColor }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ marginTop: 'auto', gap: 8 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Home')}
            accessibilityRole="button"
            style={{ height: 56, borderRadius: 9999, backgroundColor: TAUPE, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ fontSize: 17, fontWeight: '500', color: UMBER }}>Done</Text>
          </TouchableOpacity>
          {isCustomSession && (
            <TouchableOpacity
              onPress={handleSaveSession}
              disabled={isSaving}
              accessibilityRole="button"
              style={{ height: 48, alignItems: 'center', justifyContent: 'center', opacity: isSaving ? 0.5 : 1 }}
            >
              <Text style={{ fontSize: 16, color: TAUPE }}>
                {isSaving ? 'Saving…' : `Save as “${suggestedName}”`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <Pressable
      style={{ flex: 1, backgroundColor, paddingTop: 64, paddingHorizontal: 24, paddingBottom: 40 }}
      onPress={() => setShowControls((shown) => !shown)}
      accessibilityHint="Shows or hides the controls"
    >
      {/* One clay segment per pose, sized by its hold. */}
      <View style={{ flexDirection: 'row', gap: 3, height: 3 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {segments.map((segment, index) => (
          <View
            key={index}
            style={{
              flex: segment.duration,
              borderRadius: 2,
              backgroundColor: index < position.index ? CLAY : index === position.index ? TAUPE : lineColor,
              opacity: isRest(segment.kind) ? 0.5 : 1,
            }}
          />
        ))}
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: 'ZenAntiqueSoft_400Regular',
            textAlign: 'center',
            color: resting ? mutedColor : textColor,
            fontSize: 32,
            lineHeight: 40,
          }}
        >
          {currentSegment ? `${currentSegment.title}${sideLabel(currentSegment)}` : ''}
        </Text>
        <Text style={{ color: mutedColor, fontSize: 15, minHeight: 22, marginTop: 4, marginBottom: 32, textAlign: 'center' }}>
          {currentSegment?.instruction ?? ''}
        </Text>

        {ring}

        <Text style={{ color: mutedColor, fontSize: 15, marginTop: 32, textAlign: 'center' }}>
          {nextSegment
            ? `Next · ${nextSegment.title}${sideLabel(nextSegment)} ${formatClock(nextSegment.duration)}`
            : 'Last one'}
        </Text>
      </View>

      {/* Hidden until tapped: the practice screen stays still by default. */}
      <View style={{ minHeight: 224, justifyContent: 'flex-end', opacity: showControls ? 1 : 0 }} pointerEvents={showControls ? 'auto' : 'none'}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 24, marginBottom: 24 }}>
          {roundButton('play-skip-back', 'Previous', () => jumpTo(position.index - 1))}
          {roundButton(isPaused ? 'play' : 'pause', isPaused ? 'Resume' : 'Pause', handlePlayPause, true)}
          {roundButton('play-skip-forward', 'Next', () => jumpTo(position.index + 1))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginBottom: 16 }}>
          {[
            { label: '+1 min', onPress: addMinute, a11y: 'Add one minute to this hold' },
            { label: 'Edge & pain', onPress: () => setShowEdge(true), a11y: 'Edge and pain guidance' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.label}
              onPress={chip.onPress}
              accessibilityRole="button"
              accessibilityLabel={chip.a11y}
              style={{ height: 40, paddingHorizontal: 16, borderRadius: 9999, backgroundColor: cardBgColor, justifyContent: 'center' }}
            >
              <Text style={{ color: textColor, fontSize: 15 }}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onLongPress={handleEnd}
          delayLongPress={800}
          accessibilityRole="button"
          accessibilityLabel="Hold to end session"
          activeOpacity={0.6}
          style={{ alignSelf: 'center', height: 48, paddingHorizontal: 24, borderRadius: 9999, borderWidth: 1, borderColor: CLAY, justifyContent: 'center' }}
        >
          <Text style={{ color: CLAY, fontSize: 15 }}>Hold to end</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showEdge} transparent animationType="slide" onRequestClose={() => setShowEdge(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setShowEdge(false)} accessibilityLabel="Close" />
        <View style={{ backgroundColor: isDark ? '#221D18' : '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40, gap: 16 }}>
          <Text accessibilityRole="header" style={{ fontFamily: 'ZenAntiqueSoft_400Regular', fontSize: 24, lineHeight: 32, color: textColor }}>
            Edge & pain
          </Text>
          {[
            ['Find your edge', 'Go to the first point of real sensation, then back off a little. Around 60–70% is enough.'],
            ['Dull ache is fine', 'Stretch, pressure and slow heat are what yin works with.'],
            ['Come out if', 'You feel sharp, electric or burning pain, numbness or tingling, or pain in a joint.'],
          ].map(([title, body]) => (
            <View key={title} style={{ gap: 4 }}>
              <Text style={{ fontSize: 14, fontWeight: '500', color: mutedColor }}>{title}</Text>
              <Text style={{ fontSize: 16, lineHeight: 24, color: textColor }}>{body}</Text>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => setShowEdge(false)}
            accessibilityRole="button"
            style={{ height: 56, borderRadius: 9999, backgroundColor: TAUPE, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}
          >
            <Text style={{ fontSize: 17, fontWeight: '500', color: UMBER }}>Back to the pose</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </Pressable>
  );
};
