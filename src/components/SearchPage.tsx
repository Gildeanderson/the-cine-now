import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon, X, History, Grid, List, Star, Sparkles, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { aiService, Recommendation } from '../services/aiService';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useLanguage } from '../context/LanguageContext';

export default function SearchPage() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [smartResults, setSmartResults] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [smartLoading, setSmartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const genreScroll = useDraggableScroll();

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const data = await tmdbService.getGenres();
        setGenres(data.genres);
      } catch (error) {
        console.error('Failed to load genres:', error);
      }
    };
    loadGenres();
  }, [language]);

  const loadRecommended = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tmdbService.getPopular();
      setResults(data.results.map((r: any) => ({ ...r, media_type: 'movie' })));
      setSmartResults([]);
    } catch (err) {
      console.error('Failed to load recommended:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadGenreResults = useCallback(async (genreId: number) => {
    setLoading(true);
    try {
      const data = await tmdbService.getMoviesByGenre(genreId);
      setResults(data.results.map((r: any) => ({ ...r, media_type: 'movie' })));
      setSmartResults([]);
    } catch (err) {
      console.error('Failed to load genre results:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const performSmartSearch = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 5) return;
    
    console.log("SearchPage: Starting smart search for:", searchTerm);
    setSmartLoading(true);
    try {
      const suggestions = await aiService.searchSmart(searchTerm);
      console.log("SearchPage: AI suggestions received:", suggestions);
      
      if (!suggestions || suggestions.length === 0) {
        console.warn("SearchPage: AI returned no suggestions.");
        setSmartLoading(false);
        return;
      }

      const enrichedResults = await Promise.all(
        suggestions.map(async (suggestion) => {
          try {
            // Search TMDB with the suggested title
            const searchData = await tmdbService.searchMulti(suggestion.title);
            
            if (!searchData.results || searchData.results.length === 0) {
              console.warn(`SearchPage: No TMDB results for "${suggestion.title}"`);
              return null;
            }

            // Filter for only movies or TV shows
            const mediaResults = searchData.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv');
            
            if (mediaResults.length === 0) {
              console.warn(`SearchPage: No movie/tv results for "${suggestion.title}"`);
              return null;
            }

            // Try to find the best match (exact title or just the first result)
            const match = mediaResults.find((r: any) => 
              (r.title || r.name)?.toLowerCase() === suggestion.title.toLowerCase() ||
              (r.original_title || r.original_name)?.toLowerCase() === suggestion.title.toLowerCase()
            ) || mediaResults[0];
            
            return { 
              ...match, 
              reason: suggestion.reason, 
              media_type: match.media_type || suggestion.type 
            };
          } catch (e) {
            console.error(`SearchPage: Error enriching "${suggestion.title}":`, e);
            return null;
          }
        })
      );

      const finalResults = enrichedResults.filter(Boolean);
      console.log("SearchPage: Final enriched results:", finalResults.length);
      setSmartResults(finalResults);
    } catch (err) {
      console.error('SearchPage: Smart search failed:', err);
    } finally {
      setSmartLoading(false);
    }
  };

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        if (activeGenre) {
          loadGenreResults(activeGenre);
        } else {
          loadRecommended();
        }
        setError(null);
        setSmartResults([]);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await tmdbService.searchMulti(query);
        const filteredResults = data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv');
        setResults(filteredResults);
        
        // Trigger smart search for any query > 3 chars
        if (query.trim().length >= 3) {
          performSmartSearch(query);
        } else {
          setSmartResults([]);
        }
      } catch (err) {
        console.error('Search failed:', err);
        setError(err instanceof Error ? err.message : t('search.noresults'));
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 600);
    return () => clearTimeout(timeoutId);
  }, [query, activeGenre, loadRecommended, loadGenreResults, t]);

  const handleGenreClick = (genreId: number) => {
    if (activeGenre === genreId) {
      setActiveGenre(null);
      setQuery('');
    } else {
      setQuery('');
      setActiveGenre(genreId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 md:px-16 space-y-12 atmosphere min-h-screen pb-20"
    >
      {/* Search Input */}
      <div className="relative flex items-center gap-4 pt-24">
        <div className="relative flex-1 group">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-electric-indigo transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="w-full bg-surface-low/40 backdrop-blur-xl border border-white/5 rounded-xl py-4 pl-14 pr-5 text-on-surface placeholder:text-on-surface-variant/50 focus:ring-1 focus:ring-electric-indigo/30 font-medium text-base transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="text-on-surface-variant hover:text-electric-indigo font-semibold uppercase tracking-widest text-[10px] transition-colors"
        >
          {t('search.cancel')}
        </button>
      </div>

      {/* Categories */}
      <section className="space-y-4">
        <h3 className="font-headline font-semibold text-xs tracking-widest uppercase opacity-40">{t('search.genre')}</h3>
        <div 
          {...genreScroll}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 select-none"
        >
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => handleGenreClick(genre.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest transition-all border active:scale-95",
                activeGenre === genre.id 
                  ? "bg-electric-indigo text-obsidian border-electric-indigo" 
                  : "bg-surface-high/40 backdrop-blur-md text-on-surface hover:bg-white/10 border-white/5"
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Searches (Simplified for now) */}
      {!query && !activeGenre && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-semibold text-xs tracking-widest uppercase opacity-40">{t('search.recent')}</h3>
            <button className="text-electric-indigo text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">{t('search.clear')}</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {['Inception', 'The Matrix', 'The Boys'].map(term => (
              <div 
                key={term} 
                onClick={() => setQuery(term)}
                className="flex items-center gap-2 bg-surface-high/40 backdrop-blur-md px-4 py-2 rounded-lg group hover:bg-white/10 transition-all cursor-pointer border border-white/5"
              >
                <History className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-electric-indigo transition-colors" />
                <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">{term}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Smart Search Results */}
      <AnimatePresence>
        {(smartLoading || smartResults.length > 0) && (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full cinematic-gradient flex items-center justify-center text-obsidian shadow-lg shadow-electric-indigo/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-headline text-2xl font-bold text-white">{t('search.smart_search')}</h3>
                <p className="text-xs text-on-surface-variant/60">{t('search.smart_desc')}</p>
              </div>
            </div>

            {smartLoading ? (
              <div className="flex items-center gap-4 p-8 glass rounded-3xl">
                <div className="w-5 h-5 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-medium text-on-surface-variant animate-pulse">{t('search.smart_loading')}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {smartResults.map((movie) => (
                  <motion.div
                    key={`smart-${movie.id}`}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
                    className="glass p-4 rounded-3xl flex gap-4 cursor-pointer hover:bg-white/5 transition-all group relative overflow-hidden"
                  >
                    <div className="w-20 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={getImageUrl(movie.poster_path)}
                        alt={movie.title || movie.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 space-y-2 min-w-0">
                      <h4 className="font-bold text-sm truncate pr-6">{movie.title || movie.name}</h4>
                      <div className="flex items-center gap-2">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                        <span className="text-[10px] font-bold opacity-60">{movie.vote_average?.toFixed(1)}</span>
                        <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
                        <span className="text-[10px] font-bold opacity-40 uppercase">{(movie.release_date || movie.first_air_date)?.split('-')[0]}</span>
                      </div>
                      <p className="text-[10px] text-on-surface-variant/80 line-clamp-2 leading-relaxed italic bg-white/5 p-2 rounded-lg border border-white/5">
                        "{movie.reason}"
                      </p>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MessageSquare className="w-4 h-4 text-electric-indigo" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Main Results Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-headline font-bold text-2xl text-white">
            {activeGenre ? genres.find(g => g.id === activeGenre)?.name : (query ? t('search.results') : t('search.recommended'))}
          </h3>
          {results.length > 0 && (
            <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">
              {results.length} {t('search.results')}
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-12 h-12 border-4 border-electric-indigo border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-24 text-center space-y-6 glass rounded-[2rem]">
            <p className="text-accent font-bold uppercase tracking-widest">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 rounded-full cinematic-gradient text-obsidian font-bold uppercase tracking-widest text-xs"
            >
              {t('search.retry')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
            {results.map((movie) => (
              <motion.div
                key={`${movie.media_type || 'movie'}-${movie.id}`}
                whileHover={{ y: -10 }}
                onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
                className="group cursor-pointer space-y-4"
              >
                <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden glass border border-white/5 group-hover:border-electric-indigo/50 transition-all duration-500 shadow-2xl group-hover:shadow-electric-indigo/20">
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {movie.vote_average > 0 && (
                    <div className="absolute top-4 right-4 bg-obsidian/60 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      <span className="text-[10px] font-bold text-white">{movie.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
                
                <div className="px-2">
                  <h4 className="font-headline font-bold text-base text-white truncate group-hover:text-electric-indigo transition-colors duration-300">
                    {movie.title || movie.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 opacity-40">
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {(movie.release_date || movie.first_air_date)?.split('-')[0]}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {movie.media_type === 'tv' ? 'Série' : 'Filme'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {(query || activeGenre) && results.length === 0 && !smartLoading && smartResults.length === 0 && (
              <div className="col-span-full py-24 text-center glass rounded-[2rem] space-y-4">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-8 h-8 text-on-surface-variant/20" />
                </div>
                <p className="text-on-surface-variant font-bold uppercase tracking-widest">
                  {t('search.noresults')} {query ? `"${query}"` : ''}
                </p>
                <p className="text-xs text-on-surface-variant/60">{t('search.noresults.desc')}</p>
              </div>
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
