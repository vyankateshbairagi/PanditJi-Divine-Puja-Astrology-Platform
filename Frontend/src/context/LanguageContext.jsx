import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext();
const supportedLanguages = ['English', 'Hindi', 'Marathi'];

const getStoredLanguage = () => {
  const savedLanguage = localStorage.getItem('language');
  return supportedLanguages.includes(savedLanguage) ? savedLanguage : 'English';
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Load language from localStorage, default to English
    return getStoredLanguage();
  });

  useEffect(() => {
    // Save language to localStorage whenever it changes
    localStorage.setItem('language', currentLanguage);
  }, [currentLanguage]);

  const changeLanguage = (language) => {
    if (supportedLanguages.includes(language)) {
      setCurrentLanguage(language);
    }
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations['English']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
