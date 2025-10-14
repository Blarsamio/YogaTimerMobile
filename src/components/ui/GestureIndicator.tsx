import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface GestureIndicatorProps {
  color: string;
  direction: 'up' | 'down';
}

export const GestureIndicator: React.FC<GestureIndicatorProps> = ({ color, direction }) => {
  const opacity = useSharedValue(0.3);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Subtle pulsing animation
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Gentle movement hint
    translateY.value = withRepeat(
      withTiming(direction === 'up' ? -3 : 3, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease)
      }),
      -1,
      true
    );
  }, [direction]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons
        name={direction === 'up' ? "chevron-up" : "chevron-down"}
        size={16}
        color={color}
      />
    </Animated.View>
  );
};
