import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Play, Trash2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { useAuth } from '../context/AuthContext';

export default function MyListPage() {
  const { profile, toggleSave } = useAuth();
  const [myList, setMyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMyList = async () => {
      if (!profile?.saved || profile.saved.length === 0) {
        setMyList([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const contentPromises = profile.saved.map(async (id) => {
          try {
            const movie = await tmdbService.getMovieDetails(id);
            return { ...movie, media_type: 'movie' };
          } catch (e) {
            try {
              const tv = await tmdbService.getTVDetails(id);
              return { ...tv, media_type: 'tv' };
            } catch (e2) {
              console.error(`Failed to load content with ID ${id}:`, e2);
              return null;
            }
          }
        });
        const results = await Promise.all(contentPromises);
        setMyList(results.filter(item => item !== null));
      } catch (error) {
        console.error('Failed to load my list:', error);
      } finally {
        setLoading(false);
      }
    };
    loadMyList();
  }, [profile?.saved]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-electric-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-8 md:px-16 space-y-12 atmosphere min-h-screen pb-20"
    >
      <header className="pt-8 space-y-2">
        <div className="flex items-center gap-3 text-electric-indigo">
          <Bookmark className="w-6 h-6 fill-current" />
          <h1 className="font-headline text-4xl md:text-6xl font-bold tracking-tight">My List</h1>
        </div>
        <p className="text-on-surface-variant font-medium uppercase tracking-widest text-[10px]">
          {myList.length} Movies Saved
        </p>
      </header>

      <AnimatePresence mode="popLayout">
        {myList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {myList.map((movie) => (
              <motion.div
                layout
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group relative bg-surface-low/40 backdrop-blur-xl rounded-[2rem] overflow-hidden border border-white/5 flex flex-col sm:flex-row"
              >
                <div className="relative w-full sm:w-48 aspect-[2/3] sm:aspect-auto overflow-hidden">
                  <img
                    src={getImageUrl(movie.poster_path)}
                    alt={movie.title || movie.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-yellow-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold">{movie.vote_average?.toFixed(1)}</span>
                      </div>
                      <button 
                        onClick={() => toggleSave(movie.id.toString())}
                        className="p-2 rounded-full hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-headline font-bold text-xl group-hover:text-electric-indigo transition-colors line-clamp-1">
                      {movie.title || movie.name}
                    </h3>
                    <p className="text-sm text-on-surface-variant line-clamp-2 font-medium">
                      {movie.overview}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Link
                      to={`/${movie.media_type || 'movie'}/${movie.id}`}
                      className="flex-1 px-6 py-3 rounded-xl bg-electric-indigo text-obsidian font-bold text-sm flex items-center justify-center gap-2 hover:bg-electric-indigo/90 transition-all active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Watch Now
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 text-center glass rounded-[2rem] space-y-6"
          >
            <div className="w-20 h-20 rounded-full bg-surface-high flex items-center justify-center mx-auto text-on-surface-variant/20">
              <Bookmark className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Your list is empty</h3>
              <p className="text-on-surface-variant max-w-xs mx-auto">
                Start adding movies to your list to keep track of what you want to watch.
              </p>
            </div>
            <Link
              to="/"
              className="inline-block px-8 py-3 rounded-full bg-on-surface text-obsidian font-bold hover:scale-105 transition-transform"
            >
              Explore Movies
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
