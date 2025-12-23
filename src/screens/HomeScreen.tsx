import React, { useEffect } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  runOnJS,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { H1 } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark, toggleTheme } = useTheme();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isNavigating = useSharedValue(false);

  // Animation values for arrow bounce effect
  const arrowScale = useSharedValue(1);
  const upArrowScale = useSharedValue(1);
  const downArrowScale = useSharedValue(1);

  const navigateToCreateTimer = () => {
    navigation.navigate('CreateTimer');
  };

  const navigateToSessions = () => {
    navigation.navigate('Sessions');
  };

  const navigateToContact = () => {
    navigation.navigate('Contact');
  };

  // Start bounce animation when component mounts and repeat every 10 seconds
  useEffect(() => {
    const startBounceAnimation = () => {
      // Reset arrows to normal scale first
      upArrowScale.value = 1;
      downArrowScale.value = 1;

      // Delay the start slightly for a nice entrance effect
      upArrowScale.value = withDelay(
        500,
        withRepeat(
          withSequence(
            withSpring(1.2, { damping: 8, stiffness: 100 }),
            withSpring(1.0, { damping: 8, stiffness: 100 })
          ),
          3, // Repeat 3 times
          false
        )
      );

      downArrowScale.value = withDelay(
        700, // Slight delay after up arrow
        withRepeat(
          withSequence(
            withSpring(1.2, { damping: 8, stiffness: 100 }),
            withSpring(1.0, { damping: 8, stiffness: 100 })
          ),
          3, // Repeat 3 times
          false
        )
      );
    };

    // Start the animation immediately
    startBounceAnimation();

    // Set up interval to repeat animation every 10 seconds
    const intervalId = setInterval(() => {
      startBounceAnimation();
    }, 10000); // 10 seconds

    // Cleanup interval on component unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [upArrowScale, downArrowScale]);

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      opacity.value = withSpring(0.8);
      isNavigating.value = false;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY * 0.3;
    })
    .onEnd((event) => {
      const { velocityY, translationY } = event;
      const swipeThreshold = 120;
      const velocityThreshold = 600;

      translateY.value = withSpring(0);
      opacity.value = withSpring(1);

      // Prevent multiple rapid navigation calls
      if (isNavigating.value) return;

      // Simplified: Only navigate if the gesture is clearly in one direction
      if (Math.abs(velocityY) > velocityThreshold || Math.abs(translationY) > swipeThreshold) {
        isNavigating.value = true;

        if (velocityY > velocityThreshold || translationY > swipeThreshold) {
          // Swipe down - go to create timer
          runOnJS(navigateToCreateTimer)();
        } else if (velocityY < -velocityThreshold || translationY < -swipeThreshold) {
          // Swipe up - go to sessions
          runOnJS(navigateToSessions)();
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  // Animated styles for arrows
  const upArrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: upArrowScale.value }],
    };
  });

  const downArrowAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: downArrowScale.value }],
    };
  });

  // Theme colors - improved dark mode styling
  const topBgColor = isDark ? '#1A1A1A' : '#F5F1ED';
  const bottomBgColor = isDark ? '#2D2D2D' : '#FFFFFF';
  const textColor = isDark ? '#E8E3D8' : '#1C1C1C';
  const moonColor = isDark ? '#E8E3D8' : '#1C1C1C';
  const arrowColor = isDark ? '#A99985' : '#1C1C1C';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View className="flex-1" style={[animatedStyle, { flex: 1 }]}>
          {/* Top Section - Choose a timer */}
          <View
            className="flex-1"
            style={{ backgroundColor: topBgColor }}
          >
            <View className="flex-1 justify-center items-center relative">
              {/* Contact button */}
              <TouchableOpacity
                onPress={navigateToContact}
                className="absolute top-14 left-6 p-3 rounded-full z-30"
                style={{ backgroundColor: 'rgba(169, 153, 133, 0.1)' }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="help-circle"
                  size={24}
                  color={moonColor}
                />
              </TouchableOpacity>

              {/* Dark mode toggle */}
              <TouchableOpacity
                onPress={toggleTheme}
                className="absolute top-14 right-6 p-3 rounded-full z-30"
                style={{ backgroundColor: 'rgba(169, 153, 133, 0.1)' }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isDark ? "sunny" : "moon"}
                  size={24}
                  color={moonColor}
                />
              </TouchableOpacity>

              <H1 className="text-display-lg text-center leading-tight" style={{ color: textColor }}>
                choose{'\n'}a session
              </H1>
            </View>
          </View>

          {/* Center arrows section - positioned at the border between sections */}
          <View
            className="absolute inset-x-0 z-20 items-center"
            style={{ top: '40%', transform: [{ translateY: -40 }], pointerEvents: 'none' }}
          >
            <View className="items-center bg-white/20 rounded-full p-4 backdrop-blur-sm">
              {/* Up Arrow with bounce animation */}
              <Animated.View className="mb-2" style={upArrowAnimatedStyle}>
                <Image
                  source={require('../../assets/icons/ArrowUp.png')}
                  className="w-8 h-8"
                  tintColor={arrowColor}
                  resizeMode="contain"
                />
              </Animated.View>

              {/* Down Arrow with bounce animation */}
              <Animated.View className="mt-2" style={downArrowAnimatedStyle}>
                <Image
                  source={require('../../assets/icons/ArrowDown.png')}
                  className="w-8 h-8"
                  tintColor={arrowColor}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </View>

          {/* Bottom Section - Create your own */}
          <View
            className="flex-1"
            style={{ backgroundColor: bottomBgColor }}
          >
            <View className="flex-1 justify-center items-center">
              <H1 className="text-display-lg text-center leading-tight" style={{ color: textColor }}>
                create{'\n'}your own
              </H1>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};
