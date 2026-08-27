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

/**
 * @fileoverview Контекст управления темами оформления.
 *
 * ВАЖНО:
 * Каждый id из ALLOWED_THEMES должен существовать как
 * :root[data-theme='...'] в themes.css.
 */

import { createContext, useContext, useEffect, useState } from 'react';

/**
 * Белый список всех поддерживаемых тем.
 *
 * ВАЖНО:
 * Каждый ключ здесь должен иметь соответствующую
 * тему :root[data-theme='...'] в themes.css.
 *
 * Если тема удаляется из приложения, её необходимо
 * удалить и отсюда.
 */
const ALLOWED_THEMES = [

  // ==========================================================
  // BASE
  // ==========================================================

  'dark',
  'light',


  // ==========================================================
  // DEVELOPER
  // ==========================================================

  'github-dark',
  'github-light',
  'dracula',
  'nord',
  'material',
  'monokai-pro',
  'solarized-dark',
  'solarized-light',
  'deep-ocean',


  // ==========================================================
  // SYSTEM
  // ==========================================================

  'mac',
  'linux',


  // ==========================================================
  // MODERN / SOFT
  // ==========================================================

  'mint-lagoon',
  'dreamy-periwinkle',
  'ocean-breeze',
  'pearl-mauve',
  'eucalyptus-glow',
  'peach-whisper',
  'sage-dew',
  'twilight-haze',
  'morning-mist',
  'rose-cloud',


  // ==========================================================
  // EXPERIMENTAL
  // ==========================================================

  'coffee',
  'kitty',
  'rainbow'
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const getInitialTheme = () => {
    const saved = localStorage.getItem('ksc_theme');

    return ALLOWED_THEMES.includes(saved)
      ? saved
      : 'dark';
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

  /**
   * Безопасная смена темы.
   * Не позволяет записать в data-theme неизвестный ключ.
   */
  const safeSetTheme = (newTheme) => {
    if (!ALLOWED_THEMES.includes(newTheme)) {
      console.warn(
        '[ThemeContext] Unknown theme:',
        newTheme
      );
      return;
    }

    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: safeSetTheme
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
