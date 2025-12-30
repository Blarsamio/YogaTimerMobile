import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { useAudioPlayer } from 'expo-audio';

interface TimerProps {
  duration: number;
  title?: string;
}

export const Timer: React.FC<TimerProps> = ({ duration, title }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isActive, setIsActive] = useState(false);
  const player = useAudioPlayer(require('../../assets/audio/bowl.wav'));

  function playSound() {
    try {
      player.seekTo(0);
      player.play();
    } catch (error) {
      // Error playing sound
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (interval) clearInterval(interval);
      playSound();
      setIsActive(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  return (
    <View className="py-2 border border-gold rounded-lg mb-4">
      <View>
        {title && <Text className="text-gray-500 text-xl font-zen">{title}</Text>}
        <Text className="text-lg text-black">
          {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
        </Text>
      </View>
    </View>
  );
};
