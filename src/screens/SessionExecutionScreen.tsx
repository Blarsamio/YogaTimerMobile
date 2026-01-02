import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView, Alert, Animated, TextInput } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { useAudioPlayer, AudioModule } from 'expo-audio';
import { SessionExecutionState } from '../types';
import { ApiService } from '../config/api';
import { RootStackParamList } from '../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';

type SessionExecutionRouteProp = RouteProp<RootStackParamList, 'SessionExecution'>;

const { width: screenWidth } = Dimensions.get('window');

export const SessionExecutionScreen: React.FC = () => {
  const route = useRoute<SessionExecutionRouteProp>();
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const { session, transitionSound, backgroundMusic } = route.params;

  const [executionState, setExecutionState] = useState<SessionExecutionState>({
    session,
    currentTimerIndex: 0,
    isPlaying: false,
    isPaused: false,
    currentTimerElapsed: 0,
    totalElapsed: 0,
    transitionSound,
    backgroundMusic,
  });

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const [selectedSoundIndex, setSelectedSoundIndex] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const completionAnim = useRef(new Animated.Value(0)).current;
  const completionOpacity = useRef(new Animated.Value(0)).current;

  const availableSounds = [
    { id: 'bowl', name: 'Singing Bowl' },
    { id: 'chime', name: 'Wind Chime' },
    { id: 'bells', name: 'Healing Bells' },
    { id: 'gong', name: 'Tibetan Gong' },
  ];

  const transitionPlayer = useAudioPlayer(
    require('../../assets/audio/bowl.wav')
  );

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';
  const accentColor = '#A99985';

  const currentTimer = executionState.session.timers[executionState.currentTimerIndex];
  const isLastTimer = executionState.currentTimerIndex === executionState.session.timers.length - 1;

  const circularProgress = currentTimer ? (1 - (timeRemaining / currentTimer.duration)) : 0;

  const toggleSidePanel = () => {
    const toValue = showSidePanel ? 0 : 1;
    setShowSidePanel(!showSidePanel);

    Animated.timing(slideAnim, {
      toValue,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSidePanel = () => {
    if (showSidePanel) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowSidePanel(false));
    }
  };

  const handleSessionComplete = useCallback(() => {
    setExecutionState(prev => ({ ...prev, isPlaying: false }));
    setShowCompletion(true);

    Animated.parallel([
      Animated.timing(completionAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(completionOpacity, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      const sessionId = executionState.session.id;
      const sessionName = executionState.session.name;
      const isCustomSession = !sessionId ||
                             sessionId.toString().startsWith('custom_') ||
                             sessionName === 'Custom Practice' ||
                             (typeof sessionId === 'number' && sessionId > 1000000000000);

      if (isCustomSession) {
        const totalMinutes = executionState.session.timers.reduce((sum, timer) => sum + Math.ceil(timer.duration / 60), 0);
        const timerCount = executionState.session.timers.length;
        const defaultName = `My ${totalMinutes}-Minute Session (${timerCount} poses)`;
        setSessionName(defaultName);
        setShowSaveOptions(true);
      } else {
        navigation.navigate('Home');
      }
    }, 3000);
  }, [completionAnim, completionOpacity, navigation, executionState.session.id, executionState.session.timers, executionState.session.name]);

  const handleTimerComplete = useCallback(async () => {
    try {
      if (transitionPlayer) {
        try {
          if (transitionPlayer.playing) {
            transitionPlayer.pause();
          }
          transitionPlayer.seekTo(0);
          transitionPlayer.play();
        } catch (error) {
          console.log('Error controlling audio:', error);
        }
      }
    } catch (error) {
      console.log('Error playing sound:', error);
    }

    if (isLastTimer) {
      handleSessionComplete();
    } else {
      setExecutionState(prev => ({
        ...prev,
        currentTimerIndex: prev.currentTimerIndex + 1,
        currentTimerElapsed: 0,
      }));

      const nextTimer = executionState.session.timers[executionState.currentTimerIndex + 1];
      setTimeRemaining(nextTimer?.duration || 0);
    }
  }, [isLastTimer, transitionPlayer, executionState.session.timers, executionState.currentTimerIndex, handleSessionComplete]);

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await AudioModule.setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
        });
      } catch (error) {
        console.log('Error configuring audio:', error);
      }
    };

    setupAudio();
    setTimeRemaining(currentTimer?.duration || 0);
    setExecutionState(prev => ({ ...prev, isPlaying: true }));
  }, [currentTimer?.duration]);

  useEffect(() => {
    if (executionState.isPlaying && !executionState.isPaused && currentTimer) {
      intervalRef.current = setInterval(() => {
        setExecutionState(prev => {
          const newElapsed = prev.currentTimerElapsed + 1;
          const newTimeRemaining = currentTimer.duration - newElapsed;

          setTimeRemaining(newTimeRemaining);

          if (newElapsed >= currentTimer.duration) {
            handleTimerComplete();
            return prev;
          }

          return {
            ...prev,
            currentTimerElapsed: newElapsed,
            totalElapsed: prev.totalElapsed + 1,
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [executionState.isPlaying, executionState.isPaused, currentTimer, handleTimerComplete]);

  const handleSkipTimer = () => {
    Alert.alert(
      'Skip Timer?',
      'Are you sure you want to skip this pose?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            setExecutionState(prev => ({
              ...prev,
              currentTimerElapsed: 0,
              totalElapsed: prev.totalElapsed + (currentTimer?.duration || 0) - prev.currentTimerElapsed,
            }));
            handleTimerComplete();
          },
        },
      ]
    );
  };

  const handleSoundChange = (direction: 'prev' | 'next') => {
    setSelectedSoundIndex(prev => {
      if (direction === 'next') {
        return (prev + 1) % availableSounds.length;
      } else {
        return (prev - 1 + availableSounds.length) % availableSounds.length;
      }
    });
  };

  const handlePlayPause = () => {
    setExecutionState(prev => {
      const newIsPlaying = !prev.isPlaying;

      return {
        ...prev,
        isPlaying: newIsPlaying,
        isPaused: !newIsPlaying,
      };
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
        timers: executionState.session.timers.map(timer => ({
          title: timer.title,
          duration: timer.duration,
        })),
      });

      if (sessionResponse.error || !sessionResponse.data) {
        throw new Error(sessionResponse.error || 'Failed to create session');
      }

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

  const handleDontSave = () => {
    navigation.navigate('Home');
  };

  const handleExitSession = () => {
    Alert.alert(
      'Exit Session?',
      'Are you sure you want to exit your yoga practice? Your progress will be lost.',
      [
        { text: 'Continue Practice', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            navigation.navigate('Home');
          },
        },
      ]
    );
  };



  const CircularProgress = ({ progress }: { progress: number }) => {
    const size = 280;
    const strokeWidth = 8;
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - progress);

    return (
      <View
        style={{
          width: size,
          height: size,
        }}
      >
        <Svg width={size} height={size}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={isDark ? '#3D3D3D' : '#E5E5E5'}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={accentColor}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>

        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text style={{
            fontSize: 48,
            fontFamily: 'zen',
            color: accentColor,
            marginBottom: 8,
          }}>
            {Math.ceil(timeRemaining / 60)}
          </Text>
          <Text style={{
            fontSize: 24,
            fontFamily: 'zen',
            color: accentColor,
            opacity: 0.7,
          }}>
            minutes
          </Text>

          <View style={{
            position: 'absolute',
            bottom: 20,
            opacity: 0.4
          }}>
            <Ionicons
              name={executionState.isPlaying ? "pause" : "play"}
              size={16}
              color={accentColor}
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <View className="flex-1">
        <View className="flex-row items-center justify-between pt-16 pb-8 px-8">
          <TouchableOpacity onPress={handleExitSession}>
            <Ionicons name="home" size={32} color={accentColor} />
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleSidePanel}>
            <Ionicons name="settings" size={32} color={accentColor} />
          </TouchableOpacity>
        </View>

        <View className="flex-1 items-center justify-center">
          <TouchableOpacity
            onPress={handlePlayPause}
            activeOpacity={0.8}
            style={{ borderRadius: 200 }}
          >
            <CircularProgress progress={circularProgress} />
          </TouchableOpacity>
        </View>

        <View className="items-center pb-16 px-8">
          <TouchableOpacity
            onPress={handleSkipTimer}
            className="flex-row items-center px-6 py-3"
            activeOpacity={0.7}
          >
            <Text
              className="text-lg font-zen mr-3"
              style={{ color: textColor, opacity: 0.6 }}
            >
              skip me
            </Text>
            <Ionicons name="arrow-forward" size={20} color={textColor} style={{ opacity: 0.6 }} />
          </TouchableOpacity>
        </View>
      </View>

      {showSidePanel && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
          }}
          onPress={closeSidePanel}
          activeOpacity={1}
        />
      )}

      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: screenWidth * 0.65,
          backgroundColor: cardBgColor,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [screenWidth * 0.65, 0],
              }),
            },
          ],
          shadowColor: '#000',
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <ScrollView className="flex-1 pt-16 px-6">
          <View className="mb-8">
            <Text className="text-lg font-zen mb-4" style={{ color: textColor }}>
              timers left
            </Text>

            {executionState.session.timers.map((timer, index) => (
              <View
                key={timer.id}
                className={`px-4 py-3 rounded-full mb-2 ${
                  index === executionState.currentTimerIndex
                    ? 'bg-accent'
                    : index < executionState.currentTimerIndex
                      ? 'bg-gray-300'
                      : 'bg-transparent border border-gray-300'
                }`}
                style={{
                  backgroundColor:
                    index === executionState.currentTimerIndex
                      ? accentColor
                      : index < executionState.currentTimerIndex
                        ? (isDark ? '#6B7280' : '#D1D5DB')
                        : 'transparent',
                  borderColor: index < executionState.currentTimerIndex ? 'transparent' : (isDark ? '#6B7280' : '#D1D5DB'),
                  borderWidth: index >= executionState.currentTimerIndex ? 1 : 0,
                }}
              >
                <Text
                  className="text-center font-ubuntu-medium"
                  style={{
                    color:
                      index === executionState.currentTimerIndex
                        ? '#FFFFFF'
                        : index < executionState.currentTimerIndex
                          ? (isDark ? '#9CA3AF' : '#6B7280')
                          : textColor,
                  }}
                >
                  {Math.ceil(timer.duration / 60)} minutes
                </Text>
              </View>
            ))}
          </View>

          <View className="mb-8">
            <Text className="text-lg font-zen mb-4" style={{ color: textColor }}>
              sound
            </Text>

            <View className="flex-row items-center justify-between px-4">
              <TouchableOpacity
                onPress={() => handleSoundChange('prev')}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={20} color={textColor} />
              </TouchableOpacity>

              <Text className="text-center font-ubuntu-medium flex-1" style={{ color: textColor }}>
                {availableSounds[selectedSoundIndex].name}
              </Text>

              <TouchableOpacity
                onPress={() => handleSoundChange('next')}
                className="p-2"
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-forward" size={20} color={textColor} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View className="p-6 pb-16">
          <TouchableOpacity
            onPress={closeSidePanel}
            className="items-center"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {showCompletion && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: backgroundColor,
          }}
        >
          <Animated.View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: accentColor,
              transform: [
                {
                  scale: completionAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 20],
                  }),
                },
              ],
              opacity: completionAnim.interpolate({
                inputRange: [0, 0.7, 1],
                outputRange: [0.8, 0.3, 0.1],
              }),
            }}
          />

          <Animated.View
            style={{
              position: 'absolute',
              alignItems: 'center',
              opacity: completionOpacity,
            }}
          >
            <Text
              style={{
                fontSize: 32,
                fontFamily: 'zen',
                color: accentColor,
                marginBottom: 16,
                textAlign: 'center',
              }}
            >
              🙏
            </Text>
            <Text
              style={{
                fontSize: 24,
                fontFamily: 'zen',
                color: textColor,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Session Complete
            </Text>
            <Text
              style={{
                fontSize: 16,
                fontFamily: 'zen',
                color: textColor,
                opacity: 0.8,
                textAlign: 'center',
                paddingHorizontal: 48,
                lineHeight: 24,
                marginBottom: showSaveOptions ? 32 : 0,
              }}
            >
              Take a moment to rest in stillness and gratitude for your practice
            </Text>

            {showSaveOptions && (
              <View style={{ width: '100%', alignItems: 'center', paddingHorizontal: 32 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontFamily: 'zen',
                    color: textColor,
                    marginBottom: 16,
                    textAlign: 'center',
                  }}
                >
                  Save this session?
                </Text>

                <TextInput
                  style={{
                    width: '100%',
                    maxWidth: 280,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderWidth: 1,
                    borderColor: accentColor,
                    borderRadius: 12,
                    backgroundColor: cardBgColor,
                    color: textColor,
                    fontSize: 16,
                    fontFamily: 'ubuntu',
                    textAlign: 'center',
                    marginBottom: 24,
                  }}
                  placeholder="Enter session name..."
                  placeholderTextColor={textColor + '80'}
                  value={sessionName}
                  onChangeText={setSessionName}
                  maxLength={50}
                  returnKeyType="done"
                  onSubmitEditing={handleSaveSession}
                />

                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <TouchableOpacity
                    onPress={handleDontSave}
                    style={{
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 25,
                      borderWidth: 1,
                      borderColor: textColor + '40',
                      minWidth: 120,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'ubuntu',
                        color: textColor,
                        textAlign: 'center',
                        opacity: 0.8,
                      }}
                    >
                                             Don&apos;t Save
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveSession}
                    disabled={isSaving}
                    style={{
                      paddingHorizontal: 24,
                      paddingVertical: 12,
                      borderRadius: 25,
                      backgroundColor: accentColor,
                      minWidth: 120,
                      opacity: isSaving ? 0.7 : 1,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontFamily: 'ubuntu',
                        color: backgroundColor,
                        textAlign: 'center',
                        fontWeight: '600',
                      }}
                    >
                      {isSaving ? 'Saving...' : 'Save Session'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </Animated.View>
        </View>
      )}
    </View>
  );
};
