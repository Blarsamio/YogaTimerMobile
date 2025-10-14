import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { FormModal } from './FormModal';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../config/api';
import { Asana } from '../types';

interface TimerFormProps {
  onAddTimer: (duration: number, title: string) => void;
}

export const TimerForm: React.FC<TimerFormProps> = ({ onAddTimer }) => {
  const [duration, setDuration] = useState('');
  const [title, setTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [asanas, setAsanas] = useState<Asana[]>([]);
  const [filteredAsanas, setFilteredAsanas] = useState<Asana[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/asanas`)
      .then((response) => response.json())
      .then((data) => setAsanas(data))
      .catch((error) => {
        // Error loading asanas
      });
  }, []);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    const filtered = asanas.filter((asana) =>
      asana.title.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredAsanas(filtered);
  };

  const handleSelectAsana = (asanaName: string) => {
    setTitle(asanaName);
    setFilteredAsanas([]);
  };

  const handleSubmit = () => {
    const durationInSeconds = parseInt(duration) * 60;
    onAddTimer(durationInSeconds, title);
    setDuration('');
    setTitle('');
    setIsModalOpen(false);
  };

  const renderAsanaItem = ({ item }: { item: Asana }) => (
    <TouchableOpacity
      onPress={() => handleSelectAsana(item.title)}
      className="p-2 border-b border-gray-200"
    >
      <Text className="text-black">{item.title}</Text>
      <Text className="text-xs text-gray-600">{item.recommended_time}</Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity
        onPress={() => setIsModalOpen(true)}
        className="bg-gold rounded p-2 w-full items-center"
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>

      <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <View className="py-4">
          <TextInput
            value={title}
            onChangeText={handleTitleChange}
            placeholder="Asana"
            className="border p-2 mb-2 w-full bg-white text-black rounded"
          />

          {filteredAsanas.length > 0 && (
            <View className="border rounded bg-white max-h-36">
              <FlatList
                data={filteredAsanas}
                renderItem={renderAsanaItem}
                keyExtractor={(item) => item.id.toString()}
                className="max-h-36"
              />
            </View>
          )}

          <TextInput
            value={duration}
            onChangeText={setDuration}
            placeholder="Set duration in minutes"
            keyboardType="numeric"
            className="border p-2 mb-2 w-full bg-white text-black rounded mt-2"
          />

          <TouchableOpacity
            onPress={handleSubmit}
            className="bg-gold p-2 mt-4 rounded"
          >
            <Text className="text-white text-center">Add Timer</Text>
          </TouchableOpacity>
        </View>
      </FormModal>
    </View>
  );
};
