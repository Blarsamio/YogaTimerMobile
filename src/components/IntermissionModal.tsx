import React, { useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { FormModal } from './FormModal';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface IntermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIntermission: (duration: number) => void;
}

const INTERMISSION_OPTIONS = [
  { duration: 0, label: 'None', icon: 'close-circle-outline' },
  { duration: 30, label: '30 seconds', icon: 'hourglass-outline' },
  { duration: 60, label: '1 minute', icon: 'timer-outline' },
  { duration: 90, label: '1 minute 30 seconds', icon: 'watch-outline' },
  { duration: 120, label: '2 minutes', icon: 'alarm-outline' },
];

export const IntermissionModal: React.FC<IntermissionModalProps> = ({
  isOpen,
  onClose,
  onSelectIntermission,
}) => {
  const { isDark } = useTheme();
  const [selectedDuration, setSelectedDuration] = useState<number>(0);

  const textColor = isDark ? '#F5F5F3' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';
  const optionBgColor = isDark ? '#2D2D2D' : '#FFFFFF';

  const handleSelect = (duration: number) => {
    setSelectedDuration(duration);
  };

  const handleConfirm = () => {
    onSelectIntermission(selectedDuration);
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose}>
      <View className="items-center">
        <View
          className="rounded-3xl p-8 mx-4 w-full"
          style={{
            backgroundColor: cardBgColor,
            maxWidth: 380,
            minWidth: 320
          }}
        >
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 rounded-full bg-accent/20 items-center justify-center mb-3">
              <Ionicons name="git-merge-outline" size={28} color="#A99985" />
            </View>
            <Text
              className="text-xl font-zen text-center"
              style={{ color: textColor }}
            >
              time between poses
            </Text>
            <Text
              className="text-sm font-ubuntu opacity-70 text-center mt-2"
              style={{ color: textColor }}
            >
              Add time to switch between poses
            </Text>
          </View>

          {/* Options */}
          <ScrollView
            className="max-h-80 mb-4"
            showsVerticalScrollIndicator={false}
          >
            {INTERMISSION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.duration}
                onPress={() => handleSelect(option.duration)}
                className={`rounded-2xl mb-3 overflow-hidden ${
                  selectedDuration === option.duration ? 'border-2 border-accent' : 'border border-accent/20'
                }`}
                style={{
                  backgroundColor: selectedDuration === option.duration ? '#A99985' : optionBgColor
                }}
                activeOpacity={0.8}
              >
                <View className="p-5">
                  <View className="flex-row items-center">
                    {/* Icon */}
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                      selectedDuration === option.duration ? 'bg-white/20' : 'bg-accent/10'
                    }`}>
                      <Ionicons
                        name={option.icon as keyof typeof Ionicons.glyphMap}
                        size={24}
                        color={selectedDuration === option.duration ? 'white' : '#A99985'}
                      />
                    </View>

                    {/* Text Content */}
                    <View className="flex-1">
                      <Text
                        className="text-lg font-ubuntu-medium"
                        style={{
                          color: selectedDuration === option.duration ? 'white' : textColor
                        }}
                      >
                        {option.label}
                      </Text>
                    </View>

                    {/* Selection Indicator */}
                    {selectedDuration === option.duration && (
                      <View className="w-8 h-8 rounded-full bg-white items-center justify-center ml-2">
                        <Ionicons name="checkmark" size={18} color="#A99985" />
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Done Button */}
        <TouchableOpacity
          onPress={handleConfirm}
          className="bg-accent rounded-full px-12 py-4 shadow-lg -mt-6"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-ubuntu-medium">
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </FormModal>
  );
};
