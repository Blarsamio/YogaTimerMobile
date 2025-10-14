import React from 'react';
import { View } from 'react-native';
import { BodyText , Button } from '../ui';

interface ErrorProps {
  message: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ message, onRetry }) => {
  return (
    <View className="flex-1 justify-center items-center p-4">
      <BodyText className="text-red-500 text-lg mb-4 text-center">
        {message}
      </BodyText>
      {onRetry && (
        <Button
          title="Retry"
          onPress={onRetry}
          variant="primary"
        />
      )}
    </View>
  );
};
