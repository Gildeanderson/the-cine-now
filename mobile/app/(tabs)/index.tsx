import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, FlatList, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, BookmarkCheck, BookmarkPlus } from 'lucide-react-native';
import { tmdbService, getImageUrl } from '@/services/tmdb-service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HomeHeader } from '@/components/HomeHeader';
import { AIRecommendations } from '@/components/AIRecommendations';
import { MovieCard } from '@/components/MovieCard';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/context/AuthContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import { Hero } from '@/components/Hero';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'dark'];
  const { toggleSave, isSaved } = useAuth();
  const [trending, setTrending] = useState<any[]>([]);
  const [trendingTV, setTrendingTV] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any[]>([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroVideo, setHeroVideo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trendingRes, trendingTVRes, popularRes, nowPlayingRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getTrendingTV(),
          tmdbService.getPopular(),
          tmdbService.getNowPlaying()
        ]);
        
        const trendingList = trendingRes.results;
        setTrending(trendingList);
        setTrendingTV(trendingTVRes.results);
        setPopular(popularRes.results);
        setNowPlaying(nowPlayingRes.results);

      } catch (err) {
        console.error('Failed to load TMDB data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Rotação do Banner
  useEffect(() => {
    if (trending.length > 0) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % Math.min(5, trending.length));
      }, 7000); // Trocando de 5s para 7s
      return () => clearInterval(interval);
    }
  }, [trending]);

  // Carregar Trailer do filme em foco no Banner
  useEffect(() => {
    const fetchHeroVideo = async () => {
      if (trending.length > 0) {
        const currentHero = trending[heroIndex];
        try {
          const videos = await tmdbService.getMovieVideos(currentHero.id);
          const trailer = videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          setHeroVideo(trailer ? trailer.key : null);
        } catch (e) {
          console.log(e);
        }
      }
    };
    fetchHeroVideo();
  }, [heroIndex, trending]);

  const handlePlayTrailer = async () => {
    if (heroVideo) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${heroVideo}`);
    }
  };

  const handleToggleSave = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await toggleSave(id);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  const heroMovie = trending[heroIndex] || trending[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <HomeHeader />
      <ScrollView bounces={false}>
        {/* Hero Banner */}
        <Hero 
          movie={heroMovie} 
          onPlay={handlePlayTrailer} 
          onToggleSave={handleToggleSave} 
          isSaved={isSaved} 
        />

        {/* Sections */}
        <View style={styles.sectionsContainer}>
          <Section title="Novidades" data={nowPlaying} theme={theme} />
          
          <AIRecommendations />

          <Section title="Populares no momento" data={popular} theme={theme} />
          <Section title="Explorar Séries de TV" data={trendingTV} theme={theme} />
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, data, theme }: { title: string; data: any[]; theme: any }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={[styles.sectionTitle, { color: theme.text }]}>{title}</ThemedText>
        <Pressable><ThemedText style={[styles.seeAll, { color: theme.tint }]}>Ver tudo</ThemedText></Pressable>
      </View>
      <FlatList
        horizontal
        data={data}
        renderItem={({ item }) => (
          <MovieCard 
            movie={item} 
            onPress={(m) => console.log('Movie pressed:', m.id)} 
            width={140}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionsContainer: {
    marginTop: -120,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
  },
});
