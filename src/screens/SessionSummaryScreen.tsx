import React, { useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import { useTheme } from '../contexts/ThemeContext';
import { useAsanas } from '../hooks/useAsanas';
import { RootStackParamList } from '../navigation/types';
import { buildSegments, formatClock, totalSeconds } from '../practice/segments';
import { SafetyCard, SAFETY_SEEN_KEY } from '../components/SafetyCard';

const TAUPE = '#A99985';
const CLAY = '#C08A6A';
const UMBER = '#17130F';

type Route = RouteProp<RootStackParamList, 'SessionSummary'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SessionSummaryScreen: React.FC = () => {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { isDark } = useTheme();
  const { data: asanas = [] } = useAsanas(); // Cautions only; the screen works without the server.
  const bell = useAudioPlayer(require('../../assets/audio/bowl.wav'));

  const { session } = params;
  const [showSafety, setShowSafety] = useState(false);

  const start = () => navigation.replace('SessionExecution', params);

  // First practice ever: the edge-vs-pain card comes before the first bell.
  const handleStart = async () => {
    const seen = await AsyncStorage.getItem(SAFETY_SEEN_KEY).catch(() => '1');
    if (seen) start();
    else setShowSafety(true);
  };

  const acknowledgeSafety = () => {
    AsyncStorage.setItem(SAFETY_SEEN_KEY, '1').catch(() => {});
    setShowSafety(false);
    start();
  };
  const timers = useMemo(
    () => [...session.timers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [session],
  );
  const minutes = Math.round(totalSeconds(buildSegments(timers, session.rebound_seconds ?? 45)) / 60);

  const cautions = timers
    .map((timer) => asanas.find((asana) => asana.id === timer.asana_id))
    .filter((asana, index, list) => asana?.contraindications && list.indexOf(asana) === index)
    .map((asana) => `${asana!.title}: ${asana!.contraindications}`);

  const bg = isDark ? UMBER : '#FAF7F2';
  const card = isDark ? '#221D18' : '#F5F1ED';
  const text = isDark ? '#EDE4D6' : UMBER;
  const muted = isDark ? '#A89C8C' : '#6B5E4F';
  const line = isDark ? '#3A3128' : '#E3D9CB';

  const hearIt = () => {
    try {
      bell.seekTo(0);
      bell.play();
    } catch {
      // Preview only; nothing to recover.
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingTop: 56, paddingHorizontal: 24, paddingBottom: 24, gap: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
          style={{ width: 44, height: 44, borderRadius: 9999, backgroundColor: isDark ? '#2A231C' : '#EDE4D6', alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color={TAUPE} />
        </TouchableOpacity>

        <View style={{ gap: 4 }}>
          <Text accessibilityRole="header" style={{ fontFamily: 'ZenAntiqueSoft_400Regular', fontSize: 32, lineHeight: 40, color: text }}>
            {session.name === 'Custom Practice' ? 'Your session' : session.name}
          </Text>
          <Text style={{ fontSize: 14, color: muted }}>
            {minutes} min · {timers.length} {timers.length === 1 ? 'pose' : 'poses'}
            {session.rebound_seconds ? ` · rebound ${session.rebound_seconds} s` : ''}
          </Text>
        </View>

        <View>
          {timers.map((timer, index) => (
            <View key={timer.id ?? index} style={{ flexDirection: 'row', alignItems: 'center', minHeight: 52, gap: 12, borderBottomWidth: 1, borderBottomColor: line }}>
              <Text style={{ flex: 1, fontSize: 16, color: text }}>{timer.title || 'Hold'}</Text>
              {timer.side && (
                <Text style={{ fontSize: 12, color: CLAY, borderWidth: 1, borderColor: CLAY, borderRadius: 9999, paddingHorizontal: 8, paddingVertical: 2 }}>
                  {timer.side === 'left' ? 'L' : 'R'}
                </Text>
              )}
              <Text style={{ fontSize: 15, color: muted, fontVariant: ['tabular-nums'] }}>{formatClock(timer.duration)}</Text>
            </View>
          ))}
        </View>

        {cautions.length > 0 && (
          <View style={{ padding: 16, borderRadius: 16, backgroundColor: card, borderLeftWidth: 3, borderLeftColor: CLAY, gap: 6 }}>
            <Text style={{ fontSize: 14, fontWeight: '500', color: muted }}>Go gently if</Text>
            {cautions.map((caution) => (
              <Text key={caution} numberOfLines={3} style={{ fontSize: 15, lineHeight: 22, color: text }}>{caution}</Text>
            ))}
          </View>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, backgroundColor: card }}>
          <Ionicons name="notifications-outline" size={20} color={TAUPE} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, color: text }}>Singing bowl</Text>
            <Text style={{ fontSize: 13, color: muted }}>This bell means change pose</Text>
          </View>
          <TouchableOpacity onPress={hearIt} accessibilityRole="button" style={{ height: 40, paddingHorizontal: 16, borderRadius: 9999, borderWidth: 1, borderColor: line, justifyContent: 'center' }}>
            <Text style={{ fontSize: 15, color: TAUPE }}>Hear it</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={{ paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12 }}>
        <TouchableOpacity
          onPress={handleStart}
          accessibilityRole="button"
          style={{ height: 56, borderRadius: 9999, backgroundColor: TAUPE, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 17, fontWeight: '500', color: UMBER }}>Start</Text>
        </TouchableOpacity>
      </View>
      <SafetyCard visible={showSafety} onClose={acknowledgeSafety} closeLabel="I understand, begin" />
    </View>
  );
};
