import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, ChevronLeft, Clock, Calendar, Star, BookmarkCheck, BookmarkPlus } from 'lucide-react-native';
import { tmdbService, getImageUrl } from '@/services/tmdb-service';
import { ThemedText } from '@/components/themed-text';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MovieDetailScreen() {
  const { toggleSave, isSaved } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
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

  const handleToggleSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleSave(id as string);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!data) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} bounces={false}>
      {/* Header Image */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: getImageUrl(data.backdrop_path || data.poster_path, 'original') }}
          style={styles.backdrop}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', theme.background]}
          style={styles.gradient}
        />
        <Pressable
          style={styles.backButton}
          onPress={() => { Haptics.selectionAsync(); router.back(); }}
        >
          <View style={[styles.backButtonInner, { backgroundColor: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.12)' }]}>
            <ChevronLeft size={24} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <ThemedText type="title" style={[styles.title, { color: theme.text }]}>{data.title || data.name}</ThemedText>

        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Star size={14} color="#EAB308" fill="#EAB308" />
            <Text style={[styles.metaText, { color: theme.icon }]}>{data.vote_average?.toFixed(1)}</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: theme.outline }]} />
          <View style={styles.metaItem}>
            <Clock size={14} color={theme.icon} />
            <Text style={[styles.metaText, { color: theme.icon }]}>{data.runtime || data.episode_run_time?.[0] || '?'} min</Text>
          </View>
          <View style={[styles.dot, { backgroundColor: theme.outline }]} />
          <View style={styles.metaItem}>
            <Calendar size={14} color={theme.icon} />
            <Text style={[styles.metaText, { color: theme.icon }]}>{(data.release_date || data.first_air_date)?.split('-')[0]}</Text>
          </View>
        </View>

        {/* Genres */}
        <View style={styles.genresContainer}>
          {data.genres?.map((g: any) => (
            <View key={g.id} style={[styles.genreTag, { backgroundColor: `${theme.tint}18`, borderColor: `${theme.tint}40` }]}>
              <Text style={[styles.genreText, { color: theme.tint }]}>{g.name}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            style={[styles.mainAction, { backgroundColor: theme.tint }, !videoKey && { opacity: 0.5 }]}
            onPress={handlePlayTrailer}
            disabled={!videoKey}
          >
            <Play size={20} color="#fff" fill="#fff" />
            <Text style={styles.mainActionText}>{videoKey ? 'Assistir Agora' : 'Sem Trailer'}</Text>
          </Pressable>
          <Pressable
            style={[styles.secondAction, { backgroundColor: theme.surface, borderColor: theme.outline }]}
            onPress={handleToggleSave}
          >
            {isSaved(id as string) ? (
              <BookmarkCheck size={24} color={theme.tint} />
            ) : (
              <BookmarkPlus size={24} color={theme.icon} />
            )}
          </Pressable>
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sinopse</Text>
          <Text style={[styles.overview, { color: theme.icon }]}>{data.overview}</Text>
        </View>

        {/* Cast */}
        {data.credits?.cast && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Elenco Principal</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.castList}>
              {data.credits.cast.slice(0, 10).map((actor: any) => (
                <Pressable
                  key={actor.id}
                  style={styles.actorCard}
                  onPress={() => router.push(`/actor/${actor.id}` as any)}
                >
                  <Image
                    source={{ uri: getImageUrl(actor.profile_path, 'w500') }}
                    style={[styles.actorImage, { borderColor: theme.outline }]}
                  />
                  <Text numberOfLines={1} style={[styles.actorName, { color: theme.text }]}>{actor.name}</Text>
                  <Text numberOfLines={1} style={[styles.actorChar, { color: theme.icon }]}>{actor.character}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  headerContainer: { width: SCREEN_WIDTH, height: 420 },
  backdrop: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  backButtonInner: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  content: { paddingHorizontal: 20, marginTop: -60, paddingBottom: 80 },
  title: { fontSize: 26, fontWeight: '900', textTransform: 'uppercase', marginBottom: 12 },
  metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, fontWeight: '600' },
  dot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 10 },
  genresContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  genreText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  mainAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
  },
  mainActionText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  secondAction: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
  },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  overview: { lineHeight: 22, fontSize: 15 },
  castList: { gap: 16, paddingRight: 20 },
  actorCard: { width: 90, alignItems: 'center' },
  actorImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 8, borderWidth: 2 },
  actorName: { fontSize: 11, textAlign: 'center', fontWeight: '600' },
  actorChar: { fontSize: 10, textAlign: 'center' },
});
