import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BackButtonProps {
  onPress: () => void;
  size?: number;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  size = 56,
  className = '',
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`bg-accent rounded-full items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      activeOpacity={0.8}
    >
      <Ionicons
        name="arrow-back"
        size={size * 0.4}
        color="white"
      />
    </TouchableOpacity>
  );
};
