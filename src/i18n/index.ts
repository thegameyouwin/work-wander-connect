 import i18n from 'i18next';
 import { initReactI18next } from 'react-i18next';
 import LanguageDetector from 'i18next-browser-languagedetector';
 
 import en from './locales/en.json';
 import es from './locales/es.json';
 import ar from './locales/ar.json';
 import fr from './locales/fr.json';
 import zh from './locales/zh.json';
 
 const resources = {
   en: { translation: en },
   es: { translation: es },
   ar: { translation: ar },
   fr: { translation: fr },
   zh: { translation: zh },
 };
 
 i18n
   .use(LanguageDetector)
   .use(initReactI18next)
   .init({
     resources,
     fallbackLng: 'en',
     interpolation: {
       escapeValue: false,
     },
     detection: {
       order: ['localStorage', 'navigator', 'htmlTag'],
       caches: ['localStorage'],
     },
   });
 
 export const RTL_LANGUAGES = ['ar'];
 
 export const languages = [
   { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
   { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
   { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
   { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
   { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
 ];
 
 export default i18n;