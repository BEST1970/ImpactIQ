import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStorage } from '../context/StorageContext';
import type { AppSettings } from '../types';
import { Plus, Trash2, Download, RotateCcw, KeyRound, Eye, EyeOff } from 'lucide-react';
import { RequireAdmin } from '../components/auth/RequireAdmin';
import { hashPin } from '../services/localStorageService';
import { generateDemoData } from '../utils/demoGenerator';

// ─── ListManager ──────────────────────────────────────────────────────────────

function ListManager({
  label,
  items,
  onAdd,
  onRemove,
  translateItem,
}: {
  label: string;
  items: string[];
  onAdd: (val: string) => void;
  onRemove: (val: string) => void;
  translateItem?: (val: string) => string;
}) {
  const { t } = useTranslation();
  const [input, setInput] = useState('');

  function handleAdd() {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      onAdd(trimmed);
      setInput('');
    }
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-800 mb-3">{label}</h3>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
          placeholder={t('settings.toevoegenPlaceholder', { label: label.toLowerCase() })}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6EB550]/40 focus:border-[#6EB550] transition"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6EB550] text-white text-sm font-semibold hover:bg-[#5ea042] transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('settings.toevoegenBtn')}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white shadow-sm border border-slate-200 text-sm text-slate-700 font-medium hover:border-[#2455A2]/30 transition-colors"
          >
            <span>{translateItem ? translateItem(item) : item}</span>
            <button
              type="button"
              onClick={() => onRemove(item)}
              className="text-slate-400 hover:text-red-500 transition-colors"
              aria-label={t('settings.verwijderLabel', { item })}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PinChangeSection ─────────────────────────────────────────────────────────

function PinChangeSection() {
  const { t } = useTranslation();
  const { service, settings, refresh } = useStorage();
  const [newPin, setNewPin]         = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [show, setShow]             = useState(false);
  const [saving, setSaving]         = useState(false);
  const [saved, setSaved]           = useState(false);
  const [error, setError]           = useState('');

  async function handleSave() {
    setError('');
    if (newPin.length < 4) { setError(t('auth.foutMin')); return; }
    if (newPin !== confirmPin) { setError(t('auth.foutNietOvereen')); return; }
    setSaving(true);
    const hash = await hashPin(newPin);
    await service.saveSettings({ ...settings!, adminPinHash: hash });
    await refresh();
    setNewPin('');
    setConfirmPin('');
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <KeyRound className="w-4 h-4 text-[#1A3F81]" />
        Admin-PIN {settings?.adminPinHash ? t('settings.pinWijzigen') : t('settings.pinInstellen')}
      </h3>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            id="new-pin"
            type={show ? 'text' : 'password'}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder={t('settings.pinNieuw')}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A3F81]/30 focus:border-[#1A3F81] transition"
          />
          <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <div className="relative flex-1">
          <input
            id="confirm-pin"
            type={show ? 'text' : 'password'}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder={t('settings.pinBevestig')}
            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A3F81]/30 focus:border-[#1A3F81] transition"
          />
        </div>
        <button
          id="save-pin-btn"
          type="button"
          onClick={handleSave}
          disabled={saving || !newPin}
          className="px-5 py-2 rounded-xl bg-[#1A3F81] text-white text-sm font-semibold hover:bg-[#283375] transition-colors disabled:opacity-60 whitespace-nowrap"
        >
          {saving ? t('settings.pinOpslaanBtn') : t('settings.pinOpslaanBtn')}
        </button>
      </div>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {saved && <p className="text-xs text-[#00833D] font-medium mt-2">✓ {t('settings.pinOpgeslagen')}</p>}
      <p className="text-xs text-slate-400 mt-2">
        {t('settings.pinHashInfo')}
      </p>
    </div>
  );
}

// ─── SettingsContent ──────────────────────────────────────────────────────────

function SettingsContent() {
  const { t } = useTranslation();
  const cats = (t('categories', { returnObjects: true }) as Record<string, string>) || {};
  const translateCategory = (v: string) => cats[v] || v;
  const { service, settings, refresh } = useStorage();
  const [localSettings, setLocalSettings] = useState<AppSettings | null>(settings);
  const [saving, setSaving]               = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [resetting, setResetting]         = useState(false);
  const [confirmReset, setConfirmReset]   = useState(false);
  const [demoLoading, setDemoLoading]     = useState(false);

  if (!localSettings) return null;

  async function handleSave() {
    if (!localSettings) return;
    setSaving(true);
    await service.saveSettings({ ...localSettings, adminPinHash: settings?.adminPinHash ?? null });
    await refresh();
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2500);
  }

  function updateList(key: keyof AppSettings, newList: string[]) {
    setLocalSettings((prev) => prev ? { ...prev, [key]: newList } : prev);
  }

  async function handleExportJSON() {
    const json = await service.exportJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impactiq-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleExportCSV() {
    const csv = await service.exportCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `impactiq-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleReset() {
    setResetting(true);
    await service.resetAll();
    await refresh();
    setLocalSettings(settings);
    setConfirmReset(false);
    setResetting(false);
  }

  async function handleLoadDemoData() {
    const amountStr = window.prompt('Hoeveel demo-experimenten wil je genereren?', '50');
    if (!amountStr) return;
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) return;

    setDemoLoading(true);
    const demos = generateDemoData(amount);
    for (const demo of demos) {
      await service.saveExperiment(demo);
    }
    await refresh();
    setDemoLoading(false);
    alert(`${amount} realistische test-experimenten zijn succesvol toegevoegd!`);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">{t('settings.titel')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('settings.subtitel')}</p>
      </div>

      {/* ── Keuzelijsten ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-slate-800 border-b border-slate-100 pb-4 mb-6">{t('settings.keuzelijsten')}</h2>
        
        <div className="space-y-6">
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
            <ListManager
              label={t('settings.entiteiten')}
              items={[...localSettings.entiteiten].sort((a, b) => a.localeCompare(b))}
              onAdd={(v) => updateList('entiteiten', [...localSettings.entiteiten, v])}
              onRemove={(v) => updateList('entiteiten', localSettings.entiteiten.filter((i) => i !== v))}
            />
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
            <ListManager
              label={t('settings.aiTools')}
              items={[...localSettings.aiTools].sort((a, b) => a.localeCompare(b))}
              onAdd={(v) => updateList('aiTools', [...localSettings.aiTools, v])}
              onRemove={(v) => updateList('aiTools', localSettings.aiTools.filter((i) => i !== v))}
            />
          </div>

          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100">
            <ListManager
              label={t('settings.taakcategorien')}
              items={[...localSettings.taakcategorieen].sort((a, b) => translateCategory(a).localeCompare(translateCategory(b)))}
              onAdd={(v) => updateList('taakcategorieen', [...localSettings.taakcategorieen, v])}
              onRemove={(v) => updateList('taakcategorieen', localSettings.taakcategorieen.filter((i) => i !== v))}
              translateItem={translateCategory}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-6 border-t border-slate-100">
          {saved && (
            <span className="text-sm text-[#00833D] font-medium mr-4 self-center animate-fade-in">
              ✓ {t('settings.opgeslagen')}
            </span>
          )}
          <button
            id="save-settings-btn"
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#6EB550] text-white font-semibold text-sm hover:bg-[#5ea042] transition-colors shadow-sm disabled:opacity-60"
          >
            {t('settings.opslaanBtn')}
          </button>
        </div>
      </div>

      {/* ── Admin-PIN beheer ── */}
      <div className="bg-white rounded-2xl border border-[#1A3F81]/20 shadow-sm p-6">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3 mb-5">{t('settings.pinSectie')}</h2>
        <PinChangeSection />
      </div>

      {/* ── Export ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">{t('settings.exportSectie')}</h2>
        <p className="text-sm text-slate-500">
          {t('settings.exportTekst')}
        </p>
        <div className="flex gap-3 flex-wrap">
          <button
            id="export-csv-btn"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2455A2] text-[#2455A2] font-semibold text-sm hover:bg-[#2455A2]/5 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('settings.exportCSV')}
          </button>
          <button
            id="export-json-btn"
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            {t('settings.exportJSON')}
          </button>
        </div>
      </div>

      {/* ── Demo Data ── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-slate-800 border-b border-slate-100 pb-3">Demo Presentatie</h2>
        <p className="text-sm text-slate-500">
          Laad direct een variabel aantal realistische, fictieve experimenten in (diverse entiteiten, AI-tools en wisselende succesratio's) om het dashboard te kunnen demonstreren aan het management.
        </p>
        <button
          onClick={handleLoadDemoData}
          disabled={demoLoading}
          className="px-5 py-2.5 rounded-xl bg-[#2455A2] text-white font-semibold text-sm hover:bg-[#1A3F81] transition-colors disabled:opacity-60"
        >
          {demoLoading ? 'Demo laden...' : 'Genereer Demo Experimenten'}
        </button>
      </div>

      {/* ── Reset ── */}
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6 space-y-4">
        <h2 className="text-base font-semibold text-red-700 border-b border-red-100 pb-3">{t('settings.resetSectie')}</h2>
        <p className="text-sm text-slate-500">
          {t('settings.resetTekst')}
        </p>
        <button
          id="reset-data-btn"
          onClick={() => setConfirmReset(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          {t('settings.resetBtn')}
        </button>
      </div>

      {/* ── Reset confirmation modal ── */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmReset(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm mx-4 p-6 space-y-4 animate-slide-down">
            <h2 className="text-base font-bold text-slate-800">{t('settings.resetModalTitel')}</h2>
            <p className="text-sm text-slate-500">
              {t('settings.resetModalTekst')}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t('common.annuleren')}
              </button>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 text-sm font-bold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60"
              >
                {resetting ? t('settings.resetBezig') : t('settings.resetBevestig')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SettingsPage (public wrapper with admin gate) ────────────────────────────

export function SettingsPage() {
  return (
    <RequireAdmin>
      <SettingsContent />
    </RequireAdmin>
  );
}
