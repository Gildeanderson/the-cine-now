import { Tabs } from 'expo-router';
import React from 'react';
import { Home, Compass, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

export default function TabLayout() {
  const { colorScheme } = useAppTheme();
  const theme = Colors[colorScheme ?? 'dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: '#a1a1aa',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 1,
          borderTopColor: theme.outline,
          backgroundColor: theme.surface,
          elevation: 10,
          height: 60,
          paddingBottom: 8,
        },
        tabBarInactiveTintColor: theme.icon,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Para Você',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <Compass size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
      {/* Hidden Screens that share the Tab Layout */}
      <Tabs.Screen
        name="detail/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="actor/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
