import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, FlatList, Text } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { H1, Button, BackButton } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { TimerCreateModal } from '../components/TimerCreateModal';
import { SoundSelectModal } from '../components/SoundSelectModal';
import { SwipeableTimerItem } from '../components/SwipeableTimerItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Timer {
  id: string;
  duration: number;
  label: string;
}

const STORAGE_KEYS = {
  TIMER_LIST: 'createTimer_timerList',
  SELECTED_SOUND: 'createTimer_selectedSound',
  ACTIVE_TAB: 'createTimer_activeTab',
};

export const CreateTimerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'timer' | 'sound'>('timer');
  const [timers, setTimers] = useState<Timer[]>([]);
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  const [selectedSound, setSelectedSound] = useState<string>('bowl');

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';

  const loadPersistedState = async () => {
    try {
      const [savedTimers, savedSound, savedTab] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TIMER_LIST),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_SOUND),
        AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_TAB),
      ]);

      if (savedTimers) {
        try {
          const parsedTimers = JSON.parse(savedTimers);
          if (Array.isArray(parsedTimers)) {
            setTimers(parsedTimers);
          } else {
            // Invalid timer list format, resetting
            await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_LIST);
          }
        } catch (parseError) {
          // Failed to parse saved timers, resetting
          await AsyncStorage.removeItem(STORAGE_KEYS.TIMER_LIST);
        }
      }

      if (savedSound) {
        setSelectedSound(savedSound);
      }

      if (savedTab && (savedTab === 'timer' || savedTab === 'sound')) {
        setActiveTab(savedTab as 'timer' | 'sound');
      }
    } catch (error) {
      // Failed to load persisted timer state
    }
  };

  const saveTimersToStorage = async (timerList: Timer[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.TIMER_LIST, JSON.stringify(timerList));
    } catch (error) {
      // Failed to save timers
    }
  };

  const saveSelectedSoundToStorage = async (sound: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_SOUND, sound);
    } catch (error) {
      // Failed to save selected sound
    }
  };

  const saveActiveTabToStorage = async (tab: 'timer' | 'sound') => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tab);
    } catch (error) {
      // Failed to save active tab
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPersistedState();
    }, [])
  );

  const handleBack = () => {
    navigation.navigate('Home');
  };

  const formatDuration = (duration: number) => {
    if (duration === 1) return 'one minute';
    if (duration < 10) {
      const numbers = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
      return `${numbers[duration]} minutes`;
    }
    return `${duration} minutes`;
  };

  const handleAddTimer = (duration: number) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      duration,
      label: `${formatDuration(duration)}`,
    };
    const updatedTimers = [...timers, newTimer];
    setTimers(updatedTimers);
    saveTimersToStorage(updatedTimers);
    setIsTimerModalOpen(false);
  };

  const handleDeleteTimer = (id: string) => {
    const updatedTimers = timers.filter(timer => timer.id !== id);
    setTimers(updatedTimers);
    saveTimersToStorage(updatedTimers);
  };

  const clearSession = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TIMER_LIST),
      ]);
      setTimers([]);
    } catch (error) {
      // Failed to clear session
    }
  };

  const clearAllData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TIMER_LIST),
        AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_SOUND),
        AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_TAB),
      ]);
      setTimers([]);
      setSelectedSound('bowl');
      setActiveTab('timer');
    } catch (error) {
      // Failed to clear all data
    }
  };

  const handleNext = () => {
    // Navigate to background music selection
    navigation.navigate('BackgroundMusic');
  };

  const renderTimer = ({ item }: { item: Timer }) => (
    <SwipeableTimerItem
      item={item}
      onDelete={handleDeleteTimer}
    />
  );

  return (
    <View className="flex-1 px-6 pt-16" style={{ backgroundColor }}>
      {/* Header with back button */}
      <View className="flex-row items-center mb-8">
        <BackButton onPress={handleBack} />
        <View className="flex-1 ml-4">
          <H1 className="text-h1" style={{ color: textColor }}>
            create session
          </H1>
        </View>
      </View>

      {/* Toggle buttons */}
      <View className="flex-row mb-8">
        <TouchableOpacity
          onPress={() => {
            setActiveTab('timer');
            saveActiveTabToStorage('timer');
            setIsTimerModalOpen(true);
          }}
          className={`flex-1 py-3 px-6 rounded-l-lg border ${
            activeTab === 'timer'
              ? 'bg-accent border-accent'
              : 'bg-surface border-accent/30'
          }`}
          activeOpacity={0.8}
        >
          <Text
            className="text-center text-body font-ubuntu-medium"
            style={{
              color: activeTab === 'timer' ? '#FFFFFF' : textColor
            }}
          >
            timer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setActiveTab('sound');
            saveActiveTabToStorage('sound');
            setIsSoundModalOpen(true);
          }}
          className={`flex-1 py-3 px-6 rounded-r-lg border ${
            activeTab === 'sound'
              ? 'bg-accent border-accent'
              : 'bg-surface border-accent/30'
          }`}
          activeOpacity={0.8}
        >
          <Text
            className="text-center text-body font-ubuntu-medium"
            style={{
              color: activeTab === 'sound' ? '#FFFFFF' : textColor
            }}
          >
            sound
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timer list */}
      <View className="flex-1">
        <FlatList
          data={timers}
          renderItem={renderTimer}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>

      {/* Next button */}
      {timers.length > 0 && (
        <View className="pb-8 pt-4">
          <Button
            title="next ▸"
            onPress={handleNext}
            variant="primary"
            size="large"
          />
        </View>
      )}

      {/* Modals */}
      <TimerCreateModal
        isOpen={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        onAddTimer={handleAddTimer}
      />

      <SoundSelectModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
        selectedSound={selectedSound}
        onSelectSound={(sound) => {
          setSelectedSound(sound);
          saveSelectedSoundToStorage(sound);
        }}
      />
    </View>
  );
};
