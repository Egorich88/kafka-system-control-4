/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
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

