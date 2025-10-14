import React from 'react';
import { View, TouchableOpacity, Text, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DELETE_THRESHOLD = -80;
const DELETE_WIDTH = 128;

interface Timer {
  id: string;
  duration: number;
  label: string;
}

interface SwipeableTimerItemProps {
  item: Timer;
  onDelete: (id: string) => void;
}

export const SwipeableTimerItem: React.FC<SwipeableTimerItemProps> = ({
  item,
  onDelete,
}) => {
  const { isDark } = useTheme();
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(1);
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Only allow left swipe (negative values)
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, DELETE_THRESHOLD);
      }
    })
    .onEnd(() => {
      const shouldDelete = translateX.value < DELETE_THRESHOLD / 2;

      if (shouldDelete) {
        // Fade out delete button and animate item off screen
        deleteOpacity.value = withSpring(0);
        translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
          runOnJS(onDelete)(item.id);
        });
      } else {
        // Snap back to original position
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const swipeOpacity = interpolate(
      translateX.value,
      [0, DELETE_THRESHOLD],
      [0, 1],
      'clamp'
    );

    return {
      opacity: swipeOpacity * deleteOpacity.value,
    };
  });

  const handleDeletePress = () => {
    deleteOpacity.value = withSpring(0);
    translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
      runOnJS(onDelete)(item.id);
    });
  };

  return (
    <View className="mb-3 relative">
      {/* Delete button background */}
      <Animated.View
        style={[deleteButtonStyle]}
        className="absolute right-0 top-0 bottom-0 justify-center items-center bg-red-300 rounded-r-full"
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={handleDeletePress}
          className="w-32 h-full justify-center items-center"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="white" />
        </TouchableOpacity>
      </Animated.View>

      {/* Timer item */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[animatedStyle]}>
          <TouchableOpacity
            className="bg-surface border border-accent/30 rounded-full py-4 px-6"
            activeOpacity={0.7}
          >
            <Text
              className="text-center text-body"
              style={{ color: textColor }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
