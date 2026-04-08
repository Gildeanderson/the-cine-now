import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ChevronLeft, Star, Play, User as UserIcon, Heart } from 'lucide-react';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { useDraggableScroll } from '../hooks/useDraggableScroll';

export default function PersonDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, toggleFollowActor } = useAuth();
  const [person, setPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFollowing = id ? profile?.followingActors?.includes(id) : false;
  const movieScroll = useDraggableScroll();
  const tvScroll = useDraggableScroll();

  useEffect(() => {
    const loadPerson = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await tmdbService.getPersonDetails(id);
        setPerson(data);
      } catch (err) {
        console.error('Failed to load person details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load person details');
      } finally {
        setLoading(false);
      }
    };
    loadPerson();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-electric-indigo border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center space-y-4">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <UserIcon className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold">Actor not found</h2>
        <p className="text-on-surface-variant max-w-md">{error || 'Could not find details for this person.'}</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-surface-high text-on-surface font-bold rounded-full"
        >
          Go Back
        </button>
      </div>
    );
  }

  const movieCredits = person?.combined_credits?.cast
    ?.filter((item: any) => item.media_type === 'movie')
    ?.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
    ?.slice(0, 40) || [];

  const tvCredits = person?.combined_credits?.cast
    ?.filter((item: any) => item.media_type === 'tv')
    ?.sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
    ?.slice(0, 40) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pb-20 atmosphere min-h-screen"
    >
      {/* Header Section */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={getImageUrl(person.combined_credits?.cast?.[0]?.backdrop_path, 'original')}
            alt="Background"
            className="w-full h-full object-cover opacity-20 blur-sm"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-obsidian/20 via-obsidian to-obsidian" />
        </div>
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-20 left-6 p-3 rounded-full bg-obsidian/40 backdrop-blur-xl text-on-surface hover:bg-white/10 active:scale-95 transition-all z-50 border border-white/5"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="absolute inset-x-0 bottom-0 pb-12 px-8 md:px-16 flex flex-col md:flex-row items-end gap-8 z-20">
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-48 h-72 md:w-64 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white/5 flex-shrink-0"
          >
            <img 
              src={getImageUrl(person.profile_path, 'original')} 
              alt={person.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>

          <div className="flex-1 space-y-6 pb-4">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-6xl font-display font-black tracking-tighter uppercase leading-none mb-2">
                {person.name}
              </h1>
              <p className="text-electric-indigo font-bold text-sm uppercase tracking-[0.2em]">
                {person.known_for_department}
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button 
                onClick={() => {
                  if (!profile) {
                    navigate('/login');
                    return;
                  }
                  id && toggleFollowActor(id);
                }}
                className={cn(
                  "px-8 py-3 rounded-full font-bold text-sm flex items-center gap-2 transition-all active:scale-95",
                  isFollowing 
                    ? "bg-red-500 text-white" 
                    : "bg-electric-indigo text-obsidian hover:bg-electric-indigo/90"
                )}
              >
                <Heart className={cn("w-4 h-4", isFollowing && "fill-current")} />
                {isFollowing ? 'Following' : 'Follow Actor'}
              </button>
              
              <div className="flex items-center gap-6 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Popularity</p>
                  <p className="text-lg font-black text-white">{person.popularity?.toFixed(0)}</p>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Place of Birth</p>
                  <p className="text-sm font-bold text-white truncate max-w-[150px]">{person.place_of_birth || 'N/A'}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Biography & Credits */}
      <section className="px-8 md:px-16 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-16">
          <div className="space-y-4">
            <h3 className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest opacity-40">Biography</h3>
            <p className="text-lg font-medium leading-relaxed text-on-surface/80">
              {person.biography || `No biography available for ${person.name}.`}
            </p>
          </div>

          {/* Movies Section */}
          {movieCredits.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-baseline justify-between">
                <h3 className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest opacity-40">Movies</h3>
              </div>
              <div 
                {...movieScroll}
                className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar select-none"
              >
                {movieCredits.map((item: any) => (
                  <div 
                    key={item.credit_id || `movie-${item.id}`} 
                    className="min-w-[200px] group cursor-pointer" 
                    onClick={() => navigate(`/movie/${item.id}`)}
                  >
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-4 relative shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-electric-indigo/20">
                      <img 
                        src={getImageUrl(item.poster_path)} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-headline font-bold text-sm mb-1 truncate group-hover:text-electric-indigo transition-colors">
                      {item.title}
                    </h4>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest truncate">
                      {item.character}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TV Shows Section */}
          {tvCredits.length > 0 && (
            <div className="space-y-8">
              <div className="flex items-baseline justify-between">
                <h3 className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest opacity-40">TV Shows</h3>
              </div>
              <div 
                {...tvScroll}
                className="flex gap-6 overflow-x-auto pb-8 hide-scrollbar select-none"
              >
                {tvCredits.map((item: any) => (
                  <div 
                    key={item.credit_id || `tv-${item.id}`} 
                    className="min-w-[200px] group cursor-pointer" 
                    onClick={() => navigate(`/tv/${item.id}`)}
                  >
                    <div className="aspect-[2/3] rounded-2xl overflow-hidden mb-4 relative shadow-xl transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-electric-indigo/20">
                      <img 
                        src={getImageUrl(item.poster_path)} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        referrerPolicy="no-referrer" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full glass flex items-center justify-center">
                          <Play className="w-5 h-5 text-white fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h4 className="font-headline font-bold text-sm mb-1 truncate group-hover:text-electric-indigo transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest truncate">
                      {item.character}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-surface-high/40 backdrop-blur-xl rounded-3xl p-8 space-y-8 border border-white/5">
            <h3 className="text-electric-indigo font-bold text-[10px] uppercase tracking-widest opacity-40">Personal Info</h3>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Birthday</p>
                <p className="font-bold text-lg">{person.birthday || 'N/A'}</p>
              </div>
              {person.deathday && (
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Day of Death</p>
                  <p className="font-bold text-lg">{person.deathday}</p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Gender</p>
                <p className="font-bold text-lg">{person.gender === 1 ? 'Female' : person.gender === 2 ? 'Male' : 'N/A'}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-1">Also Known As</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {person.also_known_as?.slice(0, 5).map((name: string) => (
                    <span key={name} className="px-2 py-1 rounded-md bg-white/5 text-[10px] font-medium text-zinc-400 border border-white/5">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
