import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Plus, Info, ChevronRight, Star, Bookmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import VideoPlayer from './VideoPlayer';
import AIRecommendations from './AIRecommendations';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, toggleSave, guestContinueWatching, addToContinueWatching } = useAuth();
  const [trending, setTrending] = useState<any[]>([]);
  const [trendingTV, setTrendingTV] = useState<any[]>([]);
  const [continueWatching, setContinueWatching] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [popularTV, setPopularTV] = useState<any[]>([]);
  const [genres, setGenres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeGenre, setActiveGenre] = useState<number | null>(null);
  const [genreMovies, setGenreMovies] = useState<any[]>([]);
  const [genreLoading, setGenreLoading] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);
  const [heroTrailer, setHeroTrailer] = useState<any>(null);
  
  const continueWatchingScroll = useDraggableScroll();
  const trendingScroll = useDraggableScroll();
  const tvSeriesScroll = useDraggableScroll();

  useEffect(() => {
    const loadGenreMovies = async () => {
      if (!activeGenre) {
        setGenreMovies([]);
        return;
      }
      setGenreLoading(true);
      try {
        const data = await tmdbService.getMoviesByGenre(activeGenre);
        setGenreMovies(data.results);
      } catch (err) {
        console.error('Failed to load genre movies:', err);
      } finally {
        setGenreLoading(false);
      }
    };
    loadGenreMovies();
  }, [activeGenre]);

  useEffect(() => {
    const loadContinueWatching = async () => {
      const listToLoad = profile?.continueWatching || guestContinueWatching;
      if (!listToLoad || listToLoad.length === 0) {
        setContinueWatching([]);
        return;
      }

      try {
        const contentPromises = listToLoad.map(async (id) => {
          try {
            const movie = await tmdbService.getMovieDetails(id);
            return { ...movie, media_type: 'movie' };
          } catch (e) {
            try {
              const tv = await tmdbService.getTVDetails(id);
              return { ...tv, media_type: 'tv' };
            } catch (e2) {
              return null;
            }
          }
        });
        const results = await Promise.all(contentPromises);
        setContinueWatching(results.filter(item => item !== null));
      } catch (err) {
        console.error('Failed to load continue watching:', err);
      }
    };
    loadContinueWatching();
  }, [profile?.continueWatching, guestContinueWatching]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        const [trendingRes, trendingTVRes, popularRes, popularTVRes, genresRes] = await Promise.all([
          tmdbService.getTrending(),
          tmdbService.getTrendingTV(),
          tmdbService.getPopular(),
          tmdbService.getPopularTV(),
          tmdbService.getGenres()
        ]);
        setTrending(trendingRes.results);
        setTrendingTV(trendingTVRes.results);
        setPopular(popularRes.results);
        setPopularTV(popularTVRes.results);
        setGenres(genresRes.genres);

        // Load trailer for hero movie
        if (trendingRes.results[0]) {
          const details = await tmdbService.getMovieDetails(trendingRes.results[0].id);
          let trailer = details.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || details.videos?.results?.[0];
          
          // If no trailer in Portuguese, try English
          if (!trailer) {
            try {
              const enDetails = await tmdbService.getMovieDetails(trendingRes.results[0].id, 'en-US');
              trailer = enDetails.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || enDetails.videos?.results?.[0];
            } catch (e) {
              console.error('Failed to load English trailer:', e);
            }
          }
          
          setHeroTrailer(trailer);
        }
      } catch (err) {
        console.error('Failed to load TMDB data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load movie data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-electric-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <Play className="w-12 h-12 rotate-90" />
        </div>
        <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
        <p className="text-on-surface-variant max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-electric-indigo text-obsidian font-bold rounded-full"
        >
          Try Again
        </button>
      </div>
    );
  }

  const heroMovie = trending[0];

  const handleWatchNow = () => {
    console.log('handleWatchNow clicked. heroTrailer:', heroTrailer, 'heroMovie:', heroMovie);
    if (heroTrailer) {
      if (heroMovie) {
        addToContinueWatching(heroMovie.id.toString());
      }
      setShowPlayer(true);
    } else {
      alert('Trailer not available for this movie.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-20 atmosphere"
    >
      <AnimatePresence>
        {showPlayer && heroTrailer && heroMovie && (
          <VideoPlayer 
            key="hero-trailer-player"
            videoKey={heroTrailer.key} 
            title={heroMovie.title} 
            onClose={() => setShowPlayer(false)} 
          />
        )}
      </AnimatePresence>

      {/* Hero Banner */}
      {heroMovie && (
        <section className="relative w-full h-[85vh] overflow-hidden">
          <motion.img
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={getImageUrl(heroMovie.backdrop_path, 'original')}
            alt={heroMovie.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 scrim-bottom" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/20 to-transparent" />
          
          <div className="absolute top-16 inset-x-0 bottom-0 pb-8 md:pb-16 px-8 md:px-16 flex flex-col justify-center w-full md:w-2/3 space-y-6">
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="font-display text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-tight uppercase drop-shadow-2xl break-words"
            >
              {heroMovie.title}
            </motion.h2>

            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-on-surface-variant text-base md:text-lg max-w-xl font-medium line-clamp-3 md:line-clamp-none"
            >
              {heroMovie.overview}
            </motion.p>

            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex flex-wrap items-center gap-4"
            >
              <button
                onClick={handleWatchNow}
                className="px-8 py-4 rounded-full bg-electric-indigo text-obsidian font-bold flex items-center gap-2 hover:bg-electric-indigo/90 active:scale-95 transition-all shadow-lg shadow-electric-indigo/10"
              >
                <Play className="w-5 h-5 fill-current" />
                Watch Now
              </button>
              <Link
                to={`/movie/${heroMovie.id}`}
                className="px-8 py-4 rounded-full glass text-on-surface font-bold flex items-center gap-2 hover:bg-white/10 active:scale-95 transition-all"
              >
                <Info className="w-5 h-5" />
                More Info
              </Link>
              <button 
                onClick={() => {
                  if (!profile) {
                    navigate('/login');
                    return;
                  }
                  heroMovie && toggleSave(heroMovie.id.toString());
                }}
                className={cn(
                  "p-4 rounded-full glass transition-all active:scale-95 border border-white/5",
                  profile?.saved?.includes(heroMovie.id.toString()) ? "bg-electric-indigo text-obsidian" : "text-on-surface hover:bg-white/10"
                )}
              >
                <Bookmark className={cn("w-6 h-6", profile?.saved?.includes(heroMovie.id.toString()) && "fill-current")} />
              </button>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-electric-indigo/20 text-electric-indigo font-bold text-[10px] uppercase tracking-widest border border-electric-indigo/30 whitespace-nowrap">
                  Trending Now
                </span>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-sm font-bold">{heroMovie.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Section 1: Continue Watching or Trending Fallback */}
      <section className="space-y-6 -mt-24 relative z-10">
        {(continueWatching.length > 0 || trending.length > 0) && (
          <>
            <div className="px-6 flex justify-between items-center">
              <h3 className="font-headline text-2xl font-bold tracking-tight">
                {continueWatching.length > 0 ? 'Continue Watching' : 'Trending This Week'}
              </h3>
              <button className="text-on-surface-variant hover:text-electric-indigo transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            <div 
              {...continueWatchingScroll}
              className="flex gap-6 px-6 overflow-x-auto hide-scrollbar pb-4 select-none"
            >
              {(continueWatching.length > 0 ? continueWatching : trending).slice(0, 10).map((movie, i) => (
                <Link 
                  key={`${movie.media_type || 'movie'}-${movie.id}-${i}`} 
                  to={`/${movie.media_type || 'movie'}/${movie.id}`} 
                  className={cn(
                    "flex-none group",
                    continueWatching.length > 0 ? "w-72 md:w-80" : "w-40 md:w-48"
                  )}
                  onClick={() => addToContinueWatching(movie.id.toString())}
                >
                  <div className={cn(
                    "relative overflow-hidden mb-4 shadow-2xl transition-all duration-500 group-hover:-translate-y-2",
                    continueWatching.length > 0 ? "aspect-video rounded-2xl" : "aspect-[2/3] rounded-2xl"
                  )}>
                    <img
                      src={getImageUrl(continueWatching.length > 0 ? movie.backdrop_path : movie.poster_path)}
                      alt={movie.title || movie.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="w-12 h-12 rounded-full glass flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                      </div>
                    </div>
                    {continueWatching.length > 0 && (
                      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.random() * 60 + 20}%` }}
                          className="h-full bg-electric-indigo shadow-[0_0_10px_rgba(163,166,255,0.5)]" 
                        />
                      </div>
                    )}
                    {!continueWatching.length && (
                      <div className="absolute top-3 left-3 w-8 h-8 rounded-full glass flex items-center justify-center font-display text-lg font-black text-electric-indigo">
                        {i + 1}
                      </div>
                    )}
                  </div>
                  <h4 className={cn(
                    "font-headline font-bold truncate group-hover:text-electric-indigo transition-colors",
                    continueWatching.length > 0 ? "text-base" : "text-sm"
                  )}>
                    {movie.title || movie.name}
                  </h4>
                  {continueWatching.length > 0 && (
                    <p className="text-xs text-on-surface-variant mt-1 font-medium uppercase tracking-wider">
                      {Math.floor(Math.random() * 45 + 5)}m remaining
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* AI Recommendations */}
      <AIRecommendations />

      {/* Featured Collection */}
      <section className="px-6">
        <div className="relative rounded-[2rem] overflow-hidden bg-surface-high p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 border border-white/5">
          <div className="absolute inset-0 atmosphere opacity-50" />
          <div className="relative z-10 flex-1 space-y-6">
            <span className="text-accent font-bold text-xs uppercase tracking-[0.2em]">Curated Collection</span>
            <h3 className="font-headline text-3xl md:text-5xl font-bold tracking-tight leading-tight">
              The Cyberpunk <br /> Anthology
            </h3>
            <p className="text-on-surface-variant max-w-md font-medium">
              Dive into neon-lit futures, high-tech rebellions, and the blurred lines between man and machine.
            </p>
            <button className="px-8 py-3 rounded-full bg-on-surface text-obsidian font-bold hover:scale-105 transition-transform">
              Explore Collection
            </button>
          </div>
          <div className="relative z-10 flex gap-4 -rotate-6">
            {popular.slice(10, 13).map((movie, i) => (
              <div key={movie.id} className={`w-32 md:w-40 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl ${i === 1 ? 'translate-y-4' : ''}`}>
                <img src={getImageUrl(movie.poster_path)} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular TV Series */}
      <section className="space-y-6">
        <div className="px-6 flex justify-between items-center">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Popular TV Series</h3>
          <button className="text-on-surface-variant hover:text-electric-indigo transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div 
          {...tvSeriesScroll}
          className="flex gap-4 px-6 overflow-x-auto hide-scrollbar pb-4 select-none"
        >
          {popularTV.slice(0, 10).map((tv, i) => (
            <Link key={`tv-${tv.id}-${i}`} to={`/tv/${tv.id}`} className="flex-none w-40 md:w-48 group">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-electric-indigo/10">
                <img
                  src={getImageUrl(tv.poster_path)}
                  alt={tv.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <h4 className="font-headline font-bold text-sm truncate group-hover:text-electric-indigo transition-colors">{tv.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  {tv.first_air_date?.split('-')[0]}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <div className="flex items-center gap-0.5 text-yellow-500">
                  <Star className="w-2.5 h-2.5 fill-current" />
                  <span className="text-[10px] font-bold">{tv.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Grid */}
      <section className="px-6 space-y-6 pb-12">
        <div className="flex items-center justify-between">
          <h3 className="font-headline text-2xl font-bold tracking-tight">Popular Right Now</h3>
          <button className="text-on-surface-variant hover:text-electric-indigo transition-colors">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {popular.slice(0, 10).map((movie, i) => (
            <Link key={`popular-${movie.id}-${i}`} to={`/movie/${movie.id}`} className="group">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden mb-4 shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-electric-indigo/10">
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <h4 className="font-headline font-bold text-sm truncate group-hover:text-electric-indigo transition-colors">{movie.title}</h4>
              <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest mt-1">
                {movie.release_date?.split('-')[0]}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
