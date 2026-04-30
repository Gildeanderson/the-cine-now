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

  // Auth
  'auth.login': { en: 'Sign In', 'pt-BR': 'Entrar' },
  'auth.register': { en: 'Sign Up', 'pt-BR': 'Cadastrar' },
  'auth.logout': { en: 'Sign Out', 'pt-BR': 'Sair' },
  'auth.welcome': { en: 'Welcome Back', 'pt-BR': 'Bem-vindo de volta' },
  'auth.email': { en: 'Email', 'pt-BR': 'E-mail' },
  'auth.password': { en: 'Password', 'pt-BR': 'Senha' },
  'auth.fullname': { en: 'Full Name', 'pt-BR': 'Nome Completo' },
  'auth.name_placeholder': { en: 'Your name', 'pt-BR': 'Seu nome' },
  'auth.forgot': { en: 'Forgot password?', 'pt-BR': 'Esqueceu sua senha?' },
  'auth.signin_now': { en: 'Sign In Now', 'pt-BR': 'Entrar Agora' },
  'auth.register_now': { en: 'Create Account Now', 'pt-BR': 'Criar Conta Agora' },
  'auth.or_continue': { en: 'Or continue with', 'pt-BR': 'Ou continue com' },
  'auth.google_signin': { en: 'Sign in with Google', 'pt-BR': 'Entrar com Google' },
  'auth.no_account': { en: "Don't have an account?", 'pt-BR': 'Ainda não tem uma conta?' },
  'auth.have_account': { en: 'Already have an account?', 'pt-BR': 'Já tem uma conta?' },
  'auth.signin_link': { en: 'Sign in', 'pt-BR': 'Fazer login' },
  'auth.register_link': { en: 'Start your journey here', 'pt-BR': 'Comece sua jornada aqui' },
  'auth.register_title': { en: 'Create your free account today.', 'pt-BR': 'Crie sua conta gratuita hoje.' },
  'auth.back': { en: 'Back', 'pt-BR': 'Voltar' },
  'auth.dev': { en: 'System Developer', 'pt-BR': 'Desenvolvedor do Sistema' },
  'auth.agreement': { en: 'By creating an account, you agree to our', 'pt-BR': 'Ao criar uma conta, você concorda com nossos' },
  'auth.privacy_link': { en: 'Terms and Privacy', 'pt-BR': 'Termos e Privacidade' },
  
  // Validation
  'auth.valid.length': { en: 'Minimum 8 characters', 'pt-BR': 'Mínimo de 8 caracteres' },
  'auth.valid.upper': { en: 'At least one uppercase letter', 'pt-BR': 'Uma letra maiúscula' },
  'auth.valid.special': { en: 'At least one special character', 'pt-BR': 'Um caractere especial' },

  // Errors & Feedback
  'auth.error.credentials': { en: 'Incorrect email or password.', 'pt-BR': 'E-mail ou senha incorretos.' },
  'auth.error.google': { en: 'An error occurred with Google login.', 'pt-BR': 'Ocorreu um erro ao entrar com o Google.' },
  'auth.error.inuse': { en: 'This email is already in use.', 'pt-BR': 'Este e-mail já está em uso.' },
  'auth.error.generic': { en: 'An error occurred. Please try again.', 'pt-BR': 'Ocorreu um erro. Tente novamente.' },
  'auth.reset.success': { en: 'Reset email sent! Check your inbox.', 'pt-BR': 'E-mail de recuperação enviado! Verifique sua caixa.' },
  'auth.reset.prompt': { en: 'Please enter your email to reset.', 'pt-BR': 'Digite seu e-mail para resetar.' },

  // Profile Settings
  'profile.title': { en: 'Profile', 'pt-BR': 'Perfil' },
  'profile.membership': { en: 'Membership', 'pt-BR': 'Assinatura' },
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
  'profile.delete': { en: 'Delete My Account and Data', 'pt-BR': 'Excluir Minha Conta e Dados' },
  'profile.language.select': { en: 'Select Language', 'pt-BR': 'Selecionar Idioma' },
  'profile.language.en': { en: 'English', 'pt-BR': 'Inglês' },
  'profile.language.pt': { en: 'Portuguese', 'pt-BR': 'Português' },

  // Home & general 
  'home.popular': { en: 'Popular Right Now', 'pt-BR': 'Populares Agora' },
  'home.tv shows': { en: 'TV Shows', 'pt-BR': 'Séries de TV' },

  // Search
  'search.placeholder': { en: 'Search movies, actors...', 'pt-BR': 'Busque filmes, atores...' },
  'search.cancel': { en: 'Cancel', 'pt-BR': 'Cancelar' },
  'search.genre': { en: 'Browse by Genre', 'pt-BR': 'Navegar por Gênero' },
  'search.recent': { en: 'Recent Searches', 'pt-BR': 'Buscas Recentes' },
  'search.clear': { en: 'Clear All', 'pt-BR': 'Limpar' },
  'search.results': { en: 'Search Results', 'pt-BR': 'Resultados da Busca' },
  'search.recommended': { en: 'Recommended', 'pt-BR': 'Recomendados' },
  'search.noresults': { en: 'No results found', 'pt-BR': 'Nenhum resultado encontrado' },
  'search.noresults.desc': { en: 'Try different keywords or browse by genre.', 'pt-BR': 'Tente palavras-chave diferentes ou navegue por gênero.' },
  'search.retry': { en: 'Retry Search', 'pt-BR': 'Tentar novamente' },
  'search.smart_search': { en: 'AI Smart Search', 'pt-BR': 'Busca Inteligente com IA' },
  'search.smart_desc': { en: 'Our AI interpreted your request and found these titles:', 'pt-BR': 'Nossa IA interpretou seu pedido e encontrou estes títulos:' },
  'search.try_smart': { en: 'Try AI Smart Search', 'pt-BR': 'Tentar Busca Inteligente com IA' },
  'search.smart_loading': { en: 'AI is analyzing your request...', 'pt-BR': 'A IA está analisando seu pedido...' },

  // Details
  'details.trailer': { en: 'Watch Trailer', 'pt-BR': 'Assistir Trailer' },
  'details.mylist': { en: 'My List', 'pt-BR': 'Minha Lista' },
  'details.share': { en: 'Share', 'pt-BR': 'Compartilhar' },
  'details.cast': { en: 'Top Cast', 'pt-BR': 'Elenco Principal' },
  'details.credits': { en: 'Credits', 'pt-BR': 'Equipe' },
  'details.direction': { en: 'Direction', 'pt-BR': 'Direção' },
  'details.writing': { en: 'Writing', 'pt-BR': 'Roteiro' },
  'details.similar': { en: 'Similar Titles', 'pt-BR': 'Títulos Similares' },
  'details.synopsis': { en: 'Synopsis', 'pt-BR': 'Sinopse' },
  'details.info': { en: 'Information', 'pt-BR': 'Informações' },
  'details.release_date': { en: 'Release Date', 'pt-BR': 'Data de Lançamento' },
  'details.budget': { en: 'Budget', 'pt-BR': 'Orçamento' },
  'details.revenue': { en: 'Revenue', 'pt-BR': 'Receita' },
  'details.rating': { en: 'User Rating', 'pt-BR': 'Avaliação dos Usuários' },
  'details.reviews': { en: 'Based on', 'pt-BR': 'Baseado em' },
  'details.error.not_found': { en: 'Title not found', 'pt-BR': 'Título não encontrado' },
  'details.trailer.error': { en: 'Trailer not available at the moment.', 'pt-BR': 'Trailer não disponível no momento.' },
  'details.watch.error': { en: 'Movie not yet available for streaming.', 'pt-BR': 'Filme ainda não disponível para exibição.' },

  // Account Details
  'details.user_id': { en: 'User ID', 'pt-BR': 'ID de Usuário' },
  'details.provider': { en: 'Provider', 'pt-BR': 'Provedor' },
  'details.created_at': { en: 'Created At', 'pt-BR': 'Data de Criação' },
  'details.not_available': { en: 'Not available', 'pt-BR': 'Não disponível' },
  'details.security_msg': { 
    en: 'Your data is protected by end-to-end encryption and strict Firebase security rules.', 
    'pt-BR': 'Seus dados estão protegidos por criptografia e regras rígidas de segurança.' 
  },
  'details.danger_zone': { en: 'Danger Zone', 'pt-BR': 'Zona de Perigo' },
  'details.delete_warning': { 
    en: 'By deleting your account, you will lose immediate access to all your favorites and settings. This action is irreversible.', 
    'pt-BR': 'Ao excluir sua conta, você perderá acesso imediato aos seus favoritos e configurações. Esta ação é irreversível.' 
  },
  'details.delete_confirm': { en: 'Delete Everything Permanently', 'pt-BR': 'Excluir Tudo Permanentemente' },
  'details.confirm_alert': { 
    en: 'ARE YOU SURE? This will permanently delete your account and all data. This cannot be undone.', 
    'pt-BR': 'TEM CERTEZA? Isso excluirá permanentemente sua conta e todos os seus dados. Esta ação não pode ser desfeita.' 
  },
  'details.reauth_alert': { 
    en: 'For security, you must have logged in recently to delete your account. Please sign out and sign in again before trying.', 
    'pt-BR': 'Por segurança, você precisa ter feito login recentemente. Por favor, saia e entre novamente antes de tentar.' 
  },
  'details.delete_error': { en: 'Error deleting account. Try again later.', 'pt-BR': 'Erro ao excluir conta. Tente novamente mais tarde.' },

  // My List
  'mylist.title': { en: 'My List', 'pt-BR': 'Minha Lista' },
  'mylist.saved': { en: 'Titles Saved', 'pt-BR': 'Títulos Salvos' },
  'mylist.watch': { en: 'Watch Now', 'pt-BR': 'Assistir Agora' },
  'mylist.empty.title': { en: 'Your list is empty', 'pt-BR': 'Sua lista está vazia' },
  'mylist.empty.desc': { 
    en: 'Start adding movies to your list to keep track of what you want to watch.', 
    'pt-BR': 'Adicione filmes à sua lista para acompanhar o que deseja assistir.' 
  },
  'mylist.empty.explore': { en: 'Explore Movies', 'pt-BR': 'Explorar Filmes' },

  // Player
  'player.error.title': { en: 'Trailer Unavailable', 'pt-BR': 'Trailer Indisponível' },
  'player.error.desc': { 
    en: 'We could not locate the video for this title in the database.', 
    'pt-BR': 'Não conseguimos localizar o vídeo deste título no banco de dados.' 
  },
  'player.button.close': { en: 'Close Player', 'pt-BR': 'Fechar Player' },

  // AI
  'ai.title': { en: 'For You', 'pt-BR': 'Para Você' },
  'ai.activate': { en: 'Activate Artificial Intelligence', 'pt-BR': 'Ative a Inteligência Artificial' },
  'ai.activate.desc': { 
    en: 'To receive personalized recommendations, you need to configure your Gemini API key. It is fast and free for developers.', 
    'pt-BR': 'Para receber recomendações personalizadas, você precisa configurar sua chave de API do Gemini. É rápido e gratuito para desenvolvedores.' 
  },
  'ai.button.config': { en: 'Configure API Key', 'pt-BR': 'Configurar Chave API' },
  'ai.button.learn': { en: 'Learn More', 'pt-BR': 'Saiba Mais' },
  'ai.suggestion': { en: 'AI Suggestion', 'pt-BR': 'Sugestão da IA' },
  'ai.media.movie': { en: 'Movie', 'pt-BR': 'Filme' },
  'ai.media.tv': { en: 'TV Show', 'pt-BR': 'Série' },
  'ai.error': { 
    en: 'Could not load recommendations. Check your connection or try again later.', 
    'pt-BR': 'Não foi possível carregar as recomendações. Verifique sua conexão ou tente novamente mais tarde.' 
  },

  // Home
  'home.hero.watch': { en: 'Watch Now', 'pt-BR': 'Assistir Agora' },
  'home.hero.info': { en: 'More Info', 'pt-BR': 'Mais Informações' },
  'home.hero.trending': { en: 'Trending Now', 'pt-BR': 'Em Alta' },
  'home.hero.error': { en: 'Trailer not available for this movie.', 'pt-BR': 'Trailer não disponível para este filme.' },
  'home.continue': { en: 'Continue Watching', 'pt-BR': 'Continue Assistindo' },
  'home.trending': { en: 'Trending this Week', 'pt-BR': 'Tendências da Semana' },
  'home.popular_tv': { en: 'Popular TV Series', 'pt-BR': 'Séries Populares' },
  'home.popular_movies': { en: 'Successful Movies', 'pt-BR': 'Filmes de Sucesso' },
  'home.tv_highlights': { en: 'TV Highlights', 'pt-BR': 'Destaques na TV' },
  'home.collection.label': { en: 'Curated Collection', 'pt-BR': 'Coleção Curada' },
  'home.collection.title': { en: 'The Cyberpunk Anthology', 'pt-BR': 'A Antologia Cyberpunk' },
  'home.collection.desc': { 
    en: 'Dive into neon-lit futures, high-tech rebellions, and the blurred lines between man and machine.', 
    'pt-BR': 'Mergulhe em futuros iluminados por neon, rebeliões de alta tecnologia e a linha tênue entre homem e máquina.' 
  },
  'home.collection.button': { en: 'Explore Collection', 'pt-BR': 'Explorar Coleção' },
  'home.error.title': { en: 'Oops! Something went wrong', 'pt-BR': 'Ops! Algo deu errado' },
  'home.error.retry': { en: 'Try Again', 'pt-BR': 'Tentar Novamente' },

  // Person
  'person.following': { en: 'Following', 'pt-BR': 'Seguindo' },
  'person.follow': { en: 'Follow Actor', 'pt-BR': 'Seguir Ator' },
  'person.popularity': { en: 'Popularity', 'pt-BR': 'Popularidade' },
  'person.birthplace': { en: 'Place of Birth', 'pt-BR': 'Local de Nascimento' },
  'person.biography': { en: 'Biography', 'pt-BR': 'Biografia' },
  'person.no_biography': { en: 'No biography available.', 'pt-BR': 'Nenhuma biografia disponível.' },
  'person.movies': { en: 'Movies', 'pt-BR': 'Filmes' },
  'person.tv': { en: 'TV Shows', 'pt-BR': 'Séries' },
  'person.personal_info': { en: 'Personal Info', 'pt-BR': 'Informações Pessoais' },
  'person.birthday': { en: 'Birthday', 'pt-BR': 'Aniversário' },
  'person.deathday': { en: 'Day of Death', 'pt-BR': 'Data de Falecimento' },
  'person.gender': { en: 'Gender', 'pt-BR': 'Gênero' },
  'person.gender.male': { en: 'Male', 'pt-BR': 'Masculino' },
  'person.gender.female': { en: 'Female', 'pt-BR': 'Feminino' },
  'person.aka': { en: 'Also Known As', 'pt-BR': 'Também conhecido como' },
  'person.error.not_found': { en: 'Actor not found', 'pt-BR': 'Ator não encontrado' },

  // For You
  'foryou.title': { en: 'For', 'pt-BR': 'Para' },
  'foryou.title.span': { en: 'You', 'pt-BR': 'Você' },
  'foryou.desc': { 
    en: 'Our AI analyzed your profile to find the best movie and series suggestions.', 
    'pt-BR': 'Nossa inteligência artificial analisou seu perfil para encontrar as melhores sugestões.' 
  },
  'foryou.login.title': { en: 'Personalize Your Experience', 'pt-BR': 'Personalize sua Experiência' },
  'foryou.login.desc': { 
    en: 'Sign in to receive personalized recommendations based on your cinematic taste.', 
    'pt-BR': 'Faça login para receber recomendações personalizadas baseadas no seu gosto.' 
  },

  // Footer & Legal
  'footer.attribution': { 
    en: 'This product uses the TMDB API but is not endorsed or certified by TMDB.', 
    'pt-BR': 'Este produto usa a API TMDB, mas não é endossado ou certificado pelo TMDB.' 
  },
  'footer.privacy': { en: 'Privacy and Terms', 'pt-BR': 'Privacidade e Termos' },
  'footer.status': { en: 'Operational System', 'pt-BR': 'Sistema Operacional' },
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
