import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, ZenAntiqueSoft_400Regular } from '@expo-google-fonts/zen-antique-soft';
import { Loading } from './src/components/common/Loading';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import './global.css';

export default function App() {
  const [fontsLoaded] = useFonts({
    ZenAntiqueSoft_400Regular,
  });

  if (!fontsLoaded) {
    return <Loading />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
