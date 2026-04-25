import { motion } from 'motion/react';
import { Home, Film, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative inline-block"
        >
          <div className="absolute inset-0 bg-electric-indigo/20 blur-3xl rounded-full" />
          <div className="relative p-8 rounded-full bg-surface-high border border-white/5 shadow-2xl">
            <Film className="w-16 h-16 text-electric-indigo" />
            <AlertTriangle className="absolute -top-1 -right-1 w-8 h-8 text-amber-500" />
          </div>
        </motion.div>

        <div className="space-y-3">
          <h1 className="text-4xl font-display font-black tracking-tighter uppercase text-on-surface">
            Cena Não Encontrada
          </h1>
          <p className="text-on-surface-variant font-medium">
            Parece que este filme não está no nosso catálogo ou o link está quebrado. Que tal voltar para a página inicial?
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 rounded-full bg-electric-indigo text-obsidian font-bold flex items-center justify-center gap-2 hover:bg-electric-indigo/90 active:scale-95 transition-all"
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-full bg-surface-high text-on-surface font-bold border border-white/5 hover:bg-white/5 active:scale-95 transition-all"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}
