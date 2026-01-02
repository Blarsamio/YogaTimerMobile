import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { FormModal } from './FormModal';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface TimerCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTimer: (duration: number) => void;
}

export const TimerCreateModal: React.FC<TimerCreateModalProps> = ({
  isOpen,
  onClose,
  onAddTimer,
}) => {
  const { isDark } = useTheme();
  const [minutes, setMinutes] = useState(5);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadLastDuration = async () => {
      try {
        const saved = await AsyncStorage.getItem('lastTimerDuration');
        if (saved) {
          const duration = parseInt(saved, 10);
          if (!isNaN(duration) && duration > 0 && duration <= 120) {
            setMinutes(duration);
          }
        }
      } catch (error) {
        // Failed to load last timer duration
      }
    };
    loadLastDuration();
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const textColor = isDark ? '#F5F5F3' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';

  const triggerHaptic = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Haptics not available (web/simulator)
    }
  };

  const decreaseMinutes = () => {
    if (minutes > 1) {
      triggerHaptic();
      setMinutes(minutes - 1);
    }
  };

  const increaseMinutes = () => {
    if (minutes < 30) {
      triggerHaptic();
      setMinutes(minutes + 1);
    }
  };

  const handleLongPressStart = (increment: boolean) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setMinutes(prev => {
        const newValue = increment ? prev + 1 : prev - 1;
        const clampedValue = Math.max(1, Math.min(120, newValue));

                 if (clampedValue !== prev) {
           triggerHaptic();
         }

        return clampedValue;
      });
    }, 150);
  };

  const handleLongPressEnd = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleAddTimer = async () => {
    try {
      await AsyncStorage.setItem('lastTimerDuration', minutes.toString());
    } catch (error) {
      // Failed to save timer duration
    }
    onAddTimer(minutes);
    setMinutes(5);
  };

  const formatDuration = (mins: number) => {
    if (mins === 1) return 'one minute';
    if (mins < 20) {
      const numbers = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
      return `${numbers[mins]} minutes`;
    }
    return `${mins} minutes`;
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose}>
      <View className="items-center">
        {/* Timer Card */}
        <View
          className="rounded-3xl p-8 items-center mx-4 aspect-square flex-col"
          style={{
            backgroundColor: cardBgColor,
            width: '85%',
            maxWidth: 320,
            minWidth: 280
          }}
        >
        <View className="items-center">
          {/* Timer Preview */}
          <View className="w-16 h-16 rounded-full border-4 border-accent/30 mb-8 items-center justify-center">
            <View
              className="w-12 h-12 rounded-full bg-accent/20"
              style={{
                transform: [{ rotate: `${(minutes / 120) * 360}deg` }]
              }}
            />
          </View>

          {/* Duration Display */}
          <View className="h-16 justify-center mb-4">
            <Text
              className="text-2xl text-center font-zen px-2"
              style={{
                color: textColor,
                lineHeight: 24
              }}
              numberOfLines={2}
              adjustsFontSizeToFit
            >
              {formatDuration(minutes)}
            </Text>
          </View>

          {/* Arrow Controls */}
          <View className="flex-row items-center justify-center">
          <TouchableOpacity
            onPress={decreaseMinutes}
            onLongPress={() => handleLongPressStart(false)}
            onPressOut={handleLongPressEnd}
            className="p-3"
            activeOpacity={0.7}
            disabled={minutes <= 1}
            accessibilityLabel="Decrease timer duration"
            accessibilityHint={`Current duration is ${minutes} minutes`}
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-back"
              size={28}
              color={minutes <= 1 ? '#999' : textColor}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={increaseMinutes}
            onLongPress={() => handleLongPressStart(true)}
            onPressOut={handleLongPressEnd}
            className="p-3"
            activeOpacity={0.7}
            disabled={minutes >= 120}
            accessibilityLabel="Increase timer duration"
            accessibilityHint={`Current duration is ${minutes} minutes`}
            accessibilityRole="button"
          >
            <Ionicons
              name="chevron-forward"
              size={28}
              color={minutes >= 120 ? '#999' : textColor}
            />
          </TouchableOpacity>
          </View>
        </View>
        </View>

        {/* Add Button - positioned to overlap bottom of card */}
        <TouchableOpacity
          onPress={handleAddTimer}
          className="bg-accent rounded-full px-12 py-4 shadow-lg -mt-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          activeOpacity={0.8}
          accessibilityLabel="Add timer"
          accessibilityHint={`Add a ${minutes} minute timer`}
          accessibilityRole="button"
        >
          <Text className="text-white text-lg font-ubuntu-medium">
            add
          </Text>
        </TouchableOpacity>
      </View>
    </FormModal>
  );
};
