import { StyleSheet, View, Text, Pressable, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { ThemedText } from './themed-text';
import { Search, Bell } from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';
import { scheduleTestNotification } from '@/services/notificationService';
import { tmdbService, getImageUrl } from '@/services/tmdb-service';
import * as Haptics from 'expo-haptics';

export function HomeHeader() {
  const { colorScheme } = useAppTheme();
  const theme = Colors[colorScheme ?? 'dark'];

  const handleTestNotification = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      // Busca o filme em alta para usar o pôster na notificação
      const trending = await tmdbService.getTrending();
      const movie = trending.results?.[0];
      const imageUrl = movie?.backdrop_path
        ? getImageUrl(movie.backdrop_path, 'w500')
        : undefined;

      await scheduleTestNotification({
        title: movie ? `🎬 ${movie.title || movie.name}` : '🎬 Cine Now',
        body: movie?.overview?.slice(0, 100) + '...' || 'Novidades no Cine Now!',
        imageUrl,
      });
      Alert.alert('🔔 Notificação Enviada!', `"${movie?.title || 'Filme'}" chegará em instantes.`);
    } catch {
      await scheduleTestNotification();
      Alert.alert('🔔 Notificação Enviada!', 'Confira as novidades do Cine Now!');
    }
  };

  return (
    <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <ThemedText style={styles.logoText}>THE CINE <Text style={styles.logoHighlight}>NOW</Text></ThemedText>
        </View>
        <View style={styles.actions}>
          <Search size={22} color={theme.icon} />
          <Pressable onPress={handleTestNotification}>
            <Bell size={22} color={theme.icon} />
          </Pressable>
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
  }
});
