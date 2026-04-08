import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Plus, Star, ChevronLeft, Clock, Calendar, Bookmark, Info, BookmarkCheck, BookmarkPlus } from 'lucide-react-native';
import { tmdbService, getImageUrl } from '@/services/tmdb-service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MovieDetailScreen() {
  const { toggleSave, isSaved } = useAuth();
  const { id, type = 'movie' } = useLocalSearchParams();
  const [data, setData] = useState<any>(null);
  const [videoKey, setVideoKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        const details = type === 'tv' 
          ? await tmdbService.getTVDetails(id as string)
          : await tmdbService.getMovieDetails(id as string);
        setData(details);

        // Extract trailer
        const trailer = details.videos?.results.find(
          (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
        );
        if (trailer) setVideoKey(trailer.key);
      } catch (err) {
        console.error('Failed to load details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id, type]);

  const handlePlayTrailer = async () => {
    if (videoKey) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${videoKey}`);
    }
  };

  const handleToggleSave = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleSave(id);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#6b46ff" />
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView style={styles.container} bounces={false}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: getImageUrl(data.backdrop_path || data.poster_path, 'original') }}
          style={styles.backdrop}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(2, 2, 5, 0.4)', 'transparent', '#020205']}
          style={styles.gradient}
        />
        <Pressable 
          style={styles.backButton}
          onPress={() => {
            Haptics.selectionAsync();
            router.back();
          }}
        >
          <View style={styles.backButtonInner}>
            <ChevronLeft size={24} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>{data.title || data.name}</ThemedText>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Star size={14} color="#EAB308" fill="#EAB308" />
            <Text style={styles.metaText}>{data.vote_average?.toFixed(1)}</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.metaItem}>
            <Clock size={14} color="#a1a1aa" />
            <Text style={styles.metaText}>{data.runtime || data.episode_run_time?.[0] || '?'} min</Text>
          </View>
          <View style={styles.dot} />
          <View style={styles.metaItem}>
            <Calendar size={14} color="#a1a1aa" />
            <Text style={styles.metaText}>{(data.release_date || data.first_air_date)?.split('-')[0]}</Text>
          </View>
        </View>

        {/* Genres */}
        <View style={styles.genresContainer}>
          {data.genres?.map((g: any) => (
            <View key={g.id} style={styles.genreTag}>
              <Text style={styles.genreText}>{g.name}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable 
            style={[styles.mainAction, !videoKey && { opacity: 0.5 }]} 
            onPress={handlePlayTrailer}
            disabled={!videoKey}
          >
            <Play size={20} color="#020205" fill="#020205" />
            <Text style={styles.mainActionText}>{videoKey ? 'Assistir Agora' : 'Sem Trailer'}</Text>
          </Pressable>
          <Pressable 
            style={styles.secondAction}
            onPress={() => handleToggleSave(id as string)}
          >
            {isSaved(id as string) ? (
              <BookmarkCheck size={24} color="#6b46ff" />
            ) : (
              <BookmarkPlus size={24} color="#fff" />
            )}
          </Pressable>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sinopse</ThemedText>
          <ThemedText style={styles.overview}>{data.overview}</ThemedText>
        </View>

        {/* Cast (Optional/Simplified) */}
        {data.credits?.cast && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Elenco Principal</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castList}>
              {data.credits.cast.slice(0, 10).map((actor: any) => (
                <View key={actor.id} style={styles.actorCard}>
                  <Image
                    source={{ uri: getImageUrl(actor.profile_path, 'w500') }}
                    style={styles.actorImage}
                  />
                  <Text numberOfLines={1} style={styles.actorName}>{actor.name}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020205',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContainer: {
    width: SCREEN_WIDTH,
    height: 450,
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  backButtonInner: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    paddingHorizontal: 20,
    marginTop: -80,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: '#a1a1aa',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3f3f46',
    marginHorizontal: 12,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  genreTag: {
    backgroundColor: 'rgba(107, 70, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 255, 0.2)',
  },
  genreText: {
    color: '#6b46ff',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  mainAction: {
    flex: 1,
    backgroundColor: '#6b46ff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
  },
  mainActionText: {
    color: '#020205',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondAction: {
    width: 56,
    height: 56,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  overview: {
    color: '#a1a1aa',
    lineHeight: 22,
    fontSize: 15,
  },
  castList: {
    gap: 16,
  },
  actorCard: {
    width: 100,
    alignItems: 'center',
  },
  actorImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
  },
  actorName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
  }
});
