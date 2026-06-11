import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { FlaskConical, LayoutDashboard, Settings, BookOpen, Shield, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Lang } from '../../i18n';
import { CrystalIcon } from '../ui/CrystalIcon';
import { DataLocalBanner } from './DataLocalBanner';
import { useAuth } from '../../context/AuthContext';
import { AdminLoginModal } from '../auth/RequireAdmin';
import { useStorage } from '../../context/StorageContext';

const NAV_KEYS: Record<string, string> = {
  '/info': 'nav.info',
  '/experimenten': 'nav.experimenten',
  '/dashboard': 'nav.dashboard',
  '/instellingen': 'nav.instellingen',
};

const NAV_ITEMS = [
  { to: '/info', icon: BookOpen },
  { to: '/experimenten', icon: FlaskConical },
  { to: '/dashboard', icon: LayoutDashboard },
  { to: '/instellingen', icon: Settings },
];

const LANGS: { code: Lang; label: string }[] = [
  { code: 'nl', label: 'NL' },
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAdmin, logoutAdmin } = useAuth();
  const { settings } = useStorage();
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const { t, i18n } = useTranslation();

  const hasPinSet = !!settings?.adminPinHash;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ── Local data banner ── */}
      <DataLocalBanner />

      {/* ── Top navigation ── */}
      <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <NavLink to="/experimenten" className="flex items-center gap-3 group">
              <CrystalIcon size={32} />
              <div className="leading-tight">
                <span className="text-lg font-bold text-slate-800 tracking-tight">
                  Impact<span className="text-[#6EB550]">IQ</span>
                </span>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium -mt-0.5">
                  CFE Group · AI Lab
                </p>
              </div>
            </NavLink>

            {/* Right side: nav + language switcher + admin badge */}
            <div className="flex items-center gap-2">
              <nav className="flex items-center gap-1" aria-label="Hoofdnavigatie">
                {NAV_ITEMS.map(({ to, icon: Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150
                      ${isActive
                        ? 'bg-[#6EB550]/10 text-[#6EB550]'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                      }`
                    }
                    aria-current={location.pathname.startsWith(to) ? 'page' : undefined}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t(NAV_KEYS[to])}</span>
                  </NavLink>
                ))}
              </nav>

              {/* Language switcher */}
              <div className="flex items-center gap-0.5 ml-1">
                {LANGS.map(({ code, label }) => (
                  <button
                    key={code}
                    onClick={() => i18n.changeLanguage(code)}
                    className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
                      i18n.language === code
                        ? 'bg-[#1A3F81] text-white'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Admin badge / login button */}
              {isAdmin ? (
                <div className="flex items-center gap-1.5 ml-2">
                  <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1A3F81]/10 text-[#1A3F81] text-xs font-semibold">
                    <Shield className="w-3.5 h-3.5" />
                    {t('common.admin')}
                  </span>
                  <button
                    onClick={logoutAdmin}
                    title="Admin-modus verlaten"
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    aria-label={t('auth.uitloggenLabel')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : hasPinSet ? (
                <button
                  onClick={() => setShowAdminLogin(true)}
                  title="Admin-modus"
                  className="ml-2 p-2 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-50 transition-colors"
                  aria-label={t('auth.pinInvoeren')}
                >
                  <Shield className="w-4 h-4" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Admin login modal */}
      {showAdminLogin && (
        <AdminLoginModal onClose={() => setShowAdminLogin(false)} />
      )}

      {/* ── Page content ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
        ImpactIQ · CFE Group · AI Lab
      </footer>
    </div>
  );
}
