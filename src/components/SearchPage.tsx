import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search as SearchIcon, X, History, Grid, List, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

export default function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  }, []);

  useEffect(() => {
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await tmdbService.searchMulti(query);
        setResults(data.results.filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv'));
      } catch (err) {
        console.error('Search failed:', err);
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(search, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 md:px-16 space-y-12 atmosphere min-h-screen pb-20"
    >
      {/* Search Input */}
      <div className="relative flex items-center gap-4 pt-8">
        <div className="relative flex-1 group">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant group-focus-within:text-electric-indigo transition-colors" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, actors, or directors..."
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
          Cancel
        </button>
      </div>

      {/* Categories */}
      <section className="space-y-4">
        <h3 className="font-headline font-semibold text-xs tracking-widest uppercase opacity-40">Browse by Genre</h3>
        <div 
          {...genreScroll}
          className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 select-none"
        >
          {genres.map((genre) => (
            <button
              key={genre.id}
              className="whitespace-nowrap bg-surface-high/40 backdrop-blur-md rounded-full px-6 py-2 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all border border-white/5 active:scale-95"
            >
              {genre.name}
            </button>
          ))}
        </div>
      </section>

      {/* Recent Searches */}
      {!query && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline font-semibold text-xs tracking-widest uppercase opacity-40">Recent Searches</h3>
            <button className="text-electric-indigo text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">Clear All</button>
          </div>
          <div className="flex flex-wrap gap-3">
            {['Cyberpunk 2077', 'The Last Voyage', 'Interstellar'].map(term => (
              <div key={term} className="flex items-center gap-2 bg-surface-high/40 backdrop-blur-md px-4 py-2 rounded-lg group hover:bg-white/10 transition-all cursor-pointer border border-white/5">
                <History className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-electric-indigo transition-colors" />
                <span className="text-xs font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">{term}</span>
                <X className="w-3.5 h-3.5 text-on-surface-variant hover:text-red-500 transition-colors" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Results */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-3xl md:text-5xl font-bold tracking-tight">
            {query ? 'Search Results' : 'Recommended'}
          </h3>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-xl bg-surface-high/40 backdrop-blur-md flex items-center justify-center text-electric-indigo border border-electric-indigo/20">
              <Grid className="w-4 h-4" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-surface-high/40 backdrop-blur-md flex items-center justify-center text-on-surface-variant opacity-40 hover:opacity-100 transition-opacity">
              <List className="w-4 h-4" />
            </button>
          </div>
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
              Retry Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
            {results.map(movie => (
              <div
                key={movie.id}
                className="group cursor-pointer"
                onClick={() => navigate(`/${movie.media_type || 'movie'}/${movie.id}`)}
              >
                <div className="aspect-[2/3] rounded-3xl overflow-hidden mb-5 shadow-2xl transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-electric-indigo/20 relative">
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="font-headline font-bold text-lg on-surface truncate group-hover:text-electric-indigo transition-colors">
                  {movie.title || movie.name}
                </h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.2em]">
                    {(movie.release_date || movie.first_air_date)?.split('-')[0]}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[10px] font-bold">{movie.vote_average?.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
            {query && results.length === 0 && (
              <div className="col-span-full py-24 text-center glass rounded-[2rem] space-y-4">
                <p className="text-on-surface-variant font-bold uppercase tracking-widest">
                  No results found for "{query}"
                </p>
                <p className="text-xs text-on-surface-variant/60">Try different keywords or browse by genre.</p>
              </div>
            )}
          </div>
        )}
      </section>
    </motion.div>
  );
}
