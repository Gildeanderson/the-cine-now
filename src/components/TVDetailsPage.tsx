import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Film, Star, ChevronLeft, Heart, Bookmark } from 'lucide-react';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import VideoPlayer from './VideoPlayer';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

export default function TVDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, toggleLike, toggleSave, addToContinueWatching } = useAuth();
  const [show, setShow] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const isLiked = id ? profile?.likes?.includes(id) : false;
  const isSaved = id ? profile?.saved?.includes(id) : false;

  const similarScroll = useDraggableScroll();

  useEffect(() => {
    const loadShow = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await tmdbService.getTVDetails(id);
        
        // If no videos in Portuguese, try English
        if (!data.videos?.results || data.videos.results.length === 0) {
          try {
            const enData = await tmdbService.getTVDetails(id, 'en-US');
            if (enData.videos?.results && enData.videos.results.length > 0) {
              data.videos = enData.videos;
            }
          } catch (e) {
            console.error('Failed to load English videos:', e);
          }
        }
        
        setShow(data);
      } catch (err) {
        console.error('Failed to load TV show details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load TV show details');
      } finally {
        setLoading(false);
      }
    };
    loadShow();
  }, [id]);

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
          <Film className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">Show not found</h2>
        <p className="text-on-surface-variant max-w-md">{error}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-surface-high text-on-surface font-bold rounded-full"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!show) return null;

  const cast = show.credits?.cast?.slice(0, 5) || [];
  const similar = show.similar?.results?.slice(0, 8) || [];
  const trailer = show.videos?.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || show.videos?.results?.[0];

  const handlePlay = () => {
    if (trailer) {
      if (show) {
        addToContinueWatching(show.id.toString());
      }
      setShowPlayer(true);
    } else {
      alert('Trailer not available for this show.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20 atmosphere min-h-screen"
    >
      <AnimatePresence>
        {showPlayer && trailer && show && (
          <VideoPlayer 
            key={`tv-trailer-${show.id}`}
            videoKey={trailer.key} 
            title={show.name} 
            onClose={() => setShowPlayer(false)} 
          />
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={getImageUrl(show.backdrop_path, 'original')}
          alt={show.name}
          className="w-full h-full object-cover opacity-60"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 scrim-bottom" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/40 to-transparent" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-6 p-3 rounded-full bg-obsidian/40 backdrop-blur-xl text-on-surface hover:bg-white/10 active:scale-95 transition-all z-50 border border-white/5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="absolute top-16 inset-x-0 bottom-0 pb-12 px-8 md:px-16 flex flex-col justify-center w-full space-y-6 z-20">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-5xl lg:text-6xl font-display font-black tracking-tighter leading-tight max-w-5xl uppercase drop-shadow-2xl break-words"
          >
            {show.name}
          </motion.h1>

          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            <button 
              onClick={handlePlay}
              className="px-8 py-4 rounded-full bg-electric-indigo text-obsidian font-bold text-base flex items-center justify-center gap-2 hover:bg-electric-indigo/90 active:scale-95 transition-all shadow-xl shadow-electric-indigo/10"
            >
              <Play className="w-5 h-5 fill-current" />
              Watch Now
            </button>
            <button 
              onClick={handlePlay}
              className="px-8 py-4 rounded-full bg-surface-high/40 backdrop-blur-xl text-on-surface font-bold text-base flex items-center justify-center gap-2 hover:bg-white/10 active:scale-95 transition-all border border-white/5"
            >
              <Film className="w-5 h-5" />
              Trailer
            </button>
            <button 
              onClick={() => {
                if (!profile) {
                  navigate('/login');
                  return;
                }
                id && toggleLike(id);
              }}
              className={cn(
                "p-4 rounded-full backdrop-blur-xl transition-all border border-white/5 active:scale-95",
                isLiked ? "bg-red-500 text-white" : "bg-surface-high/40 text-on-surface hover:bg-white/10"
              )}
            >
              <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
            </button>
            <button 
              onClick={() => {
                if (!profile) {
                  navigate('/login');
                  return;
                }
                id && toggleSave(id);
              }}
              className={cn(
                "p-4 rounded-full backdrop-blur-xl transition-all border border-white/5 active:scale-95",
                isSaved ? "bg-electric-indigo text-obsidian" : "bg-surface-high/40 text-on-surface hover:bg-white/10"
              )}
            >
              <Bookmark className={cn("w-6 h-6", isSaved && "fill-current")} />
            </button>

            <div className="flex items-center gap-2 text-electric-indigo font-bold text-[10px] uppercase tracking-widest">
              <span className="px-2 py-0.5 rounded bg-electric-indigo/10 border border-electric-indigo/20">
                {show.genres?.[0]?.name || 'TV Series'}
              </span>
              <span>{show.number_of_seasons} Seasons</span>
            </div>
            <div className="flex items-center gap-1 text-yellow-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-sm font-bold">{show.vote_average?.toFixed(1)}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="px-8 md:px-16 -mt-24 relative z-30 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column: Synopsis & Cast */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-4">
            <h3 className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest opacity-40">Synopsis</h3>
            <p className="text-lg md:text-xl font-medium leading-relaxed text-on-surface/80 max-w-3xl">
              {show.overview}
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest opacity-40">Top Cast</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cast.map((person: any) => (
                <div 
                  key={person.id} 
                  onClick={() => navigate(`/person/${person.id}`)}
                  className="flex items-center gap-4 p-3 rounded-xl bg-surface-high/40 backdrop-blur-md hover:bg-white/5 transition-colors group border border-white/5 cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 group-hover:border-electric-indigo/30 transition-colors">
                    <img src={getImageUrl(person.profile_path)} alt={person.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div>
                    <p className="font-headline font-bold text-base">{person.name}</p>
                    <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Stats */}
        <div className="space-y-6">
          <div className="bg-surface-high/40 backdrop-blur-xl rounded-[2rem] p-8 space-y-8 border border-white/5">
            <div className="space-y-6">
              <h3 className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest opacity-40">Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">First Air Date</p>
                  <p className="font-headline font-bold text-lg">{show.first_air_date}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                  <p className="font-headline font-bold text-lg">{show.status}</p>
                </div>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">Networks</p>
                  <p className="font-headline font-bold text-lg">{show.networks?.map((n: any) => n.name).join(', ')}</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-3">
              <h3 className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest opacity-40">User Rating</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-headline font-bold tracking-tight">{show.vote_average?.toFixed(1)}</span>
                <span className="text-on-surface-variant font-bold text-lg">/ 10</span>
              </div>
              <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest">
                Based on {show.vote_count?.toLocaleString()} reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Shows */}
      <section className="mt-20 space-y-8">
        <div className="px-8 md:px-16 flex items-baseline justify-between">
          <h2 className="text-2xl font-headline font-bold tracking-tight uppercase">Similar Shows</h2>
          <button className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors">
            See All
          </button>
        </div>
        <div 
          {...similarScroll}
          className="flex gap-8 overflow-x-auto px-8 md:px-16 pb-12 hide-scrollbar select-none"
        >
          {similar.map((s: any) => (
            <div 
              key={s.id} 
              className="min-w-[280px] group cursor-pointer" 
              onClick={() => navigate(`/tv/${s.id}`)}
            >
              <div className="aspect-[2/3] rounded-3xl overflow-hidden mb-6 relative shadow-2xl transition-all duration-500 group-hover:-translate-y-3 group-hover:shadow-electric-indigo/20">
                <img 
                  src={getImageUrl(s.poster_path)} 
                  alt={s.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full glass flex items-center justify-center">
                    <Play className="w-7 h-7 text-white fill-current ml-1" />
                  </div>
                </div>
              </div>
              <h4 className="font-headline font-bold text-xl mb-2 truncate group-hover:text-electric-indigo transition-colors">{s.name}</h4>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  {s.first_air_date?.split('-')[0]}
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-bold">{s.vote_average?.toFixed(1)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </motion.div>
  );
}
