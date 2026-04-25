import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Bookmark, User, Bell, Film, Sparkles, Menu, LogOut, Settings, Heart, Users, ChevronRight, Share2, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { NotificationCenter } from './NotificationCenter';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-on-surface">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-6">
        {/* Background Layer to prevent render bugs on blur transition */}
        <div 
          className={cn(
            "absolute inset-0 bg-obsidian/80 backdrop-blur-xl transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />
        
        <div className="relative z-10 flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <Film className="w-5 h-5 text-electric-indigo/70 group-hover:text-electric-indigo transition-colors" />
          <h1 className="font-display text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-electric-indigo uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            The Cine Now
          </h1>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <button 
            onClick={() => navigate('/search')}
            className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-95 text-on-surface-variant/60 hover:text-on-surface"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {user ? (
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={clsx(
                  "p-2 rounded-full transition-all active:scale-95",
                  isNotificationsOpen ? "bg-white/10 text-white" : "text-on-surface-variant/60 hover:text-on-surface hover:bg-white/5"
                )}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-surface animate-in zoom-in duration-300">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              <NotificationCenter 
                isOpen={isNotificationsOpen} 
                onClose={() => setIsNotificationsOpen(false)} 
              />
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 rounded-full bg-electric-indigo text-obsidian text-xs font-bold hover:bg-electric-indigo/90 transition-all active:scale-95"
            >
              {t('auth.login')}
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <Outlet />
        
        {/* Legal Footer */}
        <footer className="px-6 py-6 border-t border-white/5 bg-surface/30">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-[0.2em] font-bold">
                The Cine Now &copy; 2026
              </p>
              <p className="text-[10px] text-on-surface-variant/40 max-w-xs text-center md:text-left leading-relaxed">
                {t('footer.attribution')}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <NavLink 
                to="/privacy" 
                className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/60 hover:text-electric-indigo transition-colors"
              >
                {t('footer.privacy')}
              </NavLink>
              <div className="h-4 w-px bg-white/5" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant/40">{t('footer.status')}</span>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-xl h-16 px-4 flex justify-around items-center">
        <NavItem to="/" icon={<Home />} label={t('nav.home')} />
        <NavItem to="/foryou" icon={<Sparkles />} label={t('nav.foryou')} />
        <NavItem to="/search" icon={<Search />} label={t('nav.search')} />
        <NavItem to="/mylist" icon={<Bookmark />} label={t('nav.mylist')} />
        <NavItem 
          to="/profile" 
          icon={user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              className="w-6 h-6 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User />
          )} 
          label={t('nav.profile')} 
        />
      </nav>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center gap-1 transition-all duration-300",
          isActive ? "text-electric-indigo" : "text-on-surface-variant/60 hover:text-on-surface"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn("relative", isActive && "after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-electric-indigo after:rounded-full")}>
            {React.cloneElement(icon as React.ReactElement<any>, {
              className: cn("w-6 h-6", isActive && "fill-current")
            })}
          </div>
          <span className="text-[10px] uppercase font-medium tracking-wider">{label}</span>
        </>
      )}
    </NavLink>
  );
}
