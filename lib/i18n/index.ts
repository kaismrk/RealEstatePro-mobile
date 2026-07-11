import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: 'en',        // synchronous default; detectLanguage() overrides async
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // React Native handles XSS
  },
  compatibilityJSON: 'v4',
});

export default i18n;
