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

/* =========================
   ALLOWED THEMES (WHITELIST)
   сюда ВСЕ темы проекта
   ========================= */
const ALLOWED_THEMES = [
  'dark',
  'light',

  'github-dark',
  'github-light',
  'dracula',
  'nord',
  'material',
  'monokai-pro',
  'monocai',
  'deep-ocean',
  'solarized-dark',
  'solarized-light',

  'coffee',
  'rainbow',
  'kitty',

  // 🆕 OS themes
  'mac',
  'windows',
  'windows-dark',
  'linux'
];

const ThemeContext = createContext(null);

export function ThemeProvider({
  children
}) {

  const getInitialTheme = () => {
    const saved = localStorage.getItem('ksc_theme');

    // проверка: есть ли тема в whitelist
    if (ALLOWED_THEMES.includes(saved)) {
      return saved;
    }

    return 'dark'; // fallback
  };

  const [theme, setTheme] = useState(getInitialTheme());

  useEffect(() => {

    document.documentElement.setAttribute(
      'data-theme',
      theme
    );

    localStorage.setItem(
      'ksc_theme',
      theme
    );

  }, [theme]);

  return (

    <ThemeContext.Provider
      value={{
        theme,
        setTheme: (newTheme) => {
          // защита от мусора
          if (!ALLOWED_THEMES.includes(newTheme)) {
            console.warn('[ThemeContext] Unknown theme:', newTheme);
            return;
          }

          setTheme(newTheme);
        }
      }}
    >

      {children}

    </ThemeContext.Provider>
  );
}

export function useTheme() {

  return useContext(ThemeContext);
}

