import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import AIRecommendations from './AIRecommendations';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ForYouPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="p-6 rounded-full bg-electric-indigo/10 text-electric-indigo">
          <Sparkles className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-display font-black uppercase tracking-tight">{t('foryou.login.title')}</h2>
        <p className="text-zinc-400 max-w-md">
          {t('foryou.login.desc')}
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-8 py-3 rounded-full bg-electric-indigo text-obsidian font-bold hover:bg-electric-indigo/90 transition-all"
        >
          {t('auth.signin_now')}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 pb-20 atmosphere min-h-screen"
    >
      <div className="px-8 md:px-16 mb-12">
        <h1 className="text-4xl md:text-6xl font-display font-black uppercase tracking-tighter leading-none mb-4">
          {t('foryou.title')} <span className="text-electric-indigo">{t('foryou.title.span')}</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl text-lg font-medium">
          {t('foryou.desc')}
        </p>
      </div>

      <AIRecommendations />
    </motion.div>
  );
}
