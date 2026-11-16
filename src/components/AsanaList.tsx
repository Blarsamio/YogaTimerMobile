import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';
import { Asana } from '../types';

const TAUPE = '#A99985';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AsanaList: React.FC<{ asanas: Asana[] }> = ({ asanas }) => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');

  const bg = isDark ? '#17130F' : '#FAF7F2';
  const surface = isDark ? '#221D18' : '#F5F1ED';
  const card = isDark ? '#2A231C' : '#EDE4D6';
  const line = isDark ? '#3A3128' : '#E3D9CB';
  const text = isDark ? '#EDE4D6' : '#17130F';
  const muted = isDark ? '#A89C8C' : '#6B5E4F';

  const needle = query.trim().toLowerCase();
  const shown = needle
    ? asanas.filter((asana) => `${asana.title} ${asana.similar_yang_asanas ?? ''}`.toLowerCase().includes(needle))
    : asanas;

  return (
    <View style={{ flex: 1, backgroundColor: bg, paddingTop: 56, paddingHorizontal: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel="Back"
          style={{ width: 44, height: 44, borderRadius: 9999, backgroundColor: card, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="arrow-back" size={20} color={TAUPE} />
        </TouchableOpacity>
        <Text accessibilityRole="header" style={{ fontFamily: 'ZenAntiqueSoft_400Regular', fontSize: 32, lineHeight: 40, color: text }}>
          Poses
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: line, backgroundColor: surface, marginBottom: 20 }}>
        <Ionicons name="search" size={18} color={muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={`Search ${asanas.length} poses`}
          placeholderTextColor={muted}
          accessibilityLabel="Search poses"
          style={{ flex: 1, color: text, fontSize: 16 }}
        />
      </View>

      <FlatList
        data={shown}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={{ gap: 12, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={{ color: muted, textAlign: 'center', marginTop: 32 }}>No pose matches “{query}”</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('AsanaDetail', { asanaId: item.id })}
            activeOpacity={0.7}
            accessibilityRole="button"
            style={{ flex: 1, maxWidth: '50%', padding: 12, gap: 8, borderRadius: 16, backgroundColor: surface }}
          >
            {/* ponytail: placeholder until the commissioned pose illustrations exist */}
            <View style={{ height: 84, borderRadius: 12, backgroundColor: card, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="leaf-outline" size={32} color={TAUPE} />
            </View>
            <Text style={{ fontFamily: 'ZenAntiqueSoft_400Regular', fontSize: 18, lineHeight: 24, color: text }}>{item.title}</Text>
            {!!item.similar_yang_asanas && (
              <Text numberOfLines={1} style={{ fontSize: 13, lineHeight: 18, color: muted }}>{item.similar_yang_asanas}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
