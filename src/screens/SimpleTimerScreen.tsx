import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { useAudioPlayer } from 'expo-audio';
import { H1, BodyText, Button, BackButton } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type SimpleTimerRouteProp = RouteProp<RootStackParamList, 'SimpleTimer'>;

export const SimpleTimerScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<SimpleTimerRouteProp>();
  const { isDark } = useTheme();
  const { duration } = route.params;

  const [isPlaying, setIsPlaying] = useState(false);
  const [key, setKey] = useState(0);

  // Create audio player for timer completion sound
  const player = useAudioPlayer(require('../../assets/audio/bowl.wav'));

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';
  const timerColor = isDark ? '#A99985' : '#A99985';

  const durationInSeconds = duration * 60;

  const playSound = () => {
    try {
      player.seekTo(0); // Reset to beginning
      player.play();
    } catch (error) {
      // Error playing sound
    }
  };

  const handleComplete = () => {
    playSound();
    setIsPlaying(false);
    return { shouldRepeat: false };
  };

  const handleStart = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setKey(prev => prev + 1);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <View className="flex-1 px-6 pt-16" style={{ backgroundColor }}>
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <BackButton onPress={handleBack} />
        <View className="flex-1 ml-4">
          <H1 style={{ color: textColor }}>{duration} Minute Timer</H1>
        </View>
      </View>

      {/* Timer */}
      <View className="flex-1 justify-center items-center">
        <CountdownCircleTimer
          key={key}
          size={280}
          strokeWidth={8}
          isPlaying={isPlaying}
          duration={durationInSeconds}
          colors={timerColor}
          onComplete={handleComplete}
        >
          {({ remainingTime }) => (
            <View className="items-center">
              <H1 style={{ color: textColor, fontSize: 48 }}>
                {Math.floor(remainingTime / 60)}:{('0' + (remainingTime % 60)).slice(-2)}
              </H1>
              <BodyText
                className="mt-2 opacity-70"
                style={{ color: textColor }}
              >
                {remainingTime > 0 ? 'remaining' : 'Complete!'}
              </BodyText>
            </View>
          )}
        </CountdownCircleTimer>
      </View>

      {/* Controls */}
      <View className="pb-8 space-y-3">
        <View className="flex-row space-x-3">
          <View className="flex-1">
            <Button
              title={isPlaying ? "Pause" : "Start"}
              onPress={isPlaying ? handlePause : handleStart}
              variant="primary"
            />
          </View>
          <View className="flex-1">
            <Button
              title="Reset"
              onPress={handleReset}
              variant="secondary"
            />
          </View>
        </View>
      </View>
    </View>
  );
};
