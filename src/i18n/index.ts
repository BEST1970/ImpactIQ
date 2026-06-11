import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import nl from './nl';
import fr from './fr';
import en from './en';

const LANG_KEY = 'impactiq:lang';

const savedLang = localStorage.getItem(LANG_KEY) || 'nl';

i18n.use(initReactI18next).init({
  resources: {
    nl: { translation: nl },
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'nl',
  interpolation: {
    escapeValue: false, // React al escapeert
  },
});

// Sla taalwijzigingen op in localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LANG_KEY, lng);
});

export default i18n;
export type Lang = 'nl' | 'fr' | 'en';
