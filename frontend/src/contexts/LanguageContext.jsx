/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

import i18n from '../i18n';

const LanguageContext =
  createContext(null);

export function LanguageProvider({
  children
}) {

  const [language, setLanguage] =
    useState(

      localStorage.getItem(
        'ksc_language'
      ) || 'ru'
    );

  useEffect(() => {

    i18n.changeLanguage(language);

  }, [language]);

  const changeLanguage = (lng) => {

    setLanguage(lng);

    localStorage.setItem(
      'ksc_language',
      lng
    );
  };

  return (

    <LanguageContext.Provider
      value={{

        language,

        changeLanguage
      }}
    >

      {children}

    </LanguageContext.Provider>
  );
}

export function useLanguage() {

  return useContext(LanguageContext);
}

