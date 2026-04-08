import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, Play, Info, Key } from 'lucide-react';
import { aiService, Recommendation } from '../services/aiService';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { useAuth } from '../context/AuthContext';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { cn } from '../lib/utils';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function AIRecommendations() {
  const { profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useDraggableScroll();

  const lastFetchedProfileRef = useRef<string>('');

  const fetchAIRecommendations = useCallback(async () => {
    if (authLoading || !profile) return;
    
    // Create a signature of the current profile data to avoid redundant fetches
    const profileSignature = JSON.stringify({
      likes: profile.likes || [],
      saved: profile.saved || [],
      following: profile.followingActors || [],
      continue: profile.continueWatching || []
    });

    if (profileSignature === lastFetchedProfileRef.current && recommendations.length > 0) {
      return;
    }

    // Check if we have an API key or if we need to prompt the user
    const hasKey = await window.aistudio?.hasSelectedApiKey?.() || !!process.env.GEMINI_API_KEY;
    if (!hasKey) {
      setNeedsKey(true);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const aiRecs: Recommendation[] = await aiService.getRecommendations(
        profile.likes || [],
        profile.saved || [],
        profile.followingActors || [],
        profile.continueWatching || []
      );

      if (aiRecs.length === 0) {
        // If it returns empty, it might be a permission issue or just no data
        const stillNoKey = !(await window.aistudio?.hasSelectedApiKey?.()) && !process.env.GEMINI_API_KEY;
        if (stillNoKey) {
          setNeedsKey(true);
          setLoading(false);
          return;
        }
      }

      // Search for each recommendation on TMDB to get full details (poster, etc.)
      const fullDetails = await Promise.all(
        aiRecs.map(async (rec) => {
          try {
            const searchResults = await tmdbService.searchMulti(rec.title);
            const match = searchResults.results.find((r: any) => 
              (r.media_type === rec.type) && 
              (r.title?.toLowerCase() === rec.title.toLowerCase() || r.name?.toLowerCase() === rec.title.toLowerCase())
            ) || searchResults.results[0];

            if (match) {
              return { ...match, aiReason: rec.reason };
            }
            return null;
          } catch (err) {
            return null;
          }
        })
      );

      const filtered = fullDetails.filter(Boolean);
      setRecommendations(filtered);
      lastFetchedProfileRef.current = profileSignature;
    } catch (error: any) {
      console.error("Failed to fetch AI recommendations:", error);
      const errorMsg = error?.message || "";
      if (errorMsg.includes('permission denied') || errorMsg.includes('Requested entity was not found') || errorMsg.includes('API_KEY_INVALID')) {
        setNeedsKey(true);
      } else {
        setError("Não foi possível carregar as recomendações. Verifique sua conexão ou tente novamente mais tarde.");
      }
    } finally {
      setLoading(false);
    }
  }, [profile, authLoading, recommendations.length]);

  useEffect(() => {
    fetchAIRecommendations();
  }, [fetchAIRecommendations]);

  const handleSelectKey = async () => {
    try {
      await window.aistudio.openSelectKey();
      // Assume success and retry
      setNeedsKey(false);
      fetchAIRecommendations();
    } catch (err) {
      console.error("Error opening key selector:", err);
    }
  };

  if (!profile) return null;

  if (needsKey) {
    return (
      <section className="py-12 px-8 md:px-16">
        <div className="bg-surface-high rounded-[2rem] p-8 md:p-12 border border-white/5 flex flex-col md:flex-row items-center gap-8">
          <div className="p-6 rounded-full bg-electric-indigo/10 text-electric-indigo">
            <Key className="w-12 h-12" />
          </div>
          <div className="flex-1 space-y-4 text-center md:text-left">
            <h2 className="text-2xl font-display font-black uppercase tracking-tight">Ative a Inteligência Artificial</h2>
            <p className="text-zinc-400 max-w-xl">
              Para receber recomendações personalizadas, você precisa configurar sua chave de API do Gemini. 
              É rápido e gratuito para desenvolvedores.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
              <button 
                onClick={handleSelectKey}
                className="px-8 py-3 rounded-full bg-electric-indigo text-obsidian font-bold hover:bg-electric-indigo/90 transition-all flex items-center gap-2"
              >
                <Key className="w-4 h-4" />
                Configurar Chave API
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-3 rounded-full glass text-zinc-300 font-bold hover:bg-white/5 transition-all text-sm"
              >
                Saiba Mais
              </a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (recommendations.length === 0 && !loading) return null;

  return (
    <section className="py-12 space-y-8">
      <div className="flex items-center gap-3 px-8 md:px-16">
        <div className="p-2 rounded-xl bg-electric-indigo/20 text-electric-indigo">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-black tracking-tight uppercase">Para Você</h2>
          <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Recomendações de IA personalizadas</p>
        </div>
      </div>

      {loading ? (
        <div className="px-8 md:px-16 flex gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="min-w-[280px] aspect-[16/9] rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div 
          {...scrollRef}
          className="flex gap-6 overflow-x-auto px-8 md:px-16 pb-8 hide-scrollbar select-none"
        >
          {recommendations.map((item) => (
            <motion.div
              key={`${item.media_type}-${item.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="min-w-[320px] md:min-w-[400px] group relative aspect-[16/9] rounded-3xl overflow-hidden cursor-pointer shadow-2xl border border-white/5"
              onClick={() => navigate(`/${item.media_type || (item.title ? 'movie' : 'tv')}/${item.id}`)}
            >
              <img
                src={getImageUrl(item.backdrop_path || item.poster_path, 'w500')}
                alt={item.title || item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent opacity-90" />
              
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="space-y-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-electric-indigo text-[10px] font-black uppercase text-obsidian">
                      IA Suggestion
                    </span>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                      {item.media_type === 'tv' ? 'Série' : 'Filme'}
                    </span>
                  </div>
                  <h3 className="text-xl font-display font-black uppercase leading-tight truncate">
                    {item.title || item.name}
                  </h3>
                  <p className="text-xs text-zinc-300 font-medium line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {item.aiReason}
                  </p>
                  
                  <div className="flex items-center gap-3 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-obsidian font-bold text-[10px] uppercase tracking-wider hover:bg-electric-indigo hover:text-white transition-colors">
                      <Play className="w-3 h-3 fill-current" />
                      Assistir
                    </button>
                    <button className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}
