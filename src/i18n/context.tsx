import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface I18nContextValue {
  language: Language;
  direction: 'rtl' | 'ltr';
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  formatDate: (dateString?: string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (n: number) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

const STORAGE_KEY_LANG = 'taskdo_preferred_lang';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Arabic is the default language for first-time users as required
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    if (saved === 'ar' || saved === 'en') {
      return saved;
    }
    return 'ar'; // Arabic default
  });

  const direction: 'rtl' | 'ltr' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
    localStorage.setItem(STORAGE_KEY_LANG, language);
  }, [language, direction]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: TranslationKey, fallback?: string): string => {
    const dict = translations[language] as Record<string, string>;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    // Fallback to English if missing in target
    const fallbackDict = translations.en as Record<string, string>;
    return fallbackDict[key] ?? fallback ?? key;
  };

  const formatDate = (dateString?: string, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString.includes('T') ? dateString : `${dateString}T00:00:00`);
      if (isNaN(date.getTime())) return dateString;
      const locale = language === 'ar' ? 'ar-EG' : 'en-US';
      const defaultOptions: Intl.DateTimeFormatOptions = {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options,
      };
      return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
    } catch {
      return dateString;
    }
  };

  const formatNumber = (n: number): string => {
    try {
      const locale = language === 'ar' ? 'ar-EG' : 'en-US';
      return new Intl.NumberFormat(locale).format(n);
    } catch {
      return String(n);
    }
  };

  const value = useMemo(
    () => ({
      language,
      direction,
      setLanguage,
      t,
      formatDate,
      formatNumber,
    }),
    [language, direction]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
