import React, { useCallback, useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1 } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { RUN_STORAGE_KEY } from './SessionExecutionScreen';
import { Session } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TAUPE = '#A99985';
const CLAY = '#C08A6A';
const UMBER = '#17130F';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [unfinished, setUnfinished] = useState<Session | null>(null);

  // The practice screen keeps its run in storage until it ends; that run is what Continue resumes.
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(RUN_STORAGE_KEY)
        .then((raw) => setUnfinished(raw ? JSON.parse(raw).session ?? null : null))
        .catch(() => setUnfinished(null));
    }, []),
  );

  const topBgColor = isDark ? UMBER : '#F5F1ED';
  const bottomBgColor = isDark ? '#221D18' : '#FFFFFF';
  const textColor = isDark ? '#EDE4D6' : UMBER;
  const chipBg = isDark ? '#2A231C' : '#EDE4D6';

  const minutes = unfinished
    ? Math.round(unfinished.timers.reduce((sum, timer) => sum + timer.duration, 0) / 60)
    : 0;

  const iconButton = (icon: keyof typeof Ionicons.glyphMap, label: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <View className="p-3 rounded-full" style={{ backgroundColor: chipBg }}>
        <Ionicons name={icon} size={24} color={TAUPE} />
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: topBgColor }}>
      <Pressable className="flex-1" onPress={() => navigation.navigate('Sessions')}>
        <View className="flex-1 justify-center items-center">
          <H1 className="text-display-lg text-center leading-tight mt-12" style={{ color: textColor }}>
            choose{'\n'}a session
          </H1>
        </View>
      </Pressable>

      <Pressable
        className="flex-1"
        style={{ backgroundColor: bottomBgColor, borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
        onPress={() => navigation.navigate('CreateTimer')}
      >
        <View className="flex-1 justify-center items-center">
          <H1 className="text-display-lg text-center leading-tight mb-12" style={{ color: textColor }}>
            create{'\n'}your own
          </H1>
        </View>
      </Pressable>

      <View
        className="absolute w-full flex-row items-center px-6 z-50"
        style={{ top: insets.top + 16, gap: 12 }}
        pointerEvents="box-none"
      >
        {unfinished ? (
          <Pressable
            onPress={() => navigation.navigate('SessionExecution', { session: unfinished, transitionSound: 'bowl' })}
            accessibilityRole="button"
            accessibilityLabel={`Continue ${unfinished.name}`}
            style={({ pressed }) => [{
              flexShrink: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 48,
              paddingLeft: 6, paddingRight: 16, borderRadius: 9999, backgroundColor: chipBg, opacity: pressed ? 0.7 : 1,
            }]}
          >
            <View style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: CLAY, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="play" size={16} color={UMBER} />
            </View>
            <Text numberOfLines={1} style={{ flexShrink: 1, fontSize: 15, color: textColor }}>
              Continue · {minutes}′
            </Text>
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }} pointerEvents="none" />
        {iconButton('book-outline', 'Pose library', () => navigation.navigate('Asanas'))}
        {iconButton('settings-outline', 'Settings', () => navigation.navigate('Settings'))}
      </View>
    </View>
  );
};
