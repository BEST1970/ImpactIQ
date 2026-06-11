import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStorage } from '../../context/StorageContext';
import { hashPin } from '../../services/localStorageService';

// ─── RequireAdmin ──────────────────────────────────────────────────────────────
// Wraps any content that should only be accessible by an admin.

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  const { settings } = useStorage();
  const [showLogin, setShowLogin] = useState(false);

  if (isAdmin) return <>{children}</>;

  // No PIN set yet → first-time onboarding
  if (!settings?.adminPinHash) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1A3F81]/10 flex items-center justify-center">
          <ShieldAlert className="w-7 h-7 text-[#1A3F81]" />
        </div>
        <h2 className="text-lg font-bold text-slate-800">{t('auth.geenPin')}</h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          {t('auth.geenPinTekst')}
        </p>
        <button
          onClick={() => setShowLogin(true)}
          className="px-6 py-2.5 rounded-xl bg-[#1A3F81] text-white font-semibold text-sm hover:bg-[#283375] transition-colors"
        >
          {t('auth.initielePin')}
        </button>
        {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} isFirstTime />}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center max-w-sm mx-auto gap-4">
      <div className="w-14 h-14 rounded-full bg-[#1A3F81]/10 flex items-center justify-center">
        <Lock className="w-7 h-7 text-[#1A3F81]" />
      </div>
      <h2 className="text-lg font-bold text-slate-800">{t('auth.toegangTitel')}</h2>
      <p className="text-sm text-slate-500">
        {t('auth.toegangTekst')}
      </p>
      <button
        onClick={() => setShowLogin(true)}
        className="px-6 py-2.5 rounded-xl bg-[#1A3F81] text-white font-semibold text-sm hover:bg-[#283375] transition-colors"
      >
        {t('auth.pinInvoeren')}
      </button>
      {showLogin && <AdminLoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}

// ─── AdminLoginModal ───────────────────────────────────────────────────────────

interface AdminLoginModalProps {
  onClose: () => void;
  isFirstTime?: boolean;
}

export function AdminLoginModal({ onClose, isFirstTime = false }: AdminLoginModalProps) {
  const { t } = useTranslation();
  const { loginAdmin } = useAuth();
  const { settings, service, refresh } = useStorage();

  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isFirstTime || !settings?.adminPinHash) {
        if (pin.length < 4) { setError(t('auth.foutMin')); return; }
        if (pin !== confirmPin) { setError(t('auth.foutNietOvereen')); return; }
        const newHash = await hashPin(pin);
        await service.saveSettings({ ...settings!, adminPinHash: newHash });
        await refresh();
        await loginAdmin(pin, newHash);
        onClose();
      } else {
        const ok = await loginAdmin(pin, settings.adminPinHash);
        if (!ok) { setError(t('auth.foutVerkeerd')); return; }
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm mx-4 p-6 space-y-4 animate-slide-down">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1A3F81]/10 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-[#1A3F81]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isFirstTime ? t('auth.modalTitelNieuw') : t('auth.modalTitelLogin')}
            </h2>
            <p className="text-xs text-slate-400">
              {isFirstTime ? t('auth.modalSubNieuw') : t('auth.modalSubLogin')}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <input
              id="admin-pin-input"
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder={isFirstTime ? t('auth.pinPlaceholderNieuw') : t('auth.pinPlaceholder')}
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A3F81]/30 focus:border-[#1A3F81] transition"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPin ? t('auth.verbergPin') : t('auth.toonPin')}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {isFirstTime && (
            <input
              id="admin-pin-confirm"
              type={showPin ? 'text' : 'password'}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              placeholder={t('auth.pinBevestigPlaceholder')}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A3F81]/30 focus:border-[#1A3F81] transition"
            />
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {t('common.annuleren')}
            </button>
            <button
              type="submit"
              id="admin-login-btn"
              disabled={loading || !pin}
              className="px-5 py-2 text-sm font-bold rounded-xl bg-[#1A3F81] text-white hover:bg-[#283375] transition-colors disabled:opacity-60"
            >
              {loading ? t('auth.wachten') : isFirstTime ? t('auth.pinOpslaanBtn') : t('auth.inloggenBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
