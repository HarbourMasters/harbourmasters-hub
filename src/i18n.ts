import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English translations
import enCommon from './locales/en/common.json';
import enHome from './locales/en/home.json';
import enDownloads from './locales/en/downloads.json';
import enFaq from './locales/en/faq.json';
import enAbout from './locales/en/about.json';
import enGames from './locales/en/games.json';
import enPress from './locales/en/press.json';
import enTools from './locales/en/tools.json';
import enGameDetail from './locales/en/gameDetail.json';

// Import French translations
import frCommon from './locales/fr/common.json';
import frHome from './locales/fr/home.json';
import frDownloads from './locales/fr/downloads.json';
import frFaq from './locales/fr/faq.json';
import frAbout from './locales/fr/about.json';
import frGames from './locales/fr/games.json';
import frPress from './locales/fr/press.json';
import frTools from './locales/fr/tools.json';
import frGameDetail from './locales/fr/gameDetail.json';

// Import German translations
import deCommon from './locales/de/common.json';
import deHome from './locales/de/home.json';
import deDownloads from './locales/de/downloads.json';
import deFaq from './locales/de/faq.json';
import deAbout from './locales/de/about.json';
import deGames from './locales/de/games.json';
import dePress from './locales/de/press.json';
import deTools from './locales/de/tools.json';
import deGameDetail from './locales/de/gameDetail.json';

// Import Spanish translations
import esCommon from './locales/es/common.json';
import esHome from './locales/es/home.json';
import esDownloads from './locales/es/downloads.json';
import esFaq from './locales/es/faq.json';
import esAbout from './locales/es/about.json';
import esGames from './locales/es/games.json';
import esPress from './locales/es/press.json';
import esTools from './locales/es/tools.json';
import esGameDetail from './locales/es/gameDetail.json';

// Import Italian translations
import itCommon from './locales/it/common.json';
import itHome from './locales/it/home.json';
import itDownloads from './locales/it/downloads.json';
import itFaq from './locales/it/faq.json';
import itAbout from './locales/it/about.json';
import itGames from './locales/it/games.json';
import itPress from './locales/it/press.json';
import itTools from './locales/it/tools.json';
import itGameDetail from './locales/it/gameDetail.json';

const resources = {
  en: {
    common: enCommon,
    home: enHome,
    downloads: enDownloads,
    faq: enFaq,
    about: enAbout,
    games: enGames,
    press: enPress,
    tools: enTools,
    gameDetail: enGameDetail
  },
  fr: {
    common: frCommon,
    home: frHome,
    downloads: frDownloads,
    faq: frFaq,
    about: frAbout,
    games: frGames,
    press: frPress,
    tools: frTools,
    gameDetail: frGameDetail
  },
  de: {
    common: deCommon,
    home: deHome,
    downloads: deDownloads,
    faq: deFaq,
    about: deAbout,
    games: deGames,
    press: dePress,
    tools: deTools,
    gameDetail: deGameDetail
  },
  es: {
    common: esCommon,
    home: esHome,
    downloads: esDownloads,
    faq: esFaq,
    about: esAbout,
    games: esGames,
    press: esPress,
    tools: esTools,
    gameDetail: esGameDetail
  },
  it: {
    common: itCommon,
    home: itHome,
    downloads: itDownloads,
    faq: itFaq,
    about: itAbout,
    games: itGames,
    press: itPress,
    tools: itTools,
    gameDetail: itGameDetail
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'de', 'es', 'it'],
    ns: ['common', 'home', 'downloads', 'faq', 'about', 'games', 'press', 'tools', 'gameDetail'],
    defaultNS: 'common',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: true
    }
  });

export default i18n;
