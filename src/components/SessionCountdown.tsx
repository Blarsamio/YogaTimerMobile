import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { API_URL } from '../config/api';
import { Session, Timer } from '../types';

type RootStackParamList = {
  SessionDetail: { sessionId: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SessionDetail'>;

export const SessionCountdown: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const [session, setSession] = useState<Session | null>(null);
  const [currentTimerIndex, setCurrentTimerIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);
  const [key, setKey] = useState(0);
  const sessionId = (route.params as { sessionId: number }).sessionId;

  useEffect(() => {
    fetch(`${API_URL}/sessions/${sessionId}`)
      .then((response) => response.json())
      .then((data) => {
        setSession(data);
        if (data.timers.length > 0) {
          setKey((prevKey) => prevKey + 1);
        }
      });
  }, [sessionId]);

  const handleSkip = () => {
    if (session && currentTimerIndex + 1 < session.timers.length) {
      setCurrentTimerIndex((prevIndex) => prevIndex + 1);
      setKey((prevKey) => prevKey + 1);
    }
  };

  const handleComplete = () => {
    if (session && currentTimerIndex + 1 < session.timers.length) {
      setCurrentTimerIndex((prevIndex) => prevIndex + 1);
      setKey((prevKey) => prevKey + 1);
    } else {
      setIsSessionActive(false);
      navigation.navigate('SessionDetail', { sessionId });
    }
    return { shouldRepeat: false };
  };

  if (!session) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#D4AF37" />
      </View>
    );
  }

  return (
    <View className="flex-1 items-center p-6">
      <Text className="text-4xl text-black font-semibold mb-4">{session.name}</Text>
      <View className="items-center mt-4">
        <CountdownCircleTimer
          key={key}
          size={350}
          isPlaying={isSessionActive && !isPaused}
          duration={session.timers[currentTimerIndex].duration}
          colors="#A99985"
          onComplete={handleComplete}
        >
          {({ remainingTime }) => (
            <View className="items-center">
              <Text className="text-black text-5xl">
                {Math.floor(remainingTime / 60)}:{('0' + (remainingTime % 60)).slice(-2)}
              </Text>
              <Text className="text-2xl text-black mt-2">
                {session.timers[currentTimerIndex].title}
              </Text>
            </View>
          )}
        </CountdownCircleTimer>
        <TouchableOpacity
          onPress={handleSkip}
          className="bg-gold p-2 rounded mt-4 w-full"
        >
          <Text className="text-white text-center">Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
