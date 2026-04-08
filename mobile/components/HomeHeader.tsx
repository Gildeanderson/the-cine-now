import { StyleSheet, View, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText } from './themed-text';
import { Search, Bell, User } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function HomeHeader() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];

  return (
    <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <ThemedText style={styles.logoText}>THE CINE <Text style={styles.logoHighlight}>NOW</Text></ThemedText>
        </View>
        <View style={styles.actions}>
          <Search size={22} color={theme.icon} />
          <Bell size={22} color={theme.icon} />
          <View style={styles.avatar}>
            <User size={18} color="#020205" fill="#020205" />
          </View>
        </View>
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    paddingTop: 60,
    paddingBottom: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -1,
  },
  logoHighlight: {
    color: '#6b46ff',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  }
});
