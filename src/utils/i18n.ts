
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector'; // Installed in package.json
import rawTranslations from './languages.json';

const translations: any = rawTranslations as any;
const resources = {
    en: { translation: translations.en || {} },
    pl: { translation: translations.pl || {} },
    ru: { translation: translations.ru || {} },
    // Add others if present
};

const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : undefined;
const fallbackLng = 'en';

// Default to English, only use stored language if explicitly set
const initialLng = stored && resources[stored as keyof typeof resources]
    ? stored
    : fallbackLng;

i18n
    .use(initReactI18next)
    .use(LanguageDetector) // Use detector for better robustness
    .init({
        resources,
        lng: initialLng,
        fallbackLng,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export function setLanguage(lang: string) {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') localStorage.setItem('language', lang);
}

export default i18n;
