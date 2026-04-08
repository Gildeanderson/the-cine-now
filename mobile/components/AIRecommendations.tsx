import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { Sparkles, Play, ChevronRight } from 'lucide-react-native';
import { aiService, Recommendation } from '@/services/ai-service';
import { useAuth } from '@/context/AuthContext';
import { ThemedText } from './themed-text';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export function AIRecommendations() {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAI = async () => {
    if (!profile?.saved || profile.saved.length === 0) return;
    setLoading(true);
    try {
      const recs = await aiService.getRecommendations(profile.saved);
      setRecommendations(recs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.saved && profile.saved.length > 0 && recommendations.length === 0) {
      fetchAI();
    }
  }, [profile?.saved]);

  if (!profile?.saved || profile.saved.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Sparkles size={20} color="#6b46ff" fill="#6b46ff" />
          <ThemedText type="subtitle" style={styles.title}>Recomendado por IA</ThemedText>
        </View>
        <Pressable onPress={fetchAI} disabled={loading}>
          <ThemedText style={styles.refreshText}>{loading ? 'Recalculando...' : 'Atualizar'}</ThemedText>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color="#6b46ff" />
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {recommendations.map((rec, index) => (
            <Pressable 
              key={index} 
              style={styles.card}
              onPress={() => router.push({ pathname: '/(tabs)/explore', params: { q: rec.title } })}
            >
              <LinearGradient
                colors={['rgba(107, 70, 255, 0.2)', 'rgba(107, 70, 255, 0.05)']}
                style={styles.cardGradient}
              />
              <ThemedText style={styles.recTitle}>{rec.title}</ThemedText>
              <ThemedText style={styles.recReason}>{rec.reason}</ThemedText>
              <View style={styles.cardFooter}>
                <ThemedText style={styles.recType}>{rec.type === 'movie' ? 'Filme' : 'Série'}</ThemedText>
                <ChevronRight size={14} color="#616161" />
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    backgroundColor: '#0c0c14',
    paddingVertical: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshText: {
    color: '#6b46ff',
    fontSize: 14,
    fontWeight: '600',
  },
  loader: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  card: {
    width: 200,
    padding: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  recTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  recReason: {
    fontSize: 12,
    color: '#a1a1aa',
    lineHeight: 16,
    marginBottom: 12,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recType: {
    fontSize: 10,
    color: '#6b46ff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});
