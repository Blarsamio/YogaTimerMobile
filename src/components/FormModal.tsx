import React from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const FormModal: React.FC<FormModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        className="flex-1 items-center justify-center"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="absolute inset-0 bg-black opacity-75" />
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};
