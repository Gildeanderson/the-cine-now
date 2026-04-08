import React, { useState, useEffect } from 'react';
import { StyleSheet, TextInput, View, FlatList, Pressable, ActivityIndicator, Dimensions } from 'react-native';
import { Search as SearchIcon, X, History, Star, Compass } from 'lucide-react-native';
import { tmdbService, getImageUrl } from '@/services/tmdb-service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MovieCard } from '@/components/MovieCard';
import { router } from 'expo-router';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [popular, setPopular] = useState<any[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [genresRes, popularRes] = await Promise.all([
          tmdbService.getGenres(),
          tmdbService.getPopular()
        ]);
        setGenres(genresRes.genres);
        setPopular(popularRes.results);
      } catch (error) {
        console.error('Failed to load explore data:', error);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query);
        setResults(data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'));
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <ThemedView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <SearchIcon size={20} color="#a1a1aa" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Filmes, séries ou atores..."
            placeholderTextColor="#52525b"
          />
          {query !== '' && (
            <Pressable onPress={() => setQuery('')}>
              <X size={20} color="#a1a1aa" />
            </Pressable>
          )}
        </View>
      </View>

      <FlatList
        data={query ? results : popular}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <>
            {!query && (
              <View style={styles.genresContainer}>
                <ThemedText style={styles.sectionTitle}>Gêneros</ThemedText>
                <FlatList
                  horizontal
                  data={genres}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <Pressable style={styles.genreButton}>
                      <ThemedText style={styles.genreText}>{item.name}</ThemedText>
                    </Pressable>
                  )}
                  showsHorizontalScrollIndicator={false}
                  ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
                />
              </View>
            )}
            <ThemedText style={styles.sectionTitle}>
              {query ? `Resultados para "${query}"` : 'Recomendados'}
            </ThemedText>
          </>
        }
        renderItem={({ item }) => (
          <MovieCard 
            movie={item} 
            onPress={() => {}}
            width={(Dimensions.get('window').width - 56) / 2}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#6b46ff" style={{ marginTop: 40 }} />
          ) : query ? (
            <ThemedText style={styles.emptyText}>Nenhum resultado encontrado.</ThemedText>
          ) : null
        }
      />
    </ThemedView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020205',
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#12121e',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  genresContainer: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  genreButton: {
    backgroundColor: 'rgba(107, 70, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 255, 0.2)',
  },
  genreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b46ff',
    textTransform: 'uppercase',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#a1a1aa',
  }
});
