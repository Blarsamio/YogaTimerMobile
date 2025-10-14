import React from 'react';
import { Text, TextProps } from 'react-native';

interface TypographyProps extends TextProps {
  children: React.ReactNode;
  className?: string;
}

// Header components using Zen Antique Soft
export const H1: React.FC<TypographyProps> = ({ children, className = '', ...props }) => {
  return (
    <Text className={`font-zen text-text-primary ${className}`} {...props}>
      {children}
    </Text>
  );
};

export const H2: React.FC<TypographyProps> = ({ children, className = '', ...props }) => {
  return (
    <Text className={`font-zen text-h2 text-text-primary ${className}`} {...props}>
      {children}
    </Text>
  );
};

// Body text components using Ubuntu
export const BodyText: React.FC<TypographyProps> = ({ children, className = '', ...props }) => {
  return (
    <Text className={`font-ubuntu text-body text-text-primary ${className}`} {...props}>
      {children}
    </Text>
  );
};

export const BodyTextSmall: React.FC<TypographyProps> = ({ children, className = '', ...props }) => {
  return (
    <Text className={`font-ubuntu text-body-sm text-text-secondary ${className}`} {...props}>
      {children}
    </Text>
  );
};

// Utility component for custom styling
export const CustomText: React.FC<TypographyProps> = ({ children, className = '', ...props }) => {
  return (
    <Text className={className} {...props}>
      {children}
    </Text>
  );
};
