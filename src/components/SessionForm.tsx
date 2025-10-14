import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { FormModal } from './FormModal';
import { Button, H2 } from './ui';

interface SessionFormProps {
  onCreate: (name: string, description: string) => void;
}

export const SessionForm: React.FC<SessionFormProps> = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = () => {
    onCreate(name, description);
    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  return (
    <View>
      <Button
        title="Create Session"
        onPress={() => setIsModalOpen(true)}
        variant="primary"
        className="mt-6"
      />

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <View>
          <H2 className="mb-4">
            Your new session
          </H2>
          <View className="py-4">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Session Name"
              className="border border-accent/20 p-3 mb-4 w-full bg-background text-text-primary rounded-lg font-ubuntu"
              placeholderTextColor="#6B7280"
            />
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Session Description"
              multiline
              numberOfLines={4}
              className="border border-accent/20 p-3 mb-4 w-full bg-background text-text-primary rounded-lg font-ubuntu"
              placeholderTextColor="#6B7280"
              textAlignVertical="top"
            />
            <Button
              title="Create"
              onPress={handleSubmit}
              variant="primary"
            />
          </View>
        </View>
      </FormModal>
    </View>
  );
};
