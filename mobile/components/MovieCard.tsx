import { StyleSheet, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ThemedText } from './themed-text';
import { getImageUrl } from '@/services/tmdb-service';
import { Star } from 'lucide-react-native';

interface MovieCardProps {
  movie: any;
  onPress: (movie: any) => void;
  width?: number;
  showTitle?: boolean;
}

export function MovieCard({ movie, onPress, width = 120, showTitle = true }: MovieCardProps) {
  return (
    <Pressable 
      onPress={() => router.push({ pathname: '/detail/[id]', params: { id: movie.id, type: movie.media_type || 'movie' } })}
      style={({ pressed }) => [
        { opacity: pressed ? 0.8 : 1 },
        { width }
      ]}
    >
      <View style={styles.container}>
        <Image
          source={{ uri: getImageUrl(movie.poster_path) }}
          style={styles.image}
          contentFit="cover"
          transition={500}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.cardGradient}
        />
        <View style={styles.badge}>
          <Star size={10} color="#EAB308" fill="#EAB308" />
          <ThemedText style={styles.rating}>{movie.vote_average?.toFixed(1)}</ThemedText>
        </View>
      </View>
      {showTitle && (
        <ThemedText numberOfLines={1} style={styles.title}>
          {movie.title || movie.name}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 2 / 3,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#12121e',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  }
});
