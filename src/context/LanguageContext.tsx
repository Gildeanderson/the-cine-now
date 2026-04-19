import React, { createContext, useContext, useState, useEffect } from 'react';
import { tmdbService } from '../services/tmdbService';

export type Language = 'en' | 'pt-BR';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Record<Language, string>> = {
  // Navigation
  'nav.home': { en: 'Home', 'pt-BR': 'Início' },
  'nav.foryou': { en: 'For You', 'pt-BR': 'Para Você' },
  'nav.search': { en: 'Search', 'pt-BR': 'Buscar' },
  'nav.mylist': { en: 'My List', 'pt-BR': 'Minha Lista' },
  'nav.profile': { en: 'Profile', 'pt-BR': 'Perfil' },

  // Profile Settings
  'profile.title': { en: 'Profile', 'pt-BR': 'Perfil' },
  'profile.following': { en: 'Following', 'pt-BR': 'Seguindo' },
  'profile.actors': { en: 'Actors', 'pt-BR': 'Atores' },
  'profile.noActors': { en: 'You are not following any actors yet.', 'pt-BR': 'Você ainda não segue nenhum ator.' },
  
  'profile.prefs': { en: 'App Preferences', 'pt-BR': 'Preferências do App' },
  'profile.darkmode': { en: 'Dark Mode', 'pt-BR': 'Modo Escuro' },
  'profile.darkmode.desc': { en: 'Switch between appearance modes', 'pt-BR': 'Alterne o visual do aplicativo' },
  'profile.push': { en: 'Push Notifications', 'pt-BR': 'Notificações Push' },
  'profile.push.desc': { en: 'Stay updated on new releases', 'pt-BR': 'Receba alertas de lançamentos' },
  'profile.sim.title': { en: 'Notification Simulation', 'pt-BR': 'Simulação de Notificações' },
  'profile.sim.new': { en: 'Simulate New Movie', 'pt-BR': 'Simular Novo Filme' },
  'profile.sim.actor': { en: 'Simulate Favorite Actor', 'pt-BR': 'Simular Ator Favorito' },

  'profile.account': { en: 'Account Management', 'pt-BR': 'Gerenciamento de Conta' },
  'profile.details': { en: 'Account Details', 'pt-BR': 'Detalhes da Conta' },
  'profile.downloads': { en: 'Downloads', 'pt-BR': 'Downloads' },
  'profile.language': { en: 'Language', 'pt-BR': 'Idioma' },
  'profile.signout': { en: 'Sign Out', 'pt-BR': 'Sair' },

  // Home & general 
  'home.popular': { en: 'Popular Right Now', 'pt-BR': 'Populares Agora' },
  'home.trending': { en: 'Trending This Week', 'pt-BR': 'Em Alta Esta Semana' },
  'home.movies': { en: 'Movies', 'pt-BR': 'Filmes' },
  'home.tv shows': { en: 'TV Shows', 'pt-BR': 'Séries de TV' },
  'home.continue': { en: 'Continue Watching', 'pt-BR': 'Continue Assistindo' },

  // Search
  'search.placeholder': { en: 'Search movies, actors...', 'pt-BR': 'Busque filmes, atores...' },
  'search.cancel': { en: 'Cancel', 'pt-BR': 'Cancelar' },
  'search.genre': { en: 'Browse by Genre', 'pt-BR': 'Navegar por Gênero' },
  'search.recent': { en: 'Recent Searches', 'pt-BR': 'Buscas Recentes' },
  'search.clear': { en: 'Clear All', 'pt-BR': 'Limpar' },
  'search.results': { en: 'Search Results', 'pt-BR': 'Resultados da Busca' },
  'search.recommended': { en: 'Recommended', 'pt-BR': 'Recomendados' },
  'search.noresults': { en: 'No results found', 'pt-BR': 'Nenhum resultado encontrado' },

  // Details
  'details.trailer': { en: 'Watch Trailer', 'pt-BR': 'Assistir Trailer' },
  'details.mylist': { en: 'My List', 'pt-BR': 'Minha Lista' },
  'details.share': { en: 'Share', 'pt-BR': 'Compartilhar' },
  'details.cast': { en: 'Top Cast', 'pt-BR': 'Elenco Principal' },
  'details.credits': { en: 'Credits', 'pt-BR': 'Equipe' },
  'details.direction': { en: 'Direction', 'pt-BR': 'Direção' },
  'details.writing': { en: 'Writing', 'pt-BR': 'Roteiro' },
  'details.similar': { en: 'Similar Titles', 'pt-BR': 'Títulos Similares' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('appLanguage') as Language) || 'pt-BR';
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    // Atualiza o default limit no serviço TMDB também
    tmdbService.setLanguage(language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState(prev => prev === 'en' ? 'pt-BR' : 'en');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language] || key;
    }
    return key; // Retorna a chave se não encontrar tradução (ajuda a debugar)
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
