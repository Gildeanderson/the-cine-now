import { motion } from 'motion/react';
import { ArrowLeft, User, Mail, Calendar, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProfileDetailsPage() {
  const navigate = useNavigate();
  const { user, profile, deleteAccount } = useAuth();
  const { t } = useLanguage();

  const handleDeleteAccount = async () => {
    if (window.confirm(t('details.confirm_alert'))) {
      try {
        await deleteAccount();
        navigate('/login');
      } catch (error: any) {
        if (error.code === 'auth/requires-recent-login') {
          alert(t('details.reauth_alert'));
        } else {
          alert(t('details.delete_error'));
        }
      }
    }
  };

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
        <h1 className="font-headline text-xl font-bold">{t('profile.details')}</h1>
      </header>

      <main className="pt-24 px-6 max-w-xl mx-auto space-y-8">
        {/* User Info Card */}
        <section className="bg-surface-low p-6 rounded-2xl border border-white/5 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-electric-indigo/20 flex items-center justify-center text-electric-indigo">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User size={32} />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{user?.displayName || 'Usuário'}</h2>
              <p className="text-sm text-on-surface-variant">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
            <DetailItem label={t('details.user_id')} value={user?.uid || '---'} />
            <DetailItem label={t('details.provider')} value={user?.providerData[0]?.providerId === 'google.com' ? 'Google' : 'E-mail / Senha'} />
            <DetailItem label={t('details.created_at')} value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : t('details.not_available')} />
          </div>
        </section>

        {/* Security / Privacy Info */}
        <div className="bg-electric-indigo/5 p-4 rounded-xl border border-electric-indigo/20 flex gap-4">
          <Shield className="text-electric-indigo w-6 h-6 shrink-0" />
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {t('details.security_msg')}
          </p>
        </div>

        {/* Danger Zone */}
        <section className="space-y-4 pt-8">
          <div className="flex items-center gap-2 text-red-500/80 px-2">
            <AlertTriangle size={16} />
            <h3 className="text-[10px] uppercase font-bold tracking-widest">{t('details.danger_zone')}</h3>
          </div>
          
          <div className="bg-red-500/5 p-6 rounded-2xl border border-red-500/10 space-y-4">
            <p className="text-xs text-on-surface-variant leading-relaxed">
              {t('details.delete_warning')}
            </p>
            <button 
              onClick={handleDeleteAccount}
              className="w-full flex items-center justify-center gap-2 p-4 bg-red-500 text-white rounded-xl font-bold transition-all active:scale-95 shadow-lg shadow-red-500/20"
            >
              <Trash2 className="w-5 h-5" />
              {t('details.delete_confirm')}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function DetailItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">{label}</span>
      <span className="text-sm font-medium truncate ml-4 max-w-[200px]">{value}</span>
    </div>
  );
}
