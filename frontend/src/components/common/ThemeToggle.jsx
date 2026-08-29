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
 * @fileoverview Компактный переключатель Light / Dark для Sidebar.
 *
 * В развернутом Sidebar:
 *   ☼  [ переключатель ]  ☾
 *
 * В свернутом Sidebar остаётся только центральный переключатель.
 * Полный список пользовательских тем по-прежнему доступен в Settings.
 */

import { FiMoon, FiSun } from 'react-icons/fi';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/theme-toggle.css';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isLight = theme === 'light';

  const toggleTheme = () => {
    setTheme(isLight ? 'dark' : 'light');
  };

  return (
    <div
      className="theme-toggle"
      role="group"
      aria-label="Переключение светлой и тёмной темы"
    >
      <button
        type="button"
        className={`theme-toggle-icon ${isLight ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        aria-label="Светлая тема"
        aria-pressed={isLight}
        data-tooltip-id="sidebar-tooltip"
        data-tooltip-content="Светлая тема"
      >
        <FiSun />
      </button>

      <button
        type="button"
        className={`theme-toggle-switch ${isLight ? 'light' : 'dark'}`}
        onClick={toggleTheme}
        aria-label={
          isLight
            ? 'Переключить на тёмную тему'
            : 'Переключить на светлую тему'
        }
        aria-pressed={!isLight}
        data-tooltip-id="sidebar-tooltip"
        data-tooltip-content={
          isLight
            ? 'Переключить на тёмную тему'
            : 'Переключить на светлую тему'
        }
      >
        <span className="theme-toggle-thumb" />
      </button>

      <button
        type="button"
        className={`theme-toggle-icon ${!isLight ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        aria-label="Тёмная тема"
        aria-pressed={!isLight}
        data-tooltip-id="sidebar-tooltip"
        data-tooltip-content="Тёмная тема"
      >
        <FiMoon />
      </button>
    </div>
  );
}
