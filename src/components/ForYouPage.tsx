import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import AIRecommendations from './AIRecommendations';
import { useAuth } from '../context/AuthContext';

export default function ForYouPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="p-6 rounded-full bg-electric-indigo/10 text-electric-indigo">
          <Sparkles className="w-16 h-16" />
        </div>
        <h2 className="text-3xl font-display font-black uppercase tracking-tight">Personalize sua Experiência</h2>
        <p className="text-zinc-400 max-w-md">
          Faça login para receber recomendações personalizadas baseadas no seu gosto cinematográfico.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="px-8 py-3 rounded-full bg-electric-indigo text-obsidian font-bold hover:bg-electric-indigo/90 transition-all"
        >
          Entrar Agora
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
          Para <span className="text-electric-indigo">Você</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl text-lg font-medium">
          Nossa inteligência artificial analisou seu perfil para encontrar as melhores sugestões de filmes e séries.
        </p>
      </div>

      <AIRecommendations />
      
      {/* Additional AI sections could go here, like "Because you followed X" */}
    </motion.div>
  );
}
