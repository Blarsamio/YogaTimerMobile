import React from 'react';
import { View, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { H1 } from '../components/ui';
import { useTheme } from '../contexts/ThemeContext';
import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const navigateToCreateTimer = () => {
    navigation.navigate('CreateTimer');
  };

  const navigateToSessions = () => {
    navigation.navigate('Sessions');
  };

  const navigateToContact = () => {
    navigation.navigate('Contact');
  };

  const topBgColor = isDark ? '#1A1A1A' : '#F5F1ED';
  const bottomBgColor = isDark ? '#2D2D2D' : '#FFFFFF';
  const textColor = isDark ? '#E8E3D8' : '#1C1C1C';
  const moonColor = isDark ? '#E8E3D8' : '#1C1C1C';

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Pressable
          className="flex-1"
          style={{ backgroundColor: topBgColor }}
          onPress={navigateToSessions}
        >
          <View className="flex-1 justify-center items-center">
            <H1 className="text-display-lg text-center leading-tight mt-12" style={{ color: textColor }}>
              choose{'\n'}a session
            </H1>
          </View>
        </Pressable>

        <Pressable
          className="flex-1"
          style={{ backgroundColor: bottomBgColor }}
          onPress={navigateToCreateTimer}
        >
          <View className="flex-1 justify-center items-center">
            <H1 className="text-display-lg text-center leading-tight mb-12" style={{ color: textColor }}>
              create{'\n'}your own
            </H1>
          </View>
        </Pressable>
      </View>

      <View
        className="absolute w-full flex-row justify-between items-center px-6 z-50"
        style={{ top: insets.top + 16 }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={navigateToContact}
          className="p-3 rounded-full"
          style={({ pressed }) => [
            { backgroundColor: 'rgba(169, 153, 133, 0.1)', opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Ionicons
            name="help-circle"
            size={24}
            color={moonColor}
          />
        </Pressable>

        <Pressable
          onPress={toggleTheme}
          className="p-3 rounded-full"
          style={({ pressed }) => [
            { backgroundColor: 'rgba(169, 153, 133, 0.1)', opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Ionicons
            name={isDark ? "sunny" : "moon"}
            size={24}
            color={moonColor}
          />
        </Pressable>
      </View>
    </View>
  );
};
