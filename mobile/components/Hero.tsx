import React from 'react';
import { StyleSheet, View, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Info, BookmarkCheck, BookmarkPlus } from 'lucide-react-native';
import { getImageUrl } from '@/services/tmdb-service';
import { ThemedText } from './themed-text';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeroProps {
  movie: any;
  onPlay: (movie: any) => void;
  onToggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export function Hero({ movie, onPlay, onToggleSave, isSaved }: HeroProps) {
  if (!movie) return null;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: getImageUrl(movie.backdrop_path, 'original') }}
        style={styles.image}
        contentFit="cover"
        transition={1000}
      />
      <LinearGradient
        colors={['rgba(2, 2, 5, 0)', 'rgba(2, 2, 5, 0.4)', '#020205']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <ThemedText style={styles.trendingBadge}>Bombando Hoje</ThemedText>
        <ThemedText type="title" style={styles.title} numberOfLines={2}>
          {movie.title || movie.name}
        </ThemedText>
        
        <View style={styles.buttonRow}>
          <Pressable 
            style={styles.playButton}
            onPress={() => onPlay(movie)}
          >
            <Play size={20} color="#020205" fill="#020205" />
            <ThemedText style={styles.playButtonText}>Assistir Trailer</ThemedText>
          </Pressable>

          <View style={styles.actionButtons}>
            <Pressable 
              style={styles.circleButton}
              onPress={() => {
                Haptics.selectionAsync();
                router.push({ pathname: '/detail/[id]', params: { id: movie.id, type: movie.media_type || 'movie' } });
              }}
            >
              <Info size={22} color="#fff" />
            </Pressable>

            <Pressable 
              style={styles.circleButton}
              onPress={() => onToggleSave(movie.id.toString())}
            >
              {isSaved(movie.id) ? (
                <BookmarkCheck size={22} color="#6b46ff" />
              ) : (
                <BookmarkPlus size={22} color="#fff" />
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  content: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  trendingBadge: {
    color: '#6b46ff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    textAlign: 'center',
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  playButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 12,
    width: '80%',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  playButtonText: {
    color: '#020205',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 24,
  },
  circleButton: {
    width: 54,
    height: 54,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 27,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
});
