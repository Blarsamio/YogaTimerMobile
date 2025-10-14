import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';

// Temporary placeholder screens until we migrate the actual components
const HomeScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Home Screen</Text>
  </View>
);

const SessionScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Session Screen</Text>
  </View>
);

const TimerScreen = () => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>Timer Screen</Text>
  </View>
);

export type RootStackParamList = {
  Home: undefined;
  Session: { id: number };
  Timer: { sessionId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Yoga Timer' }}
        />
        <Stack.Screen
          name="Session"
          component={SessionScreen}
          options={{ title: 'Session Details' }}
        />
        <Stack.Screen
          name="Timer"
          component={TimerScreen}
          options={{ title: 'Timer' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
