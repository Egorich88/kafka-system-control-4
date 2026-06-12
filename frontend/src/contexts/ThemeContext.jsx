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
 * @fileoverview Контекст для управления темами оформления.
 * Хранит текущую тему, позволяет её менять,
 * синхронизирует тему с атрибутом data-theme и localStorage.
 * Ключи тем соответствуют значениям data-theme в theme.css.
 */

import { createContext, useContext, useEffect, useState } from 'react';

/** Белый список допустимых тем (ключи из theme.css) */
const ALLOWED_THEMES = [
  'dark', 'light',
  'linux', 'kitty', 'dracula', 'nord',
  'solarized-light', 'solarized-dark', 'coffee',
  'material', 'monocai', 'monokai-pro', 'deep-ocean',
  'github-light', 'github-dark', 'mac', 'windows-dark',
  'rainbow'
];

const ThemeContext = createContext(null);

/**
 * Провайдер темы для всего приложения.
 * @param {Object} props
 * @param {React.ReactNode} props.children
 */
export function ThemeProvider({ children }) {
  /** Возвращает начальную тему из localStorage или 'dark', если сохранённой нет в белом списке */
  const getInitialTheme = () => {
    const saved = localStorage.getItem('ksc_theme');
    return ALLOWED_THEMES.includes(saved) ? saved : 'dark';
  };

  const [theme, setTheme] = useState(getInitialTheme());

  /** Применяем тему к корневому элементу и сохраняем при каждом изменении */
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ksc_theme', theme);
  }, [theme]);

  /** Безопасная смена темы (проверка на допустимость) */
  const safeSetTheme = (newTheme) => {
    if (!ALLOWED_THEMES.includes(newTheme)) {
      console.warn('[ThemeContext] Unknown theme:', newTheme);
      return;
    }
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: safeSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Хук для доступа к текущей теме и функции смены темы.
 * @returns {Object} { theme, setTheme }
 */
export function useTheme() {
  return useContext(ThemeContext);
}