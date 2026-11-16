import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Alert, Animated, TextInput } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useKeepAwake } from 'expo-keep-awake';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../contexts/ThemeContext';
import { useAudioPlayer, AudioModule } from 'expo-audio';
import { ApiService } from '../config/api';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useDeviceUser } from '../hooks/useDeviceUser';
import {
  buildSegments, positionAt, startOf, elapsedSeconds, pause, resume, seekTo, formatClock, Clock,
} from '../practice/segments';

type SessionExecutionRouteProp = RouteProp<RootStackParamList, 'SessionExecution'>;

const { width: screenWidth } = Dimensions.get('window');

const DEFAULT_REBOUND_SECONDS = 45;
// One in-progress run, so a killed app resumes where it was.
const RUN_STORAGE_KEY = 'practice_run';

// "Shoelace · left", but not "Bananasana to the left · left".
const sideLabel = (segment: { title: string; side: string | null }) =>
  segment.side && !segment.title.toLowerCase().includes(segment.side) ? ` · ${segment.side}` : '';

export const SessionExecutionScreen: React.FC = () => {
  const route = useRoute<SessionExecutionRouteProp>();
  const navigation = useNavigation();
  const { isDark } = useTheme();
  useKeepAwake(); // Screen stays on for the whole practice; released when the screen unmounts.

  const { session } = route.params;

  const segments = useMemo(() => {
    const ordered = [...session.timers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return buildSegments(ordered, session.rebound_seconds ?? DEFAULT_REBOUND_SECONDS);
  }, [session]);

  const [clock, setClock] = useState<Clock | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { deviceId } = useDeviceUser();

  const slideAnim = useRef(new Animated.Value(0)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;
  const completionOpacity = useRef(new Animated.Value(0)).current;
  const previousIndex = useRef<number | null>(null);

  const availableSounds = [
    { id: 'bowl', name: 'Singing Bowl' },
    { id: 'chime', name: 'Wind Chime' },
    { id: 'bells', name: 'Healing Bells' },
    { id: 'gong', name: 'Tibetan Gong' },
  ];

  const transitionPlayer = useAudioPlayer(
    require('../../assets/audio/bowl.wav')
  );

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';
  const accentColor = '#A99985';

  // Position is derived from timestamps, never from counting ticks, so it can't drift.
  const elapsed = clock ? elapsedSeconds(clock, now) : 0;
  const position = positionAt(segments, elapsed);
  const currentSegment = segments[position.index];
  const nextSegment = segments[position.index + 1];
  const isPaused = !!clock?.pausedAt;
  const circularProgress = currentSegment ? 1 - position.remaining / currentSegment.duration : 1;

  const updateClock = useCallback((next: Clock) => {
    setClock(next);
    setNow(Date.now());
    AsyncStorage.setItem(RUN_STORAGE_KEY, JSON.stringify({ sessionId: session.id, ...next })).catch(() => {});
  }, [session.id]);

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
      try {
        const stored = JSON.parse((await AsyncStorage.getItem(RUN_STORAGE_KEY)) ?? 'null');
        if (stored?.sessionId === session.id && !positionAt(segments, elapsedSeconds(stored, Date.now())).done) {
          resumed = { startedAt: stored.startedAt, pausedAt: stored.pausedAt, pausedMs: stored.pausedMs };
        }
      } catch {
        // Corrupt or unavailable storage: start fresh.
      }
      updateClock(resumed ?? { startedAt: Date.now(), pausedAt: null, pausedMs: 0 });
    })();
  }, [session.id, segments, updateClock]);

  // Re-render a few times a second; the tick only refreshes the display.
  useEffect(() => {
    if (!clock || isPaused || position.done) return;
    const interval = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(interval);
  }, [clock, isPaused, position.done]);

  const toggleSidePanel = () => {
    const toValue = showSidePanel ? 0 : 1;
    setShowSidePanel(!showSidePanel);

    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidePanel = () => {
    if (showSidePanel) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSidePanel(false));
    }
  };

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
    setShowCompletion(true);

    Animated.parallel([
      Animated.timing(completionAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(completionOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      const sessionId = session.id;
      const isCustomSession = !sessionId ||
                             sessionId.toString().startsWith('custom_') ||
                             session.name === 'Custom Practice' ||
                             (typeof sessionId === 'number' && sessionId > 1000000000000);

      if (isCustomSession) {
        const totalMinutes = Math.round(segments.reduce((sum, segment) => sum + segment.duration, 0) / 60);
        const poseCount = session.timers.length;
        setSessionName(`My ${totalMinutes}-Minute Session (${poseCount} poses)`);
        setShowSaveOptions(true);
      } else {
        navigation.navigate('Home');
      }
    }, 3000);
  }, [completionAnim, completionOpacity, navigation, session, segments]);

  // Cue every boundary once. After a long suspension several boundaries collapse into one bell.
  useEffect(() => {
    if (!clock) return;
    const index = position.index;
    if (previousIndex.current !== null && index !== previousIndex.current) {
      playBell();
      if (currentSegment?.kind === 'switch' || currentSegment?.side) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
      if (position.done) handleSessionComplete();
    }
    previousIndex.current = index;
  }, [clock, position.index, position.done, currentSegment, playBell, handleSessionComplete]);

  const handleSkipTimer = () => {
    Alert.alert(
      'Skip?',
      `Skip ${currentSegment?.title ?? 'this segment'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            if (clock) updateClock(seekTo(clock, Date.now(), startOf(segments, position.index + 1)));
          },
        },
      ]
    );
  };

  const handleSoundChange = (direction: 'prev' | 'next') => {
    setSelectedSoundIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % availableSounds.length;
      } else {
        return (prev - 1 + availableSounds.length) % availableSounds.length;
      }
    });
  };

  const handlePlayPause = () => {
    if (!clock) return;
    updateClock(isPaused ? resume(clock, Date.now()) : pause(clock, Date.now()));
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      Alert.alert('Session Name Required', 'Please enter a name for your session.');
      return;
    }

    setIsSaving(true);
    try {
      const sessionResponse = await ApiService.createSession({
        name: sessionName.trim(),
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

      Alert.alert(
        'Session Saved! 🙏',
        `"${sessionName}" has been added to your session library.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Session save failed:', error);
      Alert.alert(
        'Save Failed',
        'Unable to save your session. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDontSave = () => {
    navigation.navigate('Home');
  };

  const handleExitSession = () => {
    Alert.alert(
      'Exit Session?',
      'Are you sure you want to exit your yoga practice? Your progress will be lost.',
      [
        { text: 'Continue Practice', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            clearRun();
            navigation.navigate('Home');
          },
        },
      ]
    );
  };

  const CircularProgress = ({ progress }: { progress: number }) => {
    const size = 280;
    const strokeWidth = 8;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View
        style={{
          width: size,
          height: size,
        }}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={isDark ? '#3D3D3D' : '#E5E5E5'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text
            accessibilityLabel={`${formatClock(position.remaining)} remaining`}
            style={{
              fontSize: 56,
              fontFamily: 'zen',
              color: accentColor,
              fontVariant: ['tabular-nums'],
            }}
          >
            {formatClock(position.remaining)}
          </Text>

          <View style={{
            position: 'absolute',
            bottom: 20,
            opacity: 0.4
          }}>
            <Ionicons
              name={isPaused ? "play" : "pause"}
              size={16}
              color={accentColor}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between pt-16 pb-8 px-8">
          <TouchableOpacity onPress={handleExitSession}>
            <Ionicons name="home" size={32} color={accentColor} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleSidePanel}>
            <Ionicons name="settings" size={32} color={accentColor} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center px-8">
          <Text
            accessibilityRole="header"
            className="font-zen text-center"
            style={{ color: textColor, fontSize: 28, marginBottom: 6 }}
          >
            {currentSegment ? `${currentSegment.title}${sideLabel(currentSegment)}` : ''}
          </Text>
          <Text
            className="font-ubuntu text-center"
            style={{ color: textColor, opacity: 0.6, fontSize: 15, minHeight: 20, marginBottom: 24 }}
          >
            {currentSegment?.instruction ?? ''}
          </Text>

          <TouchableOpacity
            onPress={handlePlayPause}
            activeOpacity={0.8}
            style={{ borderRadius: 200 }}
            accessibilityRole="button"
            accessibilityLabel={isPaused ? 'Resume' : 'Pause'}
          >
            <CircularProgress progress={circularProgress} />
          </TouchableOpacity>

          <Text
            className="font-ubuntu text-center"
            style={{ color: textColor, opacity: 0.6, fontSize: 15, marginTop: 24 }}
          >
            {nextSegment
              ? `Next: ${nextSegment.title}${sideLabel(nextSegment)} · ${formatClock(nextSegment.duration)}`
              : 'Last one'}
          </Text>
        </View>

        <View className="items-center pb-16 px-8">
          <TouchableOpacity
            onPress={handleSkipTimer}
            className="flex-row items-center px-6 py-3"
            activeOpacity={0.7}
          >
            <Text
              className="text-lg font-zen mr-3"
              style={{ color: textColor, opacity: 0.6 }}
            >
              skip me
            </Text>
            <Ionicons name="arrow-forward" size={20} color={textColor} style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </View>
      </View>

      {showSidePanel && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
          onPress={closeSidePanel}
          activeOpacity={1}
        />
      )}

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: screenWidth * 0.65,
          backgroundColor: cardBgColor,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [screenWidth * 0.65, 0],
              }),
            },
          ],
          shadowColor: '#000',
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <ScrollView className="flex-1 pt-16 px-6">
          <View className="mb-8">
            <Text className="text-lg font-zen mb-4" style={{ color: textColor }}>
              sequence
            </Text>

            {segments.map((segment, index) => (
              <View
                key={index}
                className={`px-4 py-3 rounded-full mb-2 ${
                  index === position.index
                    ? 'bg-accent'
                    : index < position.index
                      ? 'bg-gray-300'
                      : 'bg-transparent border border-gray-300'
                }`}
                style={{
                  backgroundColor:
                    index === position.index
                      ? accentColor
                      : index < position.index
                        ? (isDark ? '#6B7280' : '#D1D5DB')
                        : 'transparent',
                  borderColor: index < position.index ? 'transparent' : (isDark ? '#6B7280' : '#D1D5DB'),
                  borderWidth: index >= position.index ? 1 : 0,
                }}
              >
                <Text
                  className="text-center font-ubuntu-medium"
                  style={{
                    color:
                      index === position.index
                        ? '#FFFFFF'
                        : index < position.index
                          ? (isDark ? '#9CA3AF' : '#6B7280')
                          : textColor,
                  }}
                >
                  {segment.title}{sideLabel(segment)} · {formatClock(segment.duration)}
                </Text>
              </View>
            ))}
          </View>

          <View className="mb-8">
            <Text className="text-lg font-zen mb-4" style={{ color: textColor }}>
              sound
            </Text>

            <View className="flex-row items-center justify-between px-4">
              <TouchableOpacity
                onPress={() => handleSoundChange('prev')}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color={textColor} />
              </TouchableOpacity>

              <Text className="text-center font-ubuntu-medium flex-1" style={{ color: textColor }}>
                {availableSounds[selectedSoundIndex].name}
              </Text>

              <TouchableOpacity
                onPress={() => handleSoundChange('next')}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View className="p-6 pb-16">
          <TouchableOpacity
            onPress={closeSidePanel}
            className="items-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {showCompletion && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor,
          }}
        >
          <Animated.View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: accentColor,
              transform: [
                {
                  scale: completionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 20],
                  }),
                },
              ],
              opacity: completionAnim.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0.8, 0.3, 0.1],
              }),
            }}
          />

          <Animated.View
            style={{
              position: 'absolute',
              alignItems: 'center',
              opacity: completionOpacity,
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontFamily: 'zen',
                color: accentColor,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              🙏
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'zen',
                color: textColor,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Session Complete
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'zen',
                color: textColor,
                opacity: 0.8,
                textAlign: 'center',
                paddingHorizontal: 48,
                lineHeight: 24,
                marginBottom: showSaveOptions ? 32 : 0,
              }}
            >
              Take a moment to rest in stillness and gratitude for your practice
            </Text>

            {showSaveOptions && (
              <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 32 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'zen',
                    color: textColor,
                    marginBottom: 16,
                    textAlign: 'center',
                  }}
                >
                  Save this session?
                </Text>

                <TextInput
                  style={{
                    width: '100%',
                    maxWidth: 280,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: accentColor,
                    borderRadius: 12,
                    backgroundColor: cardBgColor,
                    color: textColor,
                    fontSize: 16,
                    fontFamily: 'ubuntu',
                    textAlign: 'center',
                    marginBottom: 24,
                  }}
                  placeholder="Enter session name..."
                  placeholderTextColor={textColor + '80'}
                  value={sessionName}
                  onChangeText={setSessionName}
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveSession}
                />

                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity
                    onPress={handleDontSave}
                    style={{
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 25,
                      borderWidth: 1,
                      borderColor: textColor + '40',
                      minWidth: 120,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'ubuntu',
                        color: textColor,
                        textAlign: 'center',
                        opacity: 0.8,
                      }}
                    >
                                             Don&apos;t Save
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveSession}
                    disabled={isSaving}
                    style={{
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 25,
                      backgroundColor: accentColor,
                      minWidth: 120,
                      opacity: isSaving ? 0.7 : 1,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'ubuntu',
                        color: backgroundColor,
                        textAlign: 'center',
                        fontWeight: '600',
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Session'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      )}
    </View>
  );
};
