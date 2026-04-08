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

import { Hero } from '@/components/Hero';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const { toggleSave, isSaved } = useAuth();
  const [trending, setTrending] = useState<any[]>([]);
  const [trendingTV, setTrendingTV] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [nowPlaying, setNowPlaying] = useState<any[]>([]);
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

        // Fetch video for first trending movie
        if (trendingList[0]) {
          const videos = await tmdbService.getMovieVideos(trendingList[0].id);
          const trailer = videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube');
          if (trailer) setHeroVideo(trailer.key);
        }
      } catch (err) {
        console.error('Failed to load TMDB data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
      <ThemedView style={styles.loadingContainer}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  const heroMovie = trending[0];

  return (
    <View style={styles.container}>
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
          <Section title="Novidades" data={nowPlaying} />
          
          <AIRecommendations />

          <Section title="Populares no momento" data={popular} />
          <Section title="Explorar Séries de TV" data={trendingTV} />
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, data }: { title: string, data: any[] }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>{title}</ThemedText>
        <Pressable><ThemedText style={styles.seeAll}>Ver tudo</ThemedText></Pressable>
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
    backgroundColor: '#020205',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020205',
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
    color: '#6b46ff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
  },
});
