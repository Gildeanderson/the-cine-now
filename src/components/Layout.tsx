import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, Search, Bookmark, User, Bell, Film, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const { user } = useAuth();

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
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between transition-all duration-500",
        scrolled ? "bg-obsidian/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      )}>
        <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
          <Film className="w-5 h-5 text-electric-indigo/70 group-hover:text-electric-indigo transition-colors" />
          <h1 className="font-display text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-electric-indigo uppercase drop-shadow-[0_0_10px_rgba(163,166,255,0.3)]">
            The Cine Now
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/search')}
            className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-95 text-on-surface-variant/60 hover:text-on-surface"
          >
            <Search className="w-5 h-5" />
          </button>
          
          {user ? (
            <button className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-95 text-on-surface-variant/60 hover:text-on-surface">
              <Bell className="w-5 h-5" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-1.5 rounded-full bg-electric-indigo text-obsidian text-xs font-bold hover:bg-electric-indigo/90 transition-all active:scale-95"
            >
              Entrar
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-obsidian/80 backdrop-blur-xl border-t border-white/5 h-16 px-4 flex justify-around items-center">
        <NavItem to="/" icon={<Home />} label="Home" />
        <NavItem to="/foryou" icon={<Sparkles />} label="Para Você" />
        <NavItem to="/search" icon={<Search />} label="Search" />
        <NavItem to="/mylist" icon={<Bookmark />} label="My List" />
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
          label="Profile" 
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
