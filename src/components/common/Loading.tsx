import React from 'react';
import { View, ActivityIndicator } from 'react-native';

interface LoadingProps {
  color?: string;
}

export const Loading: React.FC<LoadingProps> = ({ color = '#A99985' }) => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};
