import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2, XCircle, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { tmdbService, getImageUrl } from '../services/tmdbService';

export default function RegisterPage() {
  const { registerWithEmail, loading } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

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

  const validations = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('A senha não atende aos requisitos de segurança.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await registerWithEmail(email, password, name);
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está em uso.');
      } else {
        setError('Ocorreu um erro ao criar sua conta. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-electric-indigo"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row overflow-hidden relative">
      {/* Left Side: Banner Carousel */}
      <div className="absolute inset-0 lg:relative lg:w-[65%] h-screen overflow-hidden bg-zinc-900 order-1 lg:order-1">
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
      <div className="w-full lg:w-[35%] min-h-screen flex flex-col p-8 md:p-12 lg:p-16 relative z-10 bg-obsidian/80 backdrop-blur-xl lg:bg-obsidian lg:backdrop-blur-none order-2 lg:order-2 border-l border-white/5 overflow-y-auto">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group mb-8"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Voltar</span>
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full py-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-display font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-electric-indigo to-indigo-dim drop-shadow-[0_0_25px_rgba(163,166,255,0.4)] uppercase leading-none mb-4">
                The Cine Now
              </h1>
              <p className="text-zinc-500 text-sm font-medium tracking-wide">Crie sua conta gratuita e comece sua jornada hoje.</p>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-electric-indigo transition-colors" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-electric-indigo/50 focus:border-electric-indigo/50 transition-all"
                  />
                </div>
              </div>

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
                
                <div className="mt-4 space-y-2 px-1">
                  <ValidationItem label="Mínimo de 8 caracteres" isValid={validations.length} />
                  <ValidationItem label="Pelo menos uma letra maiúscula" isValid={validations.uppercase} />
                  <ValidationItem label="Pelo menos um caractere especial" isValid={validations.special} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !isPasswordValid}
                className="w-full bg-electric-indigo text-obsidian font-black uppercase tracking-widest py-3.5 px-6 rounded-xl hover:bg-electric-indigo/90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-electric-indigo/10 mt-4 text-sm"
              >
                {isSubmitting ? 'Criando conta...' : 'Criar Conta Agora'}
              </button>
            </form>

            <p className="mt-10 text-center text-xs text-zinc-600 font-medium">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-electric-indigo hover:text-electric-indigo/80 transition-colors font-bold underline underline-offset-4">
                Fazer login
              </Link>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ValidationItem({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs transition-colors font-medium ${isValid ? 'text-emerald-500' : 'text-zinc-600'}`}>
      {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      <span>{label}</span>
    </div>
  );
}
