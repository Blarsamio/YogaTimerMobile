import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, ScrollView, Dimensions, Image } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BackButton } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AudioPlayer } from 'expo-audio';

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
  image: number; // Required image asset from require()
  preview?: string; // Audio file path for preview
}

const BACKGROUND_IMAGES = {
  'nature-meditation': require('../../assets/images/background-music/nature-meditation.jpg'),
  'ocean-waves': require('../../assets/images/background-music/ocean-waves.jpg'),
  'rain-forest': require('../../assets/images/background-music/rain-forest.jpg'),
  'tibetan-bowls': require('../../assets/images/background-music/tibetan-bowls.jpg'),
}

// Placeholder music tracks - replace with actual tracks later
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
  
  const previewSoundRef = useRef<AudioPlayer | null>(null);

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';

  // Load session data
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
      // Failed to load session data
    }
  };

  // Save background music selection
  const saveBackgroundMusicSelection = async (musicId: string | null, noMusic: boolean) => {
    try {
      const musicData = {
        musicId,
        noMusic,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.BACKGROUND_MUSIC, JSON.stringify(musicData));
    } catch (error) {
      // Failed to save background music selection
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
        // Keep sound and background music preferences for next time
      ]);
    } catch (error) {
      // Failed to clear session data
    }
  };

  const handlePreviewToggle = async (trackId: string) => {
    try {
      if (previewPlaying === trackId) {
        // Stop current preview
        if (previewSoundRef.current) {
          await previewSoundRef.current.stopAsync();
          previewSoundRef.current = null;
        }
        setPreviewPlaying(null);
      } else {
        // Stop any currently playing preview
        if (previewSoundRef.current) {
          await previewSoundRef.current.stopAsync();
          previewSoundRef.current = null;
        }

        // For now, we'll simulate preview with a sample sound
        // In a real app, you'd load the actual music track file
        const player = new AudioPlayer(require('../../assets/audio/bowl.wav'));
        await player.play();
        
        previewSoundRef.current = player;
        setPreviewPlaying(trackId);
      }
    } catch (error) {
      // Error handling preview sound
      setPreviewPlaying(null);
    }
  };

  // Cleanup preview sound on unmount or screen blur
  useEffect(() => {
    return () => {
      if (previewSoundRef.current) {
        previewSoundRef.current.stopAsync();
      }
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Stop preview when leaving screen
        if (previewSoundRef.current) {
          previewSoundRef.current.stopAsync();
          previewSoundRef.current = null;
        }
        setPreviewPlaying(null);
      };
    }, [])
  );

  const handleStart = async () => {
    // Create a session object from the custom timers
    const customSession = {
      id: Date.now(), // Use timestamp as temporary ID for custom sessions
      name: 'Custom Practice',
      description: 'Your personalized yin yoga flow',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      timers: timers.map((timer, index) => ({
        id: parseInt(timer.id),
        duration: timer.duration * 60, // Convert minutes to seconds for execution
        title: timer.label,
        session_id: Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })),
    };

    // Starting custom session with configured settings

    // Clear the timer list since the session is starting
    await clearSessionData();

    // Navigate to SessionExecution with the custom session
    navigation.navigate('SessionExecution', {
      session: customSession,
      transitionSound: selectedSound,
      backgroundMusic: noBackgroundMusic ? undefined : (selectedMusicId ?? undefined),
    });
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
          {/* Background music track image */}
          <Image
            source={track.image}
            className="flex-1 w-full"
            resizeMode="cover"
          />

          {/* Overlay with gradient for text readability */}
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

          {/* Selection indicator */}
          {isSelected && (
            <View className="absolute top-4 right-4 w-8 h-8 rounded-full bg-accent items-center justify-center">
              <Ionicons name="checkmark" size={18} color="white" />
            </View>
          )}

          {/* Play preview button */}
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
      {/* Header */}
      <View className="flex-row items-center mb-8">
        <BackButton onPress={handleBack} />
        <View className="flex-1 ml-4">
          <Text className="text-3xl font-zen" style={{ color: textColor }}>
            background music
          </Text>
        </View>
      </View>

      {/* Tab indicators (Presets, Music, Custom) */}
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

      {/* Music Carousel */}
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

        {/* Dots indicator */}
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

      {/* No Background Music Option */}
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

      {/* Bottom buttons */}
      <View className="flex-row gap-4 pb-8">
        <TouchableOpacity
          onPress={handleBack}
          className="flex-1 py-4 px-6 rounded-full border border-accent/50"
          activeOpacity={0.8}
        >
          <Text
            className="text-center text-lg font-ubuntu-medium"
            style={{ color: textColor }}
          >
            ◀ back
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
    </View>
  );
};
