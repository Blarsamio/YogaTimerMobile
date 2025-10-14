import React from 'react';
import { View, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { H1, BodyText } from './ui';

interface Asana {
  id: number;
  title: string;
}

interface AsanaListProps {
  asanas: Asana[];
}

type RootStackParamList = {
  AsanaDetail: { asanaId: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AsanaList: React.FC<AsanaListProps> = ({ asanas }) => {
  const navigation = useNavigation<NavigationProp>();

  const renderAsana = ({ item }: { item: Asana }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AsanaDetail', { asanaId: item.id })}
      className="p-4 border border-accent/30 rounded-lg mb-4 bg-surface/50"
      activeOpacity={0.7}
    >
      <BodyText className="text-xl font-ubuntu-medium text-text-primary">
        {item.title}
      </BodyText>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1">
      <H1 className="text-h1 mb-8">Asanas</H1>
      <FlatList
        data={asanas}
        renderItem={renderAsana}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};
