import React from "react";
import { View, TouchableOpacity, FlatList, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Session, Timer } from "../types";
import { useTheme } from "../contexts/ThemeContext";
import { ApiService } from "../config/api";

type RootStackParamList = {
  SessionDetail: { sessionId: number | string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SessionListProps {
  sessions: Session[];
  onDelete: (id: number | string) => void;
  onStartSession: (session: Session) => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  sessions,
  onDelete,
  onStartSession,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { isDark } = useTheme();

  const backgroundColor = isDark ? "#1C1C1C" : "#F5F5F5";
  const textColor = isDark ? "#F5F5F5" : "#1C1C1C";
  const cardBgColor = isDark ? "#3D3D3D" : "#F5F1ED";
  const accentColor = "#A99985";

  const calculateSessionDuration = (timers: Timer[]) => {
    const totalSeconds = timers.reduce((sum, timer) => sum + timer.duration, 0);
    return ApiService.formatDuration(totalSeconds);
  };

  const renderSession = ({ item }: { item: Session }) => (
    <View
      className="p-6 rounded-2xl mb-4 shadow-sm"
      style={{ backgroundColor: cardBgColor }}
    >
      {/* Session Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-xl font-zen mb-2" style={{ color: textColor }}>
            {item.name}
          </Text>
          {item.description && (
            <Text
              className="text-sm opacity-70 leading-relaxed"
              style={{ color: textColor }}
            >
              {item.description}
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          className="p-2 rounded-full opacity-50"
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={20} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Session Stats */}
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={16} color={accentColor} />
          <Text
            className="text-sm ml-2 font-ubuntu-medium"
            style={{ color: textColor }}
          >
            {calculateSessionDuration(item.timers)}
          </Text>
        </View>

        <View className="flex-row items-center">
          <Ionicons name="layers-outline" size={16} color={accentColor} />
          <Text
            className="text-sm ml-2 font-ubuntu-medium"
            style={{ color: textColor }}
          >
            {item.timers.length} poses
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="flex-row">
        <TouchableOpacity
          onPress={() => onStartSession(item)}
          className="flex-1 py-3 rounded-xl mr-2 items-center"
          style={{ backgroundColor: accentColor }}
          activeOpacity={0.8}
        >
          <View className="flex-row items-center">
            <Ionicons name="play" size={16} color="#FFFFFF" />
            <Text className="text-white font-ubuntu-medium ml-2">
              Start Practice
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate("SessionDetail", { sessionId: item.id })
          }
          className="flex-1 py-3 rounded-xl ml-2 items-center border border-opacity-30"
          style={{ borderColor: accentColor }}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center">
            <Ionicons name="eye-outline" size={16} color={accentColor} />
            <Text
              className="font-ubuntu-medium ml-2"
              style={{ color: accentColor }}
            >
              View Details
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 px-6 pt-6" style={{ backgroundColor }}>
      {sessions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="leaf-outline" size={48} color={accentColor} />
          <Text
            className="text-lg font-zen text-center mt-4 mb-2"
            style={{ color: textColor }}
          >
            No sessions yet
          </Text>
          <Text
            className="text-sm text-center opacity-70"
            style={{ color: textColor }}
          >
            Your curated yin yoga flows will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderSession}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};
