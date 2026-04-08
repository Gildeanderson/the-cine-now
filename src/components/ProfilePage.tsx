import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Edit2, Moon, Bell, User, Download, Globe, LogOut, ChevronRight, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [followedActors, setFollowedActors] = useState<any[]>([]);
  const [loadingActors, setLoadingActors] = useState(false);

  useEffect(() => {
    const fetchFollowedActors = async () => {
      if (!profile?.followingActors || profile.followingActors.length === 0) {
        setFollowedActors([]);
        return;
      }

      setLoadingActors(true);
      try {
        const actorPromises = profile.followingActors.map(id => tmdbService.getPersonDetails(id));
        const actors = await Promise.all(actorPromises);
        setFollowedActors(actors);
      } catch (error) {
        console.error('Failed to fetch followed actors:', error);
      } finally {
        setLoadingActors(false);
      }
    };

    fetchFollowedActors();
  }, [profile?.followingActors]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-6 max-w-2xl mx-auto space-y-12 pb-20"
    >
      {/* Profile Header */}
      <section className="flex flex-col items-center text-center space-y-4 mt-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface-highest shadow-2xl bg-zinc-800 flex items-center justify-center">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'User Profile'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-16 h-16 text-zinc-600" />
            )}
          </div>
          <button className="absolute bottom-0 right-0 bg-electric-indigo p-2 rounded-full text-obsidian shadow-lg hover:scale-110 transition-transform">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-headline tracking-tight">
            {user?.displayName || 'Usuário'}
          </h1>
          <p className="text-on-surface-variant">{user?.email}</p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-low p-6 rounded-xl border border-outline-variant/10">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Membership</p>
          <p className="text-electric-indigo font-headline font-bold text-lg">Premium Ultra</p>
        </div>
        <div className="bg-surface-low p-6 rounded-xl border border-outline-variant/10">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Following</p>
          <p className="font-headline font-bold text-lg">{profile?.followingActors?.length || 0} Actors</p>
        </div>
      </div>

      {/* Followed Actors Section */}
      <div className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-electric-indigo px-2">Followed Actors</h2>
        <div className="bg-surface-low rounded-2xl p-4 border border-outline-variant/10">
          {loadingActors ? (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-electric-indigo border-t-transparent rounded-full animate-spin" />
            </div>
          ) : followedActors.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {followedActors.map((actor) => (
                <div 
                  key={actor.id} 
                  onClick={() => navigate(`/person/${actor.id}`)}
                  className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group"
                >
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/5 group-hover:border-electric-indigo transition-colors">
                    <img 
                      src={getImageUrl(actor.profile_path)} 
                      alt={actor.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-center truncate w-full group-hover:text-electric-indigo transition-colors">
                    {actor.name.split(' ')[0]}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
              <Users className="w-8 h-8 text-zinc-700" />
              <p className="text-xs text-zinc-500 font-medium tracking-wide">Você ainda não segue nenhum ator.</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-electric-indigo px-2">App Preferences</h2>
          <div className="bg-surface-low rounded-2xl overflow-hidden divide-y divide-outline-variant/5">
            <ToggleItem icon={<Moon />} title="Dark Mode" description="Switch between appearance modes" checked />
            <ToggleItem icon={<Bell />} title="Push Notifications" description="Stay updated on new releases" checked />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-electric-indigo px-2">Account Management</h2>
          <div className="bg-surface-low rounded-2xl overflow-hidden divide-y divide-outline-variant/5">
            <SettingItem icon={<User />} title="Account Details" />
            <SettingItem icon={<Download />} title="Downloads" />
            <SettingItem icon={<Globe />} title="Language" badge="EN" />
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 hover:bg-red-500/20 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold tracking-tight">Sign Out</span>
        </button>
        
        <p className="text-center text-[10px] text-on-surface-variant/40 tracking-widest font-medium">
          THE CINE NOW VERSION 2.5.0
        </p>
      </div>
    </motion.div>
  );
}

function ToggleItem({ icon, title, description, checked }: { icon: React.ReactNode; title: string; description: string; checked?: boolean }) {
  return (
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-high text-on-surface">
          {icon}
        </div>
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-xs text-on-surface-variant">{description}</p>
        </div>
      </div>
      <div className={cn("w-11 h-6 rounded-full relative transition-colors", checked ? "bg-electric-indigo" : "bg-surface-highest")}>
        <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", checked && "translate-x-5")} />
      </div>
    </div>
  );
}

function SettingItem({ icon, title, badge }: { icon: React.ReactNode; title: string; badge?: string }) {
  return (
    <button className="w-full flex items-center justify-between p-5 hover:bg-surface-high transition-colors text-left group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-high text-on-surface group-hover:text-electric-indigo transition-colors">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          {badge && <span className="text-[10px] bg-surface-highest px-2 py-0.5 rounded-full text-on-surface-variant">{badge}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-on-surface-variant" />
    </button>
  );
}
