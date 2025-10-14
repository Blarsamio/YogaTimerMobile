import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { FormModal } from './FormModal';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, AudioModule } from 'expo-audio';

interface SoundSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSound: string;
  onSelectSound: (sound: string) => void;
}

const SOUND_FILES = {
  bowl: require('../../assets/audio/bowl.wav'),
  // Add other sound files here when available
  // bell: require('../../assets/bell.wav'),
  // chime: require('../../assets/chime.wav'),
  // gong: require('../../assets/gong.wav'),
};

const AVAILABLE_SOUNDS = [
  { id: 'bowl', name: 'Singing Bowl', icon: 'musical-note', description: 'Deep, resonant tone', file: SOUND_FILES.bowl },
  { id: 'bell', name: 'Temple Bell', icon: 'notifications', description: 'Clear, peaceful chime', file: null },
  { id: 'chime', name: 'Wind Chime', icon: 'leaf', description: 'Gentle, flowing melody', file: null },
  { id: 'gong', name: 'Meditation Gong', icon: 'radio', description: 'Rich, vibrating sound', file: null },
  { id: 'none', name: 'Silent', icon: 'volume-mute', description: 'No sound notification', file: null },
];

export const SoundSelectModal: React.FC<SoundSelectModalProps> = ({
  isOpen,
  onClose,
  selectedSound,
  onSelectSound,
}) => {
  const { isDark } = useTheme();
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  // Create audio player for bowl sound (the only available sound file)
  const bowlPlayer = useAudioPlayer(SOUND_FILES.bowl);
  const currentPlayerRef = useRef<typeof bowlPlayer | null>(null);

  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';
  const optionBgColor = isDark ? '#2D2D2D' : '#FFFFFF';

  useEffect(() => {
    const configureAudio = async () => {
      try {
        await AudioModule.setAudioModeAsync({
          allowsRecording: false,
          shouldPlayInBackground: false,
          playsInSilentMode: true,
          shouldRouteThroughEarpiece: false,
          interruptionModeAndroid: 'duckOthers',
          interruptionMode: 'duckOthers',
        });
      } catch (error) {
        // Failed to configure audio
      }
    };

    configureAudio();
  }, []);

  // Stop playing sound when modal closes
  useEffect(() => {
    if (!isOpen && playingSound && currentPlayerRef.current) {
      currentPlayerRef.current.pause();
      setPlayingSound(null);
    }
  }, [isOpen, playingSound]);

  const handleSelectSound = (soundId: string) => {
    onSelectSound(soundId);
  };

  const handlePreviewSound = (soundId: string) => {
    try {
      // If this sound is currently playing, stop it
      if (playingSound === soundId) {
        if (currentPlayerRef.current) {
          currentPlayerRef.current.pause();
        }
        setPlayingSound(null);
        currentPlayerRef.current = null;
        return;
      }

      // Stop any other sound that might be playing
      if (currentPlayerRef.current) {
        currentPlayerRef.current.pause();
      }

      const soundFile = AVAILABLE_SOUNDS.find(s => s.id === soundId)?.file;
      if (!soundFile) {
        // Sound file not found
        return;
      }

      // For now, only bowl sound is available
      if (soundId === 'bowl') {
        setPlayingSound(soundId);
        currentPlayerRef.current = bowlPlayer;

        // Reset to beginning and play
        bowlPlayer.seekTo(0);
        bowlPlayer.play();

        // Set up a timeout to reset playing state when sound finishes
        // Note: expo-audio doesn't have the same status listener API
        setTimeout(() => {
          if (playingSound === soundId) {
            setPlayingSound(null);
            currentPlayerRef.current = null;
          }
        }, 3000); // Assume bowl sound is ~3 seconds
      } else {
        // Sound preview not available
      }
    } catch (error) {
      // Error playing sound
      setPlayingSound(null);
    }
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose}>
      <View className="items-center">
        {/* Sound Selection Card */}
        <View
          className="rounded-3xl p-8 mx-4 w-full"
          style={{
            backgroundColor: cardBgColor,
            maxWidth: 380,
            minWidth: 320
          }}
        >
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-accent/20 items-center justify-center mb-3">
              <Ionicons name="volume-high" size={28} color="#A99985" />
            </View>
            <Text
              className="text-xl font-zen text-center"
              style={{ color: textColor }}
            >
              timer sound
            </Text>
          </View>

          {/* Sound Options */}
          <ScrollView
            className="max-h-80 mb-4"
            showsVerticalScrollIndicator={false}
          >
            {AVAILABLE_SOUNDS.map((sound, index) => (
              <TouchableOpacity
                key={sound.id}
                onPress={() => handleSelectSound(sound.id)}
                className={`rounded-2xl mb-3 overflow-hidden ${
                  selectedSound === sound.id ? 'border-2 border-accent' : 'border border-accent/20'
                }`}
                style={{
                  backgroundColor: selectedSound === sound.id ? '#A99985' : optionBgColor
                }}
                activeOpacity={0.8}
              >
                <View className="p-5">
                  <View className="flex-row items-center">
                    {/* Icon */}
                    <View className={`w-14 h-14 rounded-full items-center justify-center mr-4 ${
                      selectedSound === sound.id ? 'bg-white/20' : 'bg-accent/10'
                    }`}>
                      <Ionicons
                        name={sound.icon as keyof typeof Ionicons.glyphMap}
                        size={24}
                        color={selectedSound === sound.id ? 'white' : '#A99985'}
                      />
                    </View>

                    {/* Text Content */}
                    <View className="flex-1 mr-3">
                      <Text
                        className="text-lg font-ubuntu-medium mb-1"
                        style={{
                          color: selectedSound === sound.id ? 'white' : textColor
                        }}
                      >
                        {sound.name}
                      </Text>
                      <Text
                        className="text-sm opacity-80"
                        style={{
                          color: selectedSound === sound.id ? 'white' : textColor
                        }}
                      >
                        {sound.description}
                      </Text>
                    </View>

                    {/* Preview Button */}
                    {sound.id !== 'none' && sound.file && (
                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handlePreviewSound(sound.id);
                        }}
                        className={`w-12 h-12 rounded-full items-center justify-center ${
                          selectedSound === sound.id ? 'bg-white/20' : 'bg-accent/10'
                        }`}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={playingSound === sound.id ? "stop" : "play"}
                          size={18}
                          color={selectedSound === sound.id ? 'white' : '#A99985'}
                        />
                      </TouchableOpacity>
                    )}

                                        {/* Coming Soon indicator for sounds without files */}
                    {sound.id !== 'none' && !sound.file && (
                      <View className={`px-4 py-2 rounded-full ${
                        selectedSound === sound.id ? 'bg-white/20' : 'bg-accent/10'
                      }`}>
                        <Text
                          className="text-sm"
                          style={{
                            color: selectedSound === sound.id ? 'white' : '#A99985'
                          }}
                        >
                          soon
                        </Text>
                      </View>
                    )}

                    {/* Selection Indicator */}
                    {selectedSound === sound.id && (
                      <View className="w-8 h-8 rounded-full bg-white items-center justify-center ml-2">
                        <Ionicons name="checkmark" size={18} color="#A99985" />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Done Button - positioned to overlap bottom of card */}
        <TouchableOpacity
          onPress={onClose}
          className="bg-accent rounded-full px-12 py-4 shadow-lg -mt-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-ubuntu-medium">
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </FormModal>
  );
};
