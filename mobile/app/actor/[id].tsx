import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, Pressable, Dimensions, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, UserPlus, UserCheck } from 'lucide-react-native';
import { tmdbService, getImageUrl } from '@/services/tmdb-service';
import { MovieCard } from '@/components/MovieCard';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ActorDetailScreen() {
  const { toggleFollowActor, isFollowingActor } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { id } = useLocalSearchParams();
  const [actor, setActor] = useState<any>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBioExpanded, setIsBioExpanded] = useState(false);

  useEffect(() => {
    const loadActorData = async () => {
      try {
        const details = await tmdbService.getPersonDetails(id as string);
        setActor(details);
        if (details.combined_credits?.cast) {
          const castMovies = details.combined_credits.cast
            .filter((m: any) => m.poster_path)
            .sort((a: any, b: any) => b.popularity - a.popularity)
            .slice(0, 20);
          setMovies(castMovies);
        }
      } catch (err) {
        console.error('Failed to load actor details:', err);
      } finally {
        setLoading(false);
      }
    };
    loadActorData();
  }, [id]);

  const handleToggleFollow = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleFollowActor(id as string);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!actor) return null;

  const following = isFollowingActor(id as string);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} bounces={false}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Image
          source={{ uri: getImageUrl(actor.profile_path, 'original') }}
          style={styles.backdrop}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'transparent', theme.background]}
          style={styles.gradient}
        />
        <Pressable style={styles.backButton} onPress={() => { Haptics.selectionAsync(); router.back(); }}>
          <View style={[styles.backButtonInner, { backgroundColor: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.12)' }]}>
            <ChevronLeft size={24} color="#fff" />
          </View>
        </Pressable>
      </View>

      <View style={[styles.content, { paddingBottom: 100 }]}>
        <Text style={[styles.name, { color: theme.text }]}>{actor.name}</Text>

        <View style={styles.metaContainer}>
          <Text style={[styles.departmentText, { color: theme.tint }]}>{actor.known_for_department}</Text>
          {actor.place_of_birth ? (
            <>
              <View style={[styles.dot, { backgroundColor: theme.outline }]} />
              <Text style={[styles.metaText, { color: theme.icon }]} numberOfLines={1}>{actor.place_of_birth}</Text>
            </>
          ) : null}
        </View>

        {/* Follow Button */}
        <Pressable
          style={[
            styles.followButton,
            { backgroundColor: following ? '#fff' : theme.tint }
          ]}
          onPress={handleToggleFollow}
        >
          {following ? (
            <>
              <UserCheck size={20} color={theme.background} />
              <Text style={[styles.followText, { color: theme.background }]}>Seguindo</Text>
            </>
          ) : (
            <>
              <UserPlus size={20} color="#fff" />
              <Text style={[styles.followText, { color: '#fff' }]}>Seguir Ator</Text>
            </>
          )}
        </Pressable>

        {/* Biography */}
        {actor.biography ? (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Biografia</Text>
            <Pressable onPress={() => setIsBioExpanded(!isBioExpanded)}>
              <Text style={[styles.overview, { color: theme.icon }]} numberOfLines={isBioExpanded ? undefined : 5}>
                {actor.biography}
              </Text>
              <Text style={[styles.readMore, { color: theme.tint }]}>
                {isBioExpanded ? 'Ocultar' : 'Ler mais'}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Movies */}
        {movies.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Conhecido(a) por</Text>
            <FlatList
              horizontal
              data={movies}
              renderItem={({ item }) => (
                <MovieCard
                  movie={item}
                  onPress={(m) => router.push({ pathname: '/detail/[id]', params: { id: m.id, type: m.media_type || 'movie' } })}
                  width={130}
                />
              )}
              keyExtractor={(item) => `${item.id}-${Math.random()}`}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
            />
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  headerContainer: { width: SCREEN_WIDTH, height: 400 },
  backdrop: { width: '100%', height: '100%' },
  gradient: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  backButton: { position: 'absolute', top: 50, left: 20 },
  backButtonInner: { padding: 8, borderRadius: 12, borderWidth: 1 },
  content: { paddingHorizontal: 20, marginTop: -80 },
  name: { fontSize: 26, fontWeight: '900', textTransform: 'uppercase', marginBottom: 8 },
  metaContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  departmentText: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  metaText: { fontSize: 13, flexShrink: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 10 },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    marginBottom: 32,
  },
  followText: { fontSize: 16, fontWeight: 'bold' },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  overview: { lineHeight: 22, fontSize: 15 },
  readMore: { fontSize: 14, fontWeight: 'bold', marginTop: 8 },
  listContent: { paddingRight: 20 },
});
