import React, { useEffect } from 'react';
import { View, Image, Pressable } from 'react-native';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1 } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isNavigating = useSharedValue(false);

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

  useEffect(() => {
    const startBounceAnimation = () => {
      upArrowScale.value = 1;
      downArrowScale.value = 1;

      upArrowScale.value = withDelay(
        500,
        withRepeat(
          withSequence(
            withSpring(1.2, { damping: 8, stiffness: 100 }),
            withSpring(1.0, { damping: 8, stiffness: 100 })
          ),
          3,
          false
        )
      );

      downArrowScale.value = withDelay(
        700,
        withRepeat(
          withSequence(
            withSpring(1.2, { damping: 8, stiffness: 100 }),
            withSpring(1.0, { damping: 8, stiffness: 100 })
          ),
          3,
          false
        )
      );
    };

    startBounceAnimation();

    const intervalId = setInterval(() => {
      startBounceAnimation();
    }, 10000);

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

      if (isNavigating.value) return;

      if (Math.abs(velocityY) > velocityThreshold || Math.abs(translationY) > swipeThreshold) {
        isNavigating.value = true;

        if (velocityY > velocityThreshold || translationY > swipeThreshold) {
          runOnJS(navigateToCreateTimer)();
        } else if (velocityY < -velocityThreshold || translationY < -swipeThreshold) {
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

  const topBgColor = isDark ? '#1A1A1A' : '#F5F1ED';
  const bottomBgColor = isDark ? '#2D2D2D' : '#FFFFFF';
  const textColor = isDark ? '#E8E3D8' : '#1C1C1C';
  const moonColor = isDark ? '#E8E3D8' : '#1C1C1C';
  const arrowColor = isDark ? '#A99985' : '#1C1C1C';

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>


      <GestureDetector gesture={panGesture}>
        <Animated.View className="flex-1" style={[animatedStyle, { flex: 1 }]}>
          <View
            className="flex-1"
            style={{ backgroundColor: topBgColor }}
          >


            <View className="flex-1 justify-center items-center">
              <H1 className="text-display-lg text-center leading-tight mt-12" style={{ color: textColor }}>
                choose{'\n'}a session
              </H1>
            </View>
          </View>

          <View
            className="absolute inset-x-0 z-20 items-center justify-center"
            style={{ top: '50%', transform: [{ translateY: -48 }], pointerEvents: 'none' }}
          >
            <View className="items-center bg-white/20 rounded-full p-6 backdrop-blur-sm">
              <Animated.View className="mb-1" style={upArrowAnimatedStyle}>
                <Image
                  source={require('../../assets/icons/ArrowUp.png')}
                  className="w-16 h-16"
                  style={{ width: 64, height: 64 }}
                  tintColor={arrowColor}
                  resizeMode="contain"
                />
              </Animated.View>

              <Animated.View className="mt-1" style={downArrowAnimatedStyle}>
                <Image
                  source={require('../../assets/icons/ArrowDown.png')}
                  className="w-16 h-16"
                  style={{ width: 64, height: 64 }}
                  tintColor={arrowColor}
                  resizeMode="contain"
                />
              </Animated.View>
            </View>
          </View>

          <View
            className="flex-1"
            style={{ backgroundColor: bottomBgColor }}
          >
            <View className="flex-1 justify-center items-center">
              <H1 className="text-display-lg text-center leading-tight mb-12" style={{ color: textColor }}>
                create{'\n'}your own
              </H1>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
      <View
        className="absolute w-full flex-row justify-between items-center px-6 z-50"
        style={{ top: insets.top + 16 }}
      >
        <Pressable
          onPress={navigateToContact}
          className="p-3 rounded-full"
          style={({ pressed }) => [
            { backgroundColor: 'rgba(169, 153, 133, 0.1)', opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Ionicons
            name="help-circle"
            size={24}
            color={moonColor}
          />
        </Pressable>

        <Pressable
          onPress={toggleTheme}
          className="p-3 rounded-full"
          style={({ pressed }) => [
            { backgroundColor: 'rgba(169, 153, 133, 0.1)', opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={24}
            color={moonColor}
          />
        </Pressable>
      </View>
    </GestureHandlerRootView>
  );
};
