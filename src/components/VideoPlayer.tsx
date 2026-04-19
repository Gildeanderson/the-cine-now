import { motion } from 'motion/react';
import { X, AlertCircle, Film } from 'lucide-react';

interface VideoPlayerProps {
  videoKey: string;
  title: string;
  onClose: () => void;
}

export default function VideoPlayer({ videoKey, title, onClose }: VideoPlayerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex items-center justify-center overflow-hidden p-4 md:p-8"
    >
      {/* Botão de Fechar */}
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 z-[110] p-3 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-95 transition-all border border-white/10"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Container do Player */}
      <div className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5">
        {videoKey ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title={`${title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="p-4 rounded-full bg-destructive/10 text-destructive">
              <Film className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-bold text-white">Trailer Indisponível</h3>
            <p className="text-zinc-400 max-w-xs">
              Não conseguimos localizar o vídeo deste título no banco de dados.
            </p>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors"
            >
              Fechar Player
            </button>
          </div>
        )}
      </div>

      {/* Título Flutuante */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none hidden md:block">
        <h2 className="text-white/40 font-headline font-bold text-sm tracking-widest uppercase">{title}</h2>
      </div>
    </motion.div>
  );
}
