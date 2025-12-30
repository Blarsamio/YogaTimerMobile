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

export const SwipeableTimerItem = React.memo(({
  item,
  onDelete,
}: SwipeableTimerItemProps) => {
  const { isDark } = useTheme();
  const translateX = useSharedValue(0);
  const deleteOpacity = useSharedValue(1);
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationX < 0) {
        translateX.value = Math.max(event.translationX, DELETE_THRESHOLD);
      }
    })
    .onEnd(() => {
      const shouldDelete = translateX.value < DELETE_THRESHOLD / 2;

      if (shouldDelete) {
        deleteOpacity.value = withSpring(0);
        translateX.value = withSpring(-SCREEN_WIDTH, {}, () => {
          runOnJS(onDelete)(item.id);
        });
      } else {
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
    <View className="mb-2 relative">
      <Animated.View
        style={[deleteButtonStyle]}
        className="absolute right-0 top-0 bottom-0 justify-center items-center bg-red-500 rounded-r-full overflow-hidden z-[-1]"
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={handleDeletePress}
          className="w-32 h-full justify-center items-center"
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={24} color="white" />
        </TouchableOpacity>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[animatedStyle]}>
          <TouchableOpacity
            className="bg-surface dark:bg-[#1C1C1C] border border-accent/30 rounded-2xl py-4 px-6"
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
});
