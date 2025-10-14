import React from 'react';
import { Modal, View, TouchableOpacity, Text } from 'react-native';

interface WindDownModalProps {
  onClose: () => void;
  children: React.ReactNode;
}

export const WindDownModal: React.FC<WindDownModalProps> = ({ onClose, children }) => {
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 p-6 bg-gray-600/50 justify-center items-center">
        <View className="bg-white p-6 rounded-lg shadow-lg border border-gold">
          {children}
          <TouchableOpacity
            onPress={onClose}
            className="mt-4 bg-gold px-4 py-2 rounded"
          >
            <Text className="text-center">Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
