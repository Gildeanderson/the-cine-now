import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ChevronLeft, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, resetPassword, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await tmdbService.getTrending();
        setBanners(response.results.slice(0, 10));
      } catch (err) {
        console.error('Failed to fetch banners:', err);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [banners]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await loginWithEmail(email, password);
      navigate('/');
    } catch (err: any) {
      setError('E-mail ou senha incorretos. Por favor, tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError('Ocorreu um erro ao entrar com o Google.');
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor, digite seu e-mail para resetar a senha.');
      return;
    }
    setError(null);
    setResetLoading(true);
    try {
      await resetPassword(email);
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    } catch (err: any) {
      setError('Erro ao enviar e-mail de recuperação. Verifique o endereço digitado.');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-indigo"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian flex flex-col lg:flex-row overflow-hidden relative">
      <div className="neon-frame" />
      {/* Left Side: Banner Carousel */}
      <div className="absolute inset-0 lg:relative lg:w-[65%] h-screen overflow-hidden bg-surface-low order-1 lg:order-1">
        <AnimatePresence mode="wait">
          {banners.length > 0 && (
            <motion.div
              key={currentBannerIndex}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <img
                src={getImageUrl(banners[currentBannerIndex].backdrop_path, 'original')}
                alt="Movie Banner"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-obsidian via-obsidian/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent" />
              
              <div className="hidden lg:flex absolute inset-0 flex-col justify-end pb-24 px-16">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="max-w-xl"
                >
                  <span className="inline-block px-3 py-1 rounded-full bg-electric-indigo/20 text-electric-indigo text-[9px] font-black uppercase tracking-[0.3em] border border-electric-indigo/30 mb-4">
                    The Cine Now Experience
                  </span>
                  <h2 className="text-3xl xl:text-4xl font-display font-black text-white leading-tight tracking-tighter uppercase mb-4 drop-shadow-2xl">
                    Você terá uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-indigo to-white">experiência única</span> com The Cine Now
                  </h2>
                  <p className="text-sm text-white/50 font-medium max-w-md leading-relaxed">
                    Explore o melhor do cinema e das séries em alta definição. Sua próxima grande história começa aqui.
                  </p>
                </motion.div>
              </div>

              {/* Progress Indicators */}
              <div className="hidden lg:flex absolute bottom-12 left-16 gap-2">
                {banners.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      idx === currentBannerIndex ? 'w-10 bg-electric-indigo' : 'w-3 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side: Form */}
      <div className="w-full lg:w-[35%] min-h-screen flex flex-col p-8 md:p-12 lg:p-16 relative z-10 bg-obsidian/80 backdrop-blur-xl lg:bg-obsidian lg:backdrop-blur-none order-2 lg:order-2 border-l border-outline-variant/10">
        
        {/* Small Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="absolute top-8 right-8 p-3 rounded-full bg-surface-high border border-outline-variant/10 text-on-surface hover:scale-110 active:scale-95 transition-all shadow-lg z-50 overflow-hidden group"
          aria-label="Toggle theme"
        >
          <motion.div
            initial={false}
            animate={{ rotate: theme === 'dark' ? 0 : 180 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </motion.div>
        </button>

        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-surface transition-colors group mb-12 w-fit"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-electric-indigo to-indigo-dim drop-shadow-[0_0_25px_rgba(163,166,255,0.4)] uppercase leading-none mb-4">
                The Cine Now
              </h1>
              <p className="text-zinc-500 text-sm font-medium tracking-wide">Bem-vindo de volta! Entre na sua conta.</p>
            </div>

            {resetSent && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3 text-green-500 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>E-mail de recuperação enviado! Verifique sua caixa de entrada.</p>
              </motion.div>
            )}

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-electric-indigo transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-electric-indigo/50 focus:border-electric-indigo/50 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-electric-indigo transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-electric-indigo/50 focus:border-electric-indigo/50 transition-all"
                  />
                </div>
                <div className="flex justify-end pr-1">
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={resetLoading}
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-electric-indigo transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? 'Enviando...' : 'Esqueceu sua senha?'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-electric-indigo text-obsidian font-black uppercase tracking-widest py-3.5 px-6 rounded-xl hover:bg-electric-indigo/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-electric-indigo/10 text-sm"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar Agora'}
              </button>
            </form>

            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-900"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                <span className="bg-obsidian px-4 text-zinc-700">Ou continue com</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-bold py-3.5 px-6 rounded-xl hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-xl text-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
              Entrar com Google
            </button>

            <p className="mt-10 text-center text-xs text-zinc-600 font-medium">
              Ainda não tem uma conta?{' '}
              <Link to="/register" className="text-electric-indigo hover:text-electric-indigo/80 transition-colors font-bold underline underline-offset-4">
                Comece sua jornada aqui
              </Link>
            </p>

            {/* Author Credit - Restored for Login Screen */}
            <div className="mt-auto pt-8 flex flex-col items-center gap-1.5 opacity-30 select-none">
              <p className="text-[7px] font-black uppercase tracking-[0.3em] text-on-surface">
                Desenvolvedor do Sistema
              </p>
              <p className="text-[10px] font-bold text-on-surface uppercase tracking-widest text-center">
                Gildeanderson Nascimento
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
