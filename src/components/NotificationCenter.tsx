import React, { useRef, useEffect } from 'react';
import { Bell, Check, Film, User, Info, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAllNotificationsAsRead } = useAuth();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleNotificationClick = (link?: string) => {
    if (link) {
      navigate(link);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'movie': return <Film className="w-4 h-4 text-electric-indigo" />;
      case 'actor': return <User className="w-4 h-4 text-amber-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-full right-0 mt-2 w-80 sm:w-96 bg-obsidian-light border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-electric-indigo" />
          <h3 className="font-bold text-sm">Notificações</h3>
          {unreadCount > 0 && (
            <span className="bg-electric-indigo text-obsidian text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button 
              onClick={() => markAllNotificationsAsRead()}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-on-surface-variant hover:text-white"
              title="Marcar todas como lidas"
            >
              <Check className="w-4 h-4" />
            </button>
          )}
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-on-surface-variant hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-10 text-center">
            <Bell className="w-12 h-12 text-white/5 mx-auto mb-3" />
            <p className="text-on-surface-variant text-sm">Nenhuma notificação por aqui.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                onClick={() => handleNotificationClick(notification.link)}
                className={cn(
                  "p-4 hover:bg-white/5 transition-colors cursor-pointer group relative",
                  !notification.read && "bg-electric-indigo/5"
                )}
              >
                {!notification.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-electric-indigo" />
                )}
                <div className="flex gap-3">
                  <div className="mt-1 p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm mb-0.5 line-clamp-2",
                      notification.read ? "text-on-surface" : "text-white font-semibold"
                    )}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-on-surface-variant line-clamp-2 mb-2">
                      {notification.body}
                    </p>
                    <p className="text-[10px] text-on-surface-variant/60 uppercase font-bold tracking-wider">
                      {notification.createdAt?.toDate ? 
                        formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true, locale: ptBR }) : 
                        'Agora mesmo'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-white/5 border-t border-white/5 text-center">
          <button 
            onClick={() => {
              // Poderia levar para uma página completa de notificações
              onClose();
            }}
            className="text-xs font-bold text-electric-indigo hover:text-electric-indigo-light transition-colors"
          >
            Ver todas as notificações
          </button>
        </div>
      )}
    </div>
  );
};
