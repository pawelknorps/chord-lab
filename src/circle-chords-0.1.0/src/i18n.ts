import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import rawTranslations from '../i18n/languages.json'

const translations: any = rawTranslations as any
const resources = {
  en: { translation: translations.en || {} },
  pl: { translation: translations.pl || {} },
}

const stored = typeof window !== 'undefined' ? localStorage.getItem('language') : undefined
const browser = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en'
const fallbackLng = 'en'
const initialLng = stored && resources[stored as 'en' | 'pl'] ? stored : (resources[browser as 'en' | 'pl'] ? browser : fallbackLng)

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLng,
    fallbackLng,
    interpolation: {
      escapeValue: false,
      prefix: '{',
      suffix: '}',
    },
  })

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang)
  if (typeof window !== 'undefined') localStorage.setItem('language', lang)
}

export default i18n
