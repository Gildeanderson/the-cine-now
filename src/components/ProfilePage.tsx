import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Edit2, Moon, Bell, User, Download, Globe, LogOut, ChevronRight, Users, X, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notificationService';
import { useLanguage, Language } from '../context/LanguageContext';

export default function ProfilePage() {
  const { user, profile, logout, toggleNotifications } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [followedActors, setFollowedActors] = useState<any[]>([]);
  const [loadingActors, setLoadingActors] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const handleToggleNotifications = async () => {
    const isEnabled = !profile?.notificationsEnabled;
    
    if (isEnabled) {
      const granted = await notificationService.requestPermission();
      if (!granted) {
        alert(t('profile.push.desc'));
        return;
      }
      // Confirmação visual imediata
      notificationService.notifyEnabled();
    }
    
    await toggleNotifications(isEnabled);
  };

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
  }, [profile?.followingActors?.join(',')]);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setShowLanguageModal(false);
  };

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
            {user?.displayName || t('auth.name_placeholder')}
          </h1>
          <p className="text-on-surface-variant">{user?.email}</p>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-low p-6 rounded-xl border border-outline-variant/10">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{t('profile.membership')}</p>
          <p className="text-electric-indigo font-headline font-bold text-lg">Premium Ultra</p>
        </div>
        <div className="bg-surface-low p-6 rounded-xl border border-outline-variant/10">
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">{t('profile.following')}</p>
          <p className="font-headline font-bold text-lg">{profile?.followingActors?.length || 0} {t('profile.actors')}</p>
        </div>
      </div>

      {/* Followed Actors Section */}
      <div className="space-y-4">
        <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-electric-indigo px-2">
          {t('profile.following')} {t('profile.actors')}
        </h2>
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
              <p className="text-xs text-zinc-500 font-medium tracking-wide">{t('profile.noActors')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-8">
        <div className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-electric-indigo px-2">{t('profile.prefs')}</h2>
          <div className="bg-surface-low rounded-2xl overflow-hidden divide-y divide-outline-variant/5">
            <ToggleItem 
              icon={<Moon />} 
              title={t('profile.darkmode')} 
              description={t('profile.darkmode.desc')} 
              checked={theme === 'dark'} 
              onToggle={toggleTheme}
            />
            <ToggleItem 
              icon={<Bell />} 
              title={t('profile.push')} 
              description={t('profile.push.desc')} 
              checked={profile?.notificationsEnabled} 
              onToggle={handleToggleNotifications}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-[11px] uppercase tracking-[0.2em] font-bold text-electric-indigo px-2">{t('profile.account')}</h2>
          <div className="bg-surface-low rounded-2xl overflow-hidden divide-y divide-outline-variant/5">
            <SettingItem 
              icon={<User />} 
              title={t('profile.details')} 
              onClick={() => navigate('/profile/details')}
            />
            <SettingItem icon={<Download />} title={t('profile.downloads')} />
            <SettingItem 
              icon={<Globe />} 
              title={t('profile.language')} 
              badge={language === 'pt-BR' ? 'PT-BR' : 'EN'} 
              onClick={() => setShowLanguageModal(true)}
            />
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 p-5 bg-surface-low border border-outline-variant/10 rounded-2xl text-on-surface hover:bg-surface-high transition-all active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-bold tracking-tight">{t('profile.signout')}</span>
        </button>

        <p className="text-center text-[10px] text-on-surface-variant/40 tracking-widest font-medium">
          THE CINE NOW VERSION 2.5.0
        </p>
      </div>

      {/* Language Modal */}
      <AnimatePresence>
        {showLanguageModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLanguageModal(false)}
              className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-surface-low rounded-[2rem] border border-outline-variant/10 overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-outline-variant/5 flex items-center justify-between bg-surface-high/50">
                <h3 className="font-headline font-bold text-lg">{t('profile.language.select')}</h3>
                <button 
                  onClick={() => setShowLanguageModal(false)}
                  className="p-2 rounded-full hover:bg-surface-highest transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2">
                <LanguageOption 
                  label={t('profile.language.pt')} 
                  code="pt-BR" 
                  active={language === 'pt-BR'} 
                  onClick={() => handleLanguageSelect('pt-BR')} 
                />
                <LanguageOption 
                  label={t('profile.language.en')} 
                  code="en" 
                  active={language === 'en'} 
                  onClick={() => handleLanguageSelect('en')} 
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LanguageOption({ label, code, active, onClick }: { label: string; code: string; active: boolean; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between p-4 rounded-2xl transition-all mb-1 last:mb-0",
        active ? "bg-electric-indigo/10 text-electric-indigo" : "hover:bg-surface-high text-on-surface-variant"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase tracking-widest",
          active ? "bg-electric-indigo text-obsidian" : "bg-surface-highest text-on-surface-variant"
        )}>
          {code.split('-')[0]}
        </div>
        <span className="font-bold">{label}</span>
      </div>
      {active && <Check className="w-5 h-5" />}
    </button>
  );
}

function ToggleItem({ icon, title, description, checked, onToggle }: { icon: React.ReactNode; title: string; description: string; checked?: boolean; onToggle?: () => void }) {
  return (
    <div className="flex items-center justify-between p-5">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-high text-on-surface">
          {icon}
        </div>
        <div>
          <p className="font-medium text-on-surface">{title}</p>
          <p className="text-xs text-on-surface-variant">{description}</p>
        </div>
      </div>
      <button 
        onClick={onToggle}
        className={cn("w-11 h-6 rounded-full relative transition-all duration-300", checked ? "bg-electric-indigo" : "bg-surface-highest")}
      >
        <div className={cn("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm", checked && "translate-x-5")} />
      </button>
    </div>
  );
}

function SettingItem({ icon, title, badge, onClick }: { icon: React.ReactNode; title: string; badge?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between p-5 hover:bg-surface-high transition-colors text-left group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface-high text-on-surface group-hover:text-electric-indigo transition-colors">
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <p className="font-medium">{title}</p>
          {badge && <span className="text-[10px] bg-electric-indigo/20 px-2 py-0.5 rounded-full text-electric-indigo font-bold tracking-widest">{badge}</span>}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-on-surface-variant" />
    </button>
  );
}
