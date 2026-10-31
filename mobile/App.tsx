import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { COLORS } from './src/constants/theme';

const NavigationWrapper: React.FC = () => {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  const customDarkTheme = {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: COLORS.dark.background,
      card: COLORS.dark.card,
      text: COLORS.dark.text,
      border: COLORS.dark.border,
      primary: COLORS.primary,
    },
  };

  const customLightTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: COLORS.light.background,
      card: COLORS.light.card,
      text: COLORS.light.text,
      border: COLORS.light.border,
      primary: COLORS.primary,
    },
  };

  return (
    <NavigationContainer theme={isDark ? customDarkTheme : customLightTheme}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SettingsProvider>
          <NavigationWrapper />
        </SettingsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
