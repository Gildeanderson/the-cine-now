import { motion } from 'motion/react';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-obsidian text-on-surface pb-24">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-obsidian/80 backdrop-blur-xl flex items-center px-6 border-b border-white/5">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-white/5 rounded-full transition-all active:scale-95 text-on-surface-variant/60 hover:text-on-surface mr-4"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="font-headline text-xl font-bold">Privacidade e Termos</h1>
      </header>

      <main className="pt-24 px-6 max-w-3xl mx-auto space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-4 text-electric-indigo">
            <Shield className="w-8 h-8" />
            <h2 className="text-3xl font-black tracking-tight">Sua Privacidade</h2>
          </div>
          <p className="text-on-surface-variant leading-relaxed font-medium">
            No **The Cine Now**, levamos a sério a segurança dos seus dados. Esta página explica como tratamos suas informações e quais são os seus direitos sob a LGPD (Lei Geral de Proteção de Dados).
          </p>
        </motion.div>

        <section className="space-y-8">
          <div className="grid gap-6">
            <PrivacyCard 
              icon={<Lock className="w-5 h-5" />}
              title="Quais dados coletamos?"
              content="Coletamos apenas o essencial: seu nome, e-mail e foto de perfil (via Google Auth ou registro) para personalizar sua experiência e salvar sua lista de favoritos."
            />
            <PrivacyCard 
              icon={<Eye className="w-5 h-5" />}
              title="Como usamos seus dados?"
              content="Seus dados são usados exclusivamente para o funcionamento das funcionalidades do app, como sincronização da sua lista em diferentes dispositivos."
            />
            <PrivacyCard 
              icon={<FileText className="w-5 h-5" />}
              title="Atribuição de Conteúdo"
              content="Este produto usa a API TMDB, mas não é endossado ou certificado pelo TMDB. Todo o conteúdo de vídeo é fornecido via YouTube através de seus players oficiais incorporados."
            />
          </div>
        </section>

        <section className="space-y-4 pt-8 border-t border-white/5">
          <h3 className="text-xl font-bold">Termos de Uso</h3>
          <div className="text-on-surface-variant text-sm space-y-4 leading-relaxed font-medium">
            <p>
              Ao usar o The Cine Now, você concorda que o app é uma ferramenta de catálogo e recomendação. Não hospedamos arquivos de vídeo ilegalmente.
            </p>
            <p>
              Você tem o direito de solicitar a exclusão de sua conta e todos os dados associados a qualquer momento através das configurações de perfil.
            </p>
          </div>
        </section>

        <footer className="text-center text-[10px] text-on-surface-variant/40 pt-12">
          Última atualização: Abril de 2026
        </footer>
      </main>
    </div>
  );
}

function PrivacyCard({ icon, title, content }: { icon: React.ReactNode, title: string, content: string }) {
  return (
    <div className="p-6 rounded-2xl bg-surface-high border border-white/5 space-y-3">
      <div className="flex items-center gap-3 text-electric-indigo">
        {icon}
        <h4 className="font-bold text-on-surface">{title}</h4>
      </div>
      <p className="text-sm text-on-surface-variant leading-relaxed">
        {content}
      </p>
    </div>
  );
}
