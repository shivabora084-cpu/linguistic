import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppTabParamList } from './types';
import { HomeScreen } from '../screens/main/HomeScreen';
import { TranslationScreen } from '../screens/main/TranslationScreen';
import { VoiceTranslationScreen } from '../screens/main/VoiceTranslationScreen';
import { TwoPersonConversationScreen } from '../screens/main/TwoPersonConversationScreen';
import { HistoryScreen } from '../screens/main/HistoryScreen';
import { SettingsScreen } from '../screens/main/SettingsScreen';
import { useSettings } from '../context/SettingsContext';
import { COLORS } from '../constants/theme';

const Tab = createBottomTabNavigator<AppTabParamList>();

export const AppTabs: React.FC = () => {
  const { theme } = useSettings();
  const isDark = theme === 'dark';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
          borderTopColor: isDark ? COLORS.dark.border : COLORS.light.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: isDark ? COLORS.dark.textMuted : COLORS.light.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="TranslateTab"
        component={TranslationScreen}
        options={{
          tabBarLabel: 'Translate',
          tabBarIcon: ({ color, size }) => <Ionicons name="language" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="VoiceTab"
        component={VoiceTranslationScreen}
        options={{
          tabBarLabel: 'Voice',
          tabBarIcon: ({ color, size }) => <Ionicons name="mic-outline" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="TwoPersonTab"
        component={TwoPersonConversationScreen}
        options={{
          tabBarLabel: 'Two-Person',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="HistoryTab"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};
