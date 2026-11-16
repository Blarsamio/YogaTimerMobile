import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { FormModal } from './FormModal';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../hooks/useSettings';

interface IntermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectIntermission: (duration: number) => void;
}

export const INTERMISSION_OPTIONS = [
  { duration: 0, label: 'None', icon: 'close-circle-outline' },
  { duration: 30, label: '30 seconds', icon: 'hourglass-outline' },
  { duration: 45, label: '45 seconds', icon: 'hourglass-outline' },
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
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [settings] = useSettings();

  useEffect(() => {
    if (isOpen) setSelectedDuration(settings.reboundSeconds);
  }, [isOpen, settings.reboundSeconds]);

  const textColor = isDark ? '#EDE4D6' : '#17130F';
  const cardBgColor = isDark ? '#2A231C' : '#F5F1ED';
  const optionBgColor = isDark ? '#221D18' : '#FFFFFF';

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
              rebound between poses
            </Text>
            <Text
              className="text-sm font-ubuntu opacity-70 text-center mt-2"
              style={{ color: textColor }}
            >
              A rest after each pose to come out slowly. Sides of the same pose get a short switch instead.
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
                  selectedDuration === option.duration ? 'border-2 border-clay' : 'border border-accent/20'
                }`}
                style={{
                  backgroundColor: selectedDuration === option.duration ? '#C08A6A' : optionBgColor
                }}
                activeOpacity={0.8}
              >
                <View className="p-5">
                  <View className="flex-row items-center">
                    {/* Icon */}
                    <View className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
                      selectedDuration === option.duration ? 'bg-umber/10' : 'bg-accent/10'
                    }`}>
                      <Ionicons
                        name={option.icon as keyof typeof Ionicons.glyphMap}
                        size={24}
                        color={selectedDuration === option.duration ? '#17130F' : '#A99985'}
                      />
                    </View>

                    {/* Text Content */}
                    <View className="flex-1">
                      <Text
                        className="text-lg font-ubuntu-medium"
                        style={{
                          color: selectedDuration === option.duration ? '#17130F' : textColor
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
          <Text className="text-umber text-lg font-ubuntu-medium">
            Confirm
          </Text>
        </TouchableOpacity>
      </View>
    </FormModal>
  );
};
