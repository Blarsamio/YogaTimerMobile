import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "./types";
import { HomeScreen } from "../screens/HomeScreen";
import { SessionsScreen } from "../screens/SessionsScreen";
import { SessionShow } from "../components/SessionShow";
import { SessionCountdown } from "../components/SessionCountdown";
import { AsanasScreen } from "../screens/AsanasScreen";
import { AsanaShow } from "../components/AsanaShow";
import { QuickTimerScreen } from "../screens/QuickTimerScreen";
import { SimpleTimerScreen } from "../screens/SimpleTimerScreen";
import { CreateTimerScreen } from "../screens/CreateTimerScreen";
import { BackgroundMusicScreen } from "../screens/BackgroundMusicScreen";
import { SessionExecutionScreen } from "../screens/SessionExecutionScreen";
import { ContactScreen } from "../screens/ContactScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: "#A99985",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Sessions"
        component={SessionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateTimer"
        component={CreateTimerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BackgroundMusic"
        component={BackgroundMusicScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SessionDetail"
        component={SessionShow}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SessionCountdown"
        component={SessionCountdown}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SessionExecution"
        component={SessionExecutionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Asanas"
        component={AsanasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AsanaDetail"
        component={AsanaShow}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuickTimer"
        component={QuickTimerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SimpleTimer"
        component={SimpleTimerScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
