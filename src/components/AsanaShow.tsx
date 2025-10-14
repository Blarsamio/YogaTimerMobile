import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Asana } from '../types';
import { ApiService } from '../config/api';
import { H1, BackButton } from './ui';
import { Loading } from './common/Loading';
import { useTheme } from '../contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Home: undefined;
  Sessions: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const AsanaShow: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();

  const [asana, setAsana] = useState<Asana | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const asanaId = (route.params as { asanaId: number }).asanaId;

  const backgroundColor = isDark ? '#1C1C1C' : '#F5F5F5';
  const textColor = isDark ? '#F5F5F5' : '#1C1C1C';
  const cardBgColor = isDark ? '#3D3D3D' : '#F5F1ED';
  const accentColor = '#A99985';

    useEffect(() => {
    const fetchAsana = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ApiService.getAsana(asanaId);

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data && response.data.data) {
          setAsana(response.data.data);
        } else if (response.data) {
          setAsana(response.data);
        } else {
          setError('Asana details not available');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load asana details');
        // Error fetching asana
      } finally {
        setLoading(false);
      }
    };

    fetchAsana();
  }, [asanaId]);


  const handleBack = () => {
    navigation.goBack();
  };

  const renderSection = (title: string, content?: string, icon?: string) => {
    if (!content || content.trim() === '') return null;

    return (
      <View
        className="p-6 rounded-3xl mb-4 shadow-sm"
        style={{ backgroundColor: cardBgColor }}
      >
        <View className="flex-row items-center mb-4">
          {icon && (
            <View className="w-8 h-8 rounded-full bg-accent/10 items-center justify-center mr-3">
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={16} color={accentColor} />
            </View>
          )}
          <Text className="text-lg font-zen" style={{ color: textColor }}>
            {title}
          </Text>
        </View>
        <Text
          className="text-base leading-7 opacity-80"
          style={{ color: textColor }}
        >
          {content}
        </Text>
      </View>
    );
  };

  const renderTimeSection = () => {
    if (!asana?.recommended_time) return null;

    return (
      <View
        className="p-6 rounded-3xl mb-4 shadow-sm border-2"
        style={{
          backgroundColor: cardBgColor,
          borderColor: accentColor + '30'
        }}
      >
        <View className="flex-row items-center justify-center">
          <Ionicons name="timer-outline" size={24} color={accentColor} />
          <Text className="text-xl font-zen ml-3" style={{ color: accentColor }}>
            {asana.recommended_time}
          </Text>
        </View>
        <Text
          className="text-center text-sm mt-2 opacity-70 font-zen"
          style={{ color: textColor }}
        >
          recommended hold time
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <View className="flex-row items-center mb-8 px-6 pt-16">
          <BackButton onPress={handleBack} />
        </View>
        <Loading />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <View className="flex-row items-center mb-8 px-6 pt-16">
          <BackButton onPress={handleBack} />
          <View className="flex-1 ml-4">
            <H1 className="text-h1" style={{ color: textColor }}>
              asana details
            </H1>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="leaf-outline" size={48} color={accentColor} style={{ opacity: 0.5 }} />
          <Text className="text-lg font-zen text-center mb-4 mt-4" style={{ color: textColor }}>
            Unable to load asana
          </Text>
          <Text className="text-sm text-center opacity-70 mb-4" style={{ color: textColor }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={fetchAsana}
            className="bg-accent px-6 py-3 rounded-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-zen text-center">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!asana) {
    return (
      <View className="flex-1" style={{ backgroundColor }}>
        <View className="flex-row items-center mb-8 px-6 pt-16">
          <BackButton onPress={handleBack} />
        </View>
        <View className="flex-1 justify-center items-center">
          <Text className="text-lg font-zen" style={{ color: textColor }}>
            Asana not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      {/* Header with back button */}
      <View className="flex-row items-center mb-8 px-6 pt-16">
        <BackButton onPress={handleBack} />
        <View className="flex-1 ml-4">
          <H1 className="text-h1" style={{ color: textColor }}>
            asana guide
          </H1>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Asana Title Card */}
        <View
          className="p-8 rounded-3xl mb-6 shadow-sm items-center"
          style={{ backgroundColor: cardBgColor }}
        >
          <View className="w-16 h-16 rounded-full bg-accent/10 items-center justify-center mb-4">
            <Ionicons name="leaf" size={32} color={accentColor} />
          </View>
          <H1 className="text-3xl font-zen text-center mb-2" style={{ color: textColor }}>
            {asana.title}
          </H1>
          {asana.similar_yang_asanas && (
            <Text
              className="text-sm text-center opacity-60 italic"
              style={{ color: textColor }}
            >
              Yang variation: {asana.similar_yang_asanas}
            </Text>
          )}
        </View>

        {/* Recommended Time - Special Highlight */}
        {renderTimeSection()}

        {/* Benefits Section */}
        {renderSection('Benefits', asana.benefits, 'heart-outline')}

        {/* Getting Into Pose */}
        {renderSection('Getting Into The Pose', asana.into_pose, 'arrow-down-circle-outline')}

        {/* Alternatives & Options */}
        {renderSection('Alternatives & Options', asana.alternatives_and_options, 'options-outline')}

        {/* Getting Out of Pose */}
        {renderSection('Getting Out Of The Pose', asana.out_of_pose, 'arrow-up-circle-outline')}

        {/* Contraindications */}
        {renderSection('Contraindications', asana.contraindications, 'warning-outline')}

        {/* Counterposes */}
        {renderSection('Counterposes', asana.counterposes, 'refresh-outline')}

        {/* Meridians & Organs */}
        {renderSection('Meridians & Organs', asana.meridians_and_organs, 'body-outline')}

        {/* Joints Affected */}
        {renderSection('Joints Affected', asana.joints, 'fitness-outline')}

        {/* Additional Notes */}
        {renderSection('Additional Notes', asana.other_notes, 'document-text-outline')}
      </ScrollView>
    </View>
  );
};
