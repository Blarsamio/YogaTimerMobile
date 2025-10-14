import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { H1, BodyText, Button, BackButton } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PRESET_TIMERS = [
  { duration: 5, label: '5 minutes', description: 'Quick meditation' },
  { duration: 10, label: '10 minutes', description: 'Short practice' },
  { duration: 15, label: '15 minutes', description: 'Medium session' },
  { duration: 20, label: '20 minutes', description: 'Extended practice' },
  { duration: 30, label: '30 minutes', description: 'Long session' },
  { duration: 45, label: '45 minutes', description: 'Deep practice' },
  { duration: 60, label: '60 minutes', description: 'Full session' },
];

export const QuickTimerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';

  const handleStartTimer = () => {
    if (selectedDuration) {
      // Navigate to a simple timer countdown
      navigation.navigate('SimpleTimer', { duration: selectedDuration });
    }
  };

  const handleBack = () => {
    navigation.navigate('Home');
  };

  return (
    <View className="flex-1 px-6 pt-16" style={{ backgroundColor }}>
      {/* Header with back button */}
      <View className="flex-row items-center mb-8">
        <BackButton onPress={handleBack} />
        <View className="flex-1 ml-4">
          <H1 style={{ color: textColor }}>Quick Timer</H1>
        </View>
      </View>

      {/* Timer options */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <BodyText
          className="mb-6 text-center opacity-70"
          style={{ color: textColor }}
        >
          Choose a preset timer duration
        </BodyText>

        <View className="space-y-3">
          {PRESET_TIMERS.map((timer) => (
            <TouchableOpacity
              key={timer.duration}
              onPress={() => setSelectedDuration(timer.duration)}
              className={`p-4 rounded-lg border ${
                selectedDuration === timer.duration
                  ? 'border-accent bg-accent/10'
                  : 'border-accent/30 bg-surface/50'
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <BodyText
                    className="text-lg font-ubuntu-medium"
                    style={{ color: textColor }}
                  >
                    {timer.label}
                  </BodyText>
                  <BodyText
                    className="opacity-70 mt-1"
                    style={{ color: textColor }}
                  >
                    {timer.description}
                  </BodyText>
                </View>
                {selectedDuration === timer.duration && (
                  <View className="w-6 h-6 rounded-full bg-accent items-center justify-center">
                    <View className="w-3 h-3 rounded-full bg-white" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Start button */}
      {selectedDuration && (
        <View className="pb-8 pt-4">
          <Button
            title={`Start ${selectedDuration} minute timer`}
            onPress={handleStartTimer}
            variant="primary"
            size="large"
          />
        </View>
      )}
    </View>
  );
};
