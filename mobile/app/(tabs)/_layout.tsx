import { Tabs } from 'expo-router';
import React from 'react';
import { BlurView } from 'expo-blur';
import { Home, Compass, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: '#a1a1aa',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          backgroundColor: 'transparent',
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarBackground: () => (
          <BlurView intensity={80} tint="dark" style={{ flex: 1 }} />
        ),
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
    </Tabs>
  );
}
