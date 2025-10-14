import React from 'react';
import { TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
}) => {
  const getButtonStyles = () => {
    let baseStyles = 'rounded-button flex-row items-center justify-center';

    // Size styles
    switch (size) {
      case 'small':
        baseStyles += ' px-4 py-2';
        break;
      case 'medium':
        baseStyles += ' px-button-x py-button-y';
        break;
      case 'large':
        baseStyles += ' px-8 py-4';
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyles += ' bg-accent';
        break;
      case 'secondary':
        baseStyles += ' bg-surface';
        break;
      case 'outline':
        baseStyles += ' bg-transparent border border-accent';
        break;
    }

    if (disabled) {
      baseStyles += ' opacity-50';
    }

    return baseStyles;
  };

  const getTextStyles = () => {
    let textStyles = 'font-ubuntu text-body';

    switch (variant) {
      case 'primary':
        textStyles += ' text-white';
        break;
      case 'secondary':
        textStyles += ' text-text-primary';
        break;
      case 'outline':
        textStyles += ' text-accent';
        break;
    }

    return textStyles;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${getButtonStyles()} ${className}`}
      activeOpacity={0.8}
    >
      <Text className={getTextStyles()}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};
