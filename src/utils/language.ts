// Language utility functions
export const LANGUAGES = {
  VI: "vi",
  EN: "en",
} as const;

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

const LANGUAGE_STORAGE_KEY = "app_language";

export const languageUtils = {
  // Get current language from localStorage, default to 'vi'
  getCurrentLanguage: (): Language => {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return stored === LANGUAGES.EN || stored === LANGUAGES.VI
      ? stored
      : LANGUAGES.VI;
  },

  // Set language to localStorage
  setLanguage: (language: Language): void => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  },

  // Get language label for display
  getLanguageLabel: (language: Language): string => {
    return language === LANGUAGES.VI ? "Việt Nam" : "English";
  },

  // Get flag emoji for display
  getLanguageFlag: (language: Language): string => {
    return language === LANGUAGES.VI ? "🇻🇳" : "🇺🇸";
  },
};
