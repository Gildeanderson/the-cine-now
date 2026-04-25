import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CarouselProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export default function Carousel({ title, children, icon }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showArrows, setShowArrows] = useState(false);
  const isResetting = useRef(false);

  // Inicializa o scroll no meio (Bloco 2 de 3)
  useEffect(() => {
    if (scrollRef.current && children) {
      const scrollContainer = scrollRef.current;
      const initScroll = () => {
        const oneThird = scrollContainer.scrollWidth / 3;
        scrollContainer.scrollLeft = oneThird;
      };
      
      // Pequeno delay para garantir que o DOM está pronto com os itens triplicados
      const timer = setTimeout(initScroll, 50);
      return () => clearTimeout(timer);
    }
  }, [children]);

  const handleInfiniteScroll = () => {
    if (!scrollRef.current || isResetting.current) return;
    
    const { scrollLeft, scrollWidth } = scrollRef.current;
    const oneThird = scrollWidth / 3;

    // Apenas mantém o posicionamento passivo durante o scroll manual
    if (scrollLeft >= oneThird * 2.2) {
      isResetting.current = true;
      scrollRef.current.scrollLeft = scrollLeft - oneThird;
      setTimeout(() => { isResetting.current = false; }, 50);
    } else if (scrollLeft <= oneThird * 0.8) {
      isResetting.current = true;
      scrollRef.current.scrollLeft = scrollLeft + oneThird;
      setTimeout(() => { isResetting.current = false; }, 50);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      const oneThird = scrollWidth / 3;
      const scrollAmount = clientWidth * 0.8;
      
      // SEAMLESS JUMP: Se estiver chegando no fim da "pista", vira o disco instantaneamente
      if (direction === 'right' && scrollLeft + clientWidth >= scrollWidth - scrollAmount) {
        scrollRef.current.scrollTo({ left: scrollLeft - oneThird, behavior: 'auto' });
      } else if (direction === 'left' && scrollLeft <= scrollAmount) {
        scrollRef.current.scrollTo({ left: scrollLeft + oneThird, behavior: 'auto' });
      }

      // Agora desliza suavemente
      scrollRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
    }
  };

  // Função para renderizar os filhos com chaves únicas para evitar erros do React
  const renderTriplicatedChildren = (setIndex: number) => {
    return React.Children.map(children, (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, {
          key: `${child.key}-set-${setIndex}`
        });
      }
      return child;
    });
  };

  return (
    <section 
      className="space-y-6 relative group/section py-4"
      onMouseEnter={() => setShowArrows(true)}
      onMouseLeave={() => setShowArrows(false)}
    >
      <div className="px-6 md:px-16 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 rounded-xl bg-electric-indigo/10 text-electric-indigo">{icon}</div>}
          <h3 className="font-headline text-2xl font-bold tracking-tight uppercase">
            {title}
          </h3>
        </div>
      </div>

      <div className="relative px-6 md:px-16">
        {/* Navigation Arrows */}
        <AnimatePresence mode="wait">
          {showArrows && (
            <>
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => scroll('left')}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-obsidian/80 backdrop-blur-2xl border border-white/20 text-on-surface shadow-2xl hover:bg-electric-indigo hover:text-obsidian hover:scale-110 active:scale-95 transition-all hidden md:flex"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                onClick={() => scroll('right')}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-50 p-3 rounded-full bg-obsidian/80 backdrop-blur-2xl border border-white/20 text-on-surface shadow-2xl hover:bg-electric-indigo hover:text-obsidian hover:scale-110 active:scale-95 transition-all hidden md:flex"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </AnimatePresence>

        {/* Scrollable Area */}
        <div 
          ref={scrollRef}
          onScroll={handleInfiniteScroll}
          className="flex gap-6 overflow-x-auto hide-scrollbar pb-8 select-none touch-pan-x"
        >
          {renderTriplicatedChildren(1)}
          {renderTriplicatedChildren(2)}
          {renderTriplicatedChildren(3)}
        </div>
      </div>
    </section>
  );
}
