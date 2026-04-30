import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, TextInput, View, FlatList, Pressable, ActivityIndicator, Dimensions, ScrollView } from 'react-native';
import { Search as SearchIcon, X, History, Star, Compass, Sparkles, MessageSquare } from 'lucide-react-native';
import { tmdbService, getImageUrl } from '@/services/tmdb-service';
import { aiService } from '@/services/ai-service';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MovieCard } from '@/components/MovieCard';
import { router } from 'expo-router';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [smartResults, setSmartResults] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [smartLoading, setSmartLoading] = useState(false);
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

  const performSmartSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 5) return;
    
    setSmartLoading(true);
    try {
      const suggestions = await aiService.searchSmart(searchTerm);
      
      const enrichedResults = await Promise.all(
        suggestions.map(async (suggestion) => {
          try {
            const searchData = await tmdbService.searchMulti(suggestion.title);
            const match = searchData.results.find((r: any) => 
              (r.title || r.name)?.toLowerCase() === suggestion.title.toLowerCase()
            ) || searchData.results[0];
            
            if (match) {
              return { ...match, reason: suggestion.reason };
            }
            return null;
          } catch (e) {
            return null;
          }
        })
      );

      setSmartResults(enrichedResults.filter(Boolean));
    } catch (err) {
      console.error('Smart search failed:', err);
    } finally {
      setSmartLoading(false);
    }
  };

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        setSmartResults([]);
        return;
      }
      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query);
        setResults(data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'));
        
        const isDescriptive = query.split(' ').length >= 3 || 
                             /quero|filme|série|tema|ator|atriz|sobre/i.test(query);
        
        if (isDescriptive) {
          performSmartSearch(query);
        } else {
          setSmartResults([]);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 600);
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

            {/* Smart Search Results Section */}
            {(smartLoading || smartResults.length > 0) && (
              <View style={styles.smartSection}>
                <View style={styles.smartHeader}>
                  <Sparkles size={20} color="#6b46ff" />
                  <ThemedText style={styles.smartTitle}>Busca Inteligente</ThemedText>
                </View>
                
                {smartLoading ? (
                  <View style={styles.smartLoading}>
                    <ActivityIndicator size="small" color="#6b46ff" />
                    <ThemedText style={styles.smartLoadingText}>IA está analisando...</ThemedText>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.smartScroll}>
                    {smartResults.map((item) => (
                      <Pressable 
                        key={`smart-${item.id}`}
                        onPress={() => router.push(`/detail/${item.id}`)}
                        style={styles.smartCard}
                      >
                        <View style={styles.smartPosterContainer}>
                          <MovieCard 
                            movie={item} 
                            onPress={() => router.push(`/detail/${item.id}`)}
                            width={120}
                          />
                        </View>
                        <View style={styles.reasonContainer}>
                          <MessageSquare size={12} color="#a1a1aa" />
                          <ThemedText style={styles.reasonText} numberOfLines={2}>
                            {item.reason}
                          </ThemedText>
                        </View>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            <ThemedText style={styles.sectionTitle}>
              {query ? `Resultados TMDB` : 'Recomendados'}
            </ThemedText>
          </>
        }
        renderItem={({ item }) => (
          <MovieCard 
            movie={item} 
            onPress={() => router.push(`/detail/${item.id}`)}
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
  },
  smartSection: {
    marginBottom: 30,
    backgroundColor: 'rgba(107, 70, 255, 0.05)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(107, 70, 255, 0.1)',
  },
  smartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  smartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  smartLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  smartLoadingText: {
    fontSize: 14,
    color: '#a1a1aa',
    fontStyle: 'italic',
  },
  smartScroll: {
    marginHorizontal: -8,
  },
  smartCard: {
    width: 136,
    paddingHorizontal: 8,
  },
  smartPosterContainer: {
    marginBottom: 8,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 8,
    borderRadius: 12,
  },
  reasonText: {
    fontSize: 10,
    color: '#a1a1aa',
    fontStyle: 'italic',
    flex: 1,
  },
});
