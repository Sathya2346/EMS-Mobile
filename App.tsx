import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from './src/context/SessionContext';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SessionProvider>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SessionProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
