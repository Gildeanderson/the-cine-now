import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Pressable, Dimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Info, BookmarkCheck, BookmarkPlus } from 'lucide-react-native';
import { getImageUrl } from '@/services/tmdb-service';
import { ThemedText } from './themed-text';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface HeroProps {
  movie: any;
  onPlay: (movie: any) => void;
  onToggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

export function Hero({ movie, onPlay, onToggleSave, isSaved }: HeroProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500, // Mais ágil
      useNativeDriver: true,
    }).start();
  }, [movie]);

  if (!movie) return null;

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: getImageUrl(movie.backdrop_path, 'original') }}
        style={styles.image}
        contentFit="cover"
        transition={500} // Transição dupla em sintonia com o texto
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', `rgba(0,0,0,0.5)`, theme.background] as any}
        style={styles.gradient}
      />
      
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <ThemedText style={styles.trendingBadge}>Bombando Hoje</ThemedText>
        <ThemedText type="title" style={styles.title} numberOfLines={2}>
          {movie.title || movie.name}
        </ThemedText>
        
        <View style={styles.buttonRow}>
          <Pressable 
            style={styles.playButton}
            onPress={() => onPlay(movie)}
          >
            <Play size={12} color="#020205" fill="#020205" />
            <ThemedText style={styles.playButtonText}>Assistir Trailer</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
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
    bottom: 140, // 20px acima da lista sobreposta (-120px)
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 2,
  },
  trendingBadge: {
    color: '#A3A6FF', // Mais claro para dar contraste máximo de acessibilidade 
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    gap: 1, // Extremamente colado
    alignSelf: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  playButtonText: {
    color: '#020205',
    fontWeight: '900',
    fontSize: 10, 
    textTransform: 'uppercase',
    textAlign: 'center',
    includeFontPadding: false, // Remove o padding invisível padrão do Android
    lineHeight: 12, // Força a centralização vertical exata
  },
  // Removidos os estilos actionButtons e circleButton que não são mais necessários
});
