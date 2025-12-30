import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, ScrollView, Text, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Session, Asana, Timer } from '../types';
import { ApiService } from '../config/api';
import { H1, BackButton } from './ui';
import { Loading } from './common/Loading';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  SessionCountdown: { sessionId: number };
  SessionExecution: {
    session: Session;
    transitionSound: string;
    backgroundMusic?: string;
  };
  AsanaDetail: { asanaId: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const SessionShow: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();

    const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [asanas, setAsanas] = useState<Asana[]>([]);

  const sessionId = (route.params as { sessionId: number }).sessionId;

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';
  const accentColor = '#A99985';

  useEffect(() => {
    fetchSession();
    fetchAsanas();
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ApiService.getSession(sessionId);

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        setSession(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session');
      // Error fetching session
    } finally {
      setLoading(false);
    }
  };

  const fetchAsanas = async () => {
    try {
      const response = await ApiService.getAsanas();
      if (response.data && Array.isArray(response.data)) {
        setAsanas(response.data);
      } else {
        console.warn('Asanas data is not an array:', response);
        setAsanas([]);
      }
    } catch (err) {
      console.error('Failed to fetch asanas:', err);
      setAsanas([]);
    }
  };

    const handleTimerPress = (timer: Timer) => {
    // Check if timer has a title
    if (!timer.title) {
      Alert.alert(
        'No Title',
        'This timer does not have a title to match with asana details.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Find matching asana by title
    const matchingAsana = asanas.find(asana =>
      asana.title.toLowerCase().trim() === timer.title!.toLowerCase().trim()
    );

    if (matchingAsana) {
      navigation.navigate('AsanaDetail', { asanaId: matchingAsana.id });
    } else {
      // Show an alert if no matching asana is found
      Alert.alert(
        'Asana Details Not Available',
        `No detailed information found for "${timer.title}". This might be a custom pose.`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleDeleteTimer = async (timerId: number | string) => {
    Alert.alert(
      'Delete Timer',
      'Are you sure you want to remove this timer from the session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await ApiService.deleteTimer(timerId);

              if (response.error) {
                throw new Error(response.error);
              }

              setSession(prevSession =>
                prevSession ? {
                  ...prevSession,
                  timers: prevSession.timers.filter(timer => timer.id !== timerId),
                } : null
              );
            } catch (err) {
              Alert.alert(
                'Error',
                err instanceof Error ? err.message : 'Failed to delete timer'
              );
            }
          },
        },
      ]
    );
  };

  const handleStartSession = () => {
    if (!session) return;

    // Navigate to session execution with default preferences
    navigation.navigate('SessionExecution', {
      session,
      transitionSound: 'bowl', // Default transition sound
      backgroundMusic: undefined, // No background music by default
    });
  };

  const handleBack = () => {
    navigation.navigate('Home');
  };

  const getTotalDuration = () => {
    if (!session) return 0;
    return session.timers.reduce((total, timer) => total + timer.duration, 0);
  };

  const formatTotalDuration = () => {
    const totalSeconds = getTotalDuration();
    const minutes = Math.floor(totalSeconds / 60);
    return minutes > 0 ? `${minutes} minutes total` : '';
  };

  if (loading) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <View className="flex-row items-center mb-8 px-6 pt-16">
          <BackButton onPress={handleBack} />
        </View>
        <Loading />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <View className="flex-row items-center mb-8 px-6 pt-16">
          <BackButton onPress={handleBack} />
          <View className="flex-1 ml-4">
            <H1 className="text-h1" style={{ color: textColor }}>
              session details
            </H1>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-lg font-zen text-center mb-4" style={{ color: textColor }}>
            Unable to load session
          </Text>
          <Text className="text-sm text-center opacity-70 mb-4" style={{ color: textColor }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchSession}
            className="bg-accent px-6 py-3 rounded-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-zen text-center">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <View className="flex-row items-center mb-8 px-6 pt-16">
          <BackButton onPress={handleBack} />
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg font-zen" style={{ color: textColor }}>
            Session not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      {/* Header with back button */}
      <View className="flex-row items-center mb-8 px-6 pt-16">
        <BackButton onPress={handleBack} />
        <View className="flex-1 ml-4">
          <H1 className="text-h1" style={{ color: textColor }}>
            session details
          </H1>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Session Info Card */}
        <View
          className="p-6 rounded-3xl mb-6 shadow-sm"
          style={{ backgroundColor: cardBgColor }}
        >
          <H1 className="text-2xl font-zen mb-3" style={{ color: textColor }}>
            {session.name}
          </H1>

          {session.description && (
            <Text
              className="text-base leading-6 mb-4 opacity-80"
              style={{ color: textColor }}
            >
              {session.description}
            </Text>
          )}

          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color={accentColor} />
            <Text
              className="ml-2 font-zen text-sm"
              style={{ color: accentColor }}
            >
              {formatTotalDuration()}
            </Text>
          </View>
        </View>

        {/* Timers Section */}
        <View className="mb-6">
          <Text className="text-lg font-zen mb-4" style={{ color: textColor }}>
            list of asanas
          </Text>

          {session.timers.length === 0 ? (
            <View
              className="p-6 rounded-2xl border border-dashed"
              style={{
                backgroundColor: cardBgColor,
                borderColor: accentColor + '40'
              }}
            >
              <View className="items-center">
                <Ionicons name="add-circle-outline" size={32} color={accentColor} style={{ opacity: 0.6 }} />
                <Text
                  className="text-center mt-3 font-zen opacity-70"
                  style={{ color: textColor }}
                >
                  No poses added yet
                </Text>
                <Text
                  className="text-center text-sm mt-1 opacity-50"
                  style={{ color: textColor }}
                >
                  Add your first yoga pose below
                </Text>
              </View>
            </View>
          ) : (
            <View className="gap-3">
                             {session.timers.map((timer, index) => (
                 <TouchableOpacity
                   key={timer.id}
                   onPress={() => handleTimerPress(timer)}
                   activeOpacity={0.7}
                   className="bg-white/50 rounded-2xl overflow-hidden"
                   style={{ backgroundColor: cardBgColor }}
                 >
                  <View className="flex-row items-center p-4">
                    <View className="w-8 h-8 rounded-full bg-accent items-center justify-center mr-4">
                      <Text className="text-white font-zen text-sm">
                        {index + 1}
                      </Text>
                    </View>

                    <View className="flex-1">
                      <Text className="font-zen text-base mb-1" style={{ color: textColor }}>
                        {timer.title}
                      </Text>
                      <Text className="text-sm opacity-70" style={{ color: textColor }}>
                        {ApiService.formatDuration(timer.duration)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteTimer(timer.id);
                      }}
                      className="p-2 ml-2"
                      activeOpacity={0.7}
                    >
                      <Ionicons name="trash-outline" size={18} color={textColor} style={{ opacity: 0.5 }} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Start Session Button - Fixed at bottom */}
      {session.timers.length > 0 && (
        <View
          className="px-6 pb-8 pt-4"
          style={{
            backgroundColor: backgroundColor,
            borderTopWidth: 1,
            borderTopColor: isDark ? '#3D3D3D' : '#E5E5E5',
          }}
        >
          <TouchableOpacity
            onPress={handleStartSession}
            className="bg-accent py-4 rounded-2xl shadow-sm"
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="play" size={20} color="white" />
              <Text className="text-white font-zen text-lg ml-3">
                Begin Practice
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
