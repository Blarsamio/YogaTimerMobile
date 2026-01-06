import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Dimensions, Image, Modal, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButton } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer } from 'expo-audio';
import { ApiService } from '../config/api';
import { useDeviceUser } from '../hooks/useDeviceUser';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Timer {
  id: string;
  duration: number;
  label: string;
}

interface BackgroundMusicTrack {
  id: string;
  name: string;
  description: string;
  image: number;
  preview?: string;
}

const BACKGROUND_IMAGES = {
  'nature-meditation': require('../../assets/images/background-music/nature-meditation.jpg'),
  'ocean-waves': require('../../assets/images/background-music/ocean-waves.jpg'),
  'rain-forest': require('../../assets/images/background-music/rain-forest.jpg'),
  'tibetan-bowls': require('../../assets/images/background-music/tibetan-bowls.jpg'),
}

const BACKGROUND_MUSIC_TRACKS: BackgroundMusicTrack[] = [
  {
    id: 'nature-meditation',
    name: 'Nature Meditation',
    description: 'Peaceful forest sounds',
    image: BACKGROUND_IMAGES['nature-meditation'],
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Calming ocean sounds',
    image: BACKGROUND_IMAGES['ocean-waves'],
  },
  {
    id: 'rain-forest',
    name: 'Rain Forest',
    description: 'Gentle rain in forest',
    image: BACKGROUND_IMAGES['rain-forest'],
  },
  {
    id: 'tibetan-bowls',
    name: 'Tibetan Bowls',
    description: 'Sacred singing bowls',
    image: BACKGROUND_IMAGES['tibetan-bowls'],
  },
];

