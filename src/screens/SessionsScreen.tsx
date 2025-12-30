import React, { useState } from 'react';
import { View, ActivityIndicator, Text, Alert, TouchableOpacity } from 'react-native';
import { SessionList } from '../components/SessionList';
import { Session } from '../types';
import { useSessions, useDeleteSession } from '../hooks/useSessions';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTheme } from '../contexts/ThemeContext';
import { BackButton, H1 } from '../components/ui';

type Props = NativeStackScreenProps<RootStackParamList, 'Sessions'>;

export const SessionsScreen: React.FC<Props> = ({ navigation }) => {
  const { isDark } = useTheme();
  const { data: sessions = [], isLoading, error: queryError, refetch } = useSessions();
  const { mutate: deleteSession } = useDeleteSession();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';

  const handleBack = () => {
    navigation.navigate('Home');
  };

  const handleDelete = async (id: number | string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this yoga session? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSession(id, {
              onError: (err) => {
                setDeleteError(err instanceof Error ? err.message : 'Failed to delete session');
              },
            });
          },
        },
      ]
    );
  };

  const handleStartSession = (session: Session) => {
    // Navigate to session execution with default preferences
    navigation.navigate('SessionExecution', {
      session,
      transitionSound: 'bowl', // Default transition sound
      backgroundMusic: undefined, // No background music by default
    });
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor }}>
        <ActivityIndicator size="large" color="#A99985" />
        <Text className="text-lg font-zen mt-4" style={{ color: textColor }}>
          Loading yoga sessions...
        </Text>
      </View>
    );
  }

  if (queryError || deleteError) {
    const errorMsg = queryError ? (queryError as Error).message : deleteError;
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        {/* Header with back button */}
        <View className="flex-row items-center mb-8 px-6 pt-16">
          <BackButton onPress={handleBack} />
          <View className="flex-1 ml-4">
            <H1 className="text-h1" style={{ color: textColor }}>
              yoga sessions
            </H1>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <Text className="text-lg font-zen text-center mb-4" style={{ color: textColor }}>
            Unable to connect to server
          </Text>
          <Text className="text-sm text-center opacity-70 mb-4" style={{ color: textColor }}>
            {errorMsg}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
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

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      {/* Header with back button */}
      <View className="flex-row items-center mb-8 px-6 pt-16">
        <BackButton onPress={handleBack} />
        <View className="flex-1 ml-4">
          <H1 className="text-h1" style={{ color: textColor }}>
            yoga sessions
          </H1>
        </View>
      </View>

      <SessionList
        sessions={sessions}
        onDelete={handleDelete}
        onStartSession={handleStartSession}
      />
    </View>
  );
};