const STORAGE_KEYS = {
  BACKGROUND_MUSIC: 'session_backgroundMusic',
  TIMERS: 'createTimer_timerList',
  SELECTED_SOUND: 'createTimer_selectedSound',
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.84;

export const BackgroundMusicScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute();
  const { isDark } = useTheme();

  const [selectedMusicId, setSelectedMusicId] = useState<string | null>(null);
  const [noBackgroundMusic, setNoBackgroundMusic] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timers, setTimers] = useState<Timer[]>([]);
  const [selectedSound, setSelectedSound] = useState('bowl');

  const [previewPlaying, setPreviewPlaying] = useState<string | null>(null);

  const [saveModalVisible, setSaveModalVisible] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { deviceId } = useDeviceUser();

  const previewPlayer = useAudioPlayer(require('../../assets/audio/bowl.wav'));

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';

  const loadSessionData = async () => {
    try {
      const [savedTimers, savedSound, savedBackgroundMusic] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.TIMERS),
        AsyncStorage.getItem(STORAGE_KEYS.SELECTED_SOUND),
        AsyncStorage.getItem(STORAGE_KEYS.BACKGROUND_MUSIC),
      ]);

      if (savedTimers) {
        setTimers(JSON.parse(savedTimers));
      }

      if (savedSound) {
        setSelectedSound(savedSound);
      }

      if (savedBackgroundMusic) {
        const musicData = JSON.parse(savedBackgroundMusic);
        if (musicData.noMusic) {
          setNoBackgroundMusic(true);
          setSelectedMusicId(null);
        } else {
          setSelectedMusicId(musicData.musicId);
          setNoBackgroundMusic(false);
        }
      }
    } catch (error) {

    }
  };

  const saveBackgroundMusicSelection = async (musicId: string | null, noMusic: boolean) => {
    try {
      const musicData = {
        musicId,
        noMusic,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND_MUSIC, JSON.stringify(musicData));
    } catch (error) {
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadSessionData();
    }, [])
  );

  const handleBack = () => {
    navigation.navigate('Home');
  };

  const handleMusicSelect = (musicId: string) => {
    setSelectedMusicId(musicId);
    setNoBackgroundMusic(false);
    saveBackgroundMusicSelection(musicId, false);
  };

  const handleNoMusicToggle = () => {
    const newNoMusic = !noBackgroundMusic;
    setNoBackgroundMusic(newNoMusic);
    if (newNoMusic) {
      setSelectedMusicId(null);
    }
    saveBackgroundMusicSelection(null, newNoMusic);
  };

  const clearSessionData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.TIMERS),
      ]);
    } catch (error) {
    }
  };

  const handlePreviewToggle = (trackId: string) => {
    try {
      if (previewPlaying === trackId) {
        previewPlayer.pause();
        previewPlayer.seekTo(0);
        setPreviewPlaying(null);
      } else {
        previewPlayer.seekTo(0);
        previewPlayer.play();
        setPreviewPlaying(trackId);
      }
    } catch (error) {
      setPreviewPlaying(null);
    }
  };
  useEffect(() => {
    return () => {
      previewPlayer.pause();
    };
  }, [previewPlayer]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        previewPlayer.pause();
        setPreviewPlaying(null);
      };
    }, [previewPlayer])
  );

  const handleStart = async () => {
    const customSession = {
      id: Date.now(),
      name: 'Custom Practice',
      description: 'Your personalized yin yoga flow',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      timers: timers.map((timer, index) => ({
        id: timer.id,
        duration: timer.duration * 60,
        title: timer.label,
        session_id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    };

    await clearSessionData();
    navigation.navigate('SessionExecution', {
      session: customSession,
      transitionSound: selectedSound,
      backgroundMusic: noBackgroundMusic ? undefined : (selectedMusicId ?? undefined),
    });
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      Alert.alert('Session Name Required', 'Please enter a name for your session.');
      return;
    }

    setIsSaving(true);
    try {
      const sessionResponse = await ApiService.createSession({
        name: sessionName.trim(),
        description: 'Custom yoga session',
        deviceId: deviceId || undefined,
        timers: timers.map(timer => ({
          title: timer.label,
          duration: timer.duration * 60,
        })),
      });

      if (sessionResponse.error || !sessionResponse.data) {
        throw new Error(sessionResponse.error || 'Failed to create session');
      }

      // Clear local session data
      await clearSessionData();

      setSaveModalVisible(false);
      Alert.alert(
        'Session Saved! 🙏',
        `"${sessionName}" has been added to your session library.`,
        [{ text: 'OK', onPress: () => navigation.navigate('Home') }]
      );
    } catch (error) {
      console.error('Session save failed:', error);
      Alert.alert(
        'Save Failed',
        'Unable to save your session. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderMusicCard = (track: BackgroundMusicTrack, index: number) => {
    const isSelected = selectedMusicId === track.id;

    return (
      <TouchableOpacity
        key={track.id}
        onPress={() => handleMusicSelect(track.id)}
        className={`rounded-3xl overflow-hidden mx-2 ${
          isSelected ? 'border-4 border-accent' : 'border-2 border-accent/20'
        }`}
        style={{ width: CARD_WIDTH, height: CARD_WIDTH * 0.75 }}
        activeOpacity={0.8}
      >
        <View className="flex-1 relative">
          <Image
            source={track.image}
            className="flex-1 w-full"
            resizeMode="cover"
          />

          <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
            <Text
              className="text-lg font-zen text-white text-center"
            >
              {track.name}
            </Text>
            <Text
              className="text-sm opacity-90 text-white text-center mt-1"
            >
              {track.description}
            </Text>
          </View>

          {isSelected && (
            <View className="absolute top-4 right-4 w-8 h-8 rounded-full bg-accent items-center justify-center">
              <Ionicons name="checkmark" size={18} color="white" />
            </View>
          )}

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handlePreviewToggle(track.id);
            }}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-accent/90 items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons
              name={previewPlaying === track.id ? "pause" : "play"}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 px-6 pt-16" style={{ backgroundColor }}>
      <View className="flex-row items-center mb-8">
        <BackButton onPress={handleBack} />
        <View className="flex-1 ml-4">
          <Text className="text-3xl font-zen" style={{ color: textColor }}>
            background music
          </Text>
        </View>
      </View>

      <View className="flex-row justify-center mb-8">
        <View className="flex-row bg-accent/10 rounded-full p-1">
          <View className="px-4 py-2 rounded-full bg-accent">
            <Text className="text-sm font-ubuntu-medium text-white">
              Music
            </Text>
          </View>
          <View className="px-4 py-2 rounded-full">
            <Text className="text-sm font-ubuntu-medium opacity-50" style={{ color: textColor }}>
              Custom <Text className="text-xs">(soon)</Text>
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-1 justify-center">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          decelerationRate="fast"
          snapToInterval={CARD_WIDTH + 16}
          contentInsetAdjustmentBehavior="automatic"
          className="flex-grow-0"
          style={{ height: CARD_WIDTH * 0.75 }}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
            setCurrentIndex(newIndex);
          }}
          contentContainerStyle={{
            paddingHorizontal: 5,
          }}
        >
          {BACKGROUND_MUSIC_TRACKS.map((track, index) => renderMusicCard(track, index))}
        </ScrollView>

        <View className="flex-row justify-center mt-6">
          {BACKGROUND_MUSIC_TRACKS.map((_, index) => (
            <View
              key={index}
              className={`w-2 h-2 rounded-full mx-1 ${
                index === currentIndex ? 'bg-accent' : 'bg-accent/30'
              }`}
            />
          ))}
        </View>
      </View>

      <View className="mb-8">
        <TouchableOpacity
          onPress={handleNoMusicToggle}
          className="flex-row items-center justify-center p-4 rounded-2xl border"
          style={{
            backgroundColor: noBackgroundMusic ? cardBgColor : 'transparent',
            borderColor: noBackgroundMusic ? '#A99985' : '#A99985',
            borderWidth: noBackgroundMusic ? 2 : 1,
          }}
          activeOpacity={0.7}
        >
          <View className={`w-6 h-6 rounded-full border-2 border-accent mr-3 items-center justify-center ${
            noBackgroundMusic ? 'bg-accent' : 'bg-transparent'
          }`}>
            {noBackgroundMusic && (
              <Ionicons name="checkmark" size={14} color="white" />
            )}
          </View>
          <Text
            className="text-lg font-ubuntu-medium"
            style={{ color: textColor }}
          >
            no background music
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row gap-4 pb-8">
        <TouchableOpacity
          onPress={() => setSaveModalVisible(true)}
          className="flex-1 py-4 px-6 rounded-full border border-accent/50"
          activeOpacity={0.8}
        >
          <Text
            className="text-center text-lg font-ubuntu-medium"
            style={{ color: textColor }}
          >
            save
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStart}
          className="flex-1 py-4 px-6 rounded-full bg-accent"
          activeOpacity={0.8}
        >
          <Text className="text-center text-lg font-ubuntu-medium text-white">
            start ▶
          </Text>
        </TouchableOpacity>
      </View>


      <Modal
        animationType="fade"
        transparent={true}
        visible={saveModalVisible}
        onRequestClose={() => setSaveModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <View className="flex-1 justify-center items-center bg-black/50 p-6">
            <View
              className="w-full max-w-sm rounded-3xl p-6"
              style={{ backgroundColor: cardBgColor }}
            >
              <Text className="text-xl font-zen mb-2 text-center" style={{ color: textColor }}>
                Save Session
              </Text>
              <Text className="text-sm opacity-70 mb-6 text-center" style={{ color: textColor }}>
                Give your practice a name to save it to your library.
              </Text>

              <Text className="text-xs opacity-50 mb-1 ml-1" style={{ color: textColor }}>SESSION NAME</Text>
              <TextInput
                value={sessionName}
                onChangeText={setSessionName}
                placeholder="Ex: Morning Flow"
                placeholderTextColor={isDark ? '#666' : '#999'}
                className="w-full p-4 rounded-xl mb-6 text-lg font-zen border"
                style={{
                  backgroundColor: isDark ? '#2C2C2C' : '#F0F0F0',
                  color: textColor,
                  borderColor: 'transparent'
                }}
                autoFocus
              />

              <View className="flex-row gap-4">
                <TouchableOpacity
                  onPress={() => setSaveModalVisible(false)}
                  className="flex-1 py-3 rounded-full border border-gray-500/30"
                  disabled={isSaving}
                >
                  <Text className="text-center font-ubuntu-medium" style={{ color: textColor }}>
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveSession}
                  className="flex-1 py-3 rounded-full bg-accent items-center justify-center"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text className="text-center font-ubuntu-medium text-white">
                      Save
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
