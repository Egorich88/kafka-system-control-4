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
 * @fileoverview Страница настроек приложения.
 * Темы используют отдельный ThemeDropdown, потому что для тем
 * требуется более информативное меню: разделители, отметка
 * текущей темы и компактная ширина по содержимому.
 */

import { useTheme } from '../contexts/ThemeContext';
import Dropdown from '../components/common/Dropdown';
import ThemeDropdown from '../components/common/ThemeDropdown';
import { useTranslation } from 'react-i18next';
import '../styles/settings.css';

// ============================================================
// СПИСОК ТЕМ
//
// ВАЖНО:
// - id должен совпадать с data-theme в themes.css;
// - divider является только визуальным разделителем;
// - выбранная тема не удаляется из списка;
//   ThemeDropdown показывает её с галочкой.
// ============================================================

const THEMES_LIST = [

  // ==========================================================
  // BASE
  // Основные темы интерфейса
  // ==========================================================

  { id: 'dark', name: 'Dark' },
  { id: 'light', name: 'Light' },

  // Небесно-голубой разделитель
  { type: 'divider' },


  // ==========================================================
  // DEVELOPER THEMES
  // Классические темы для разработчиков
  // ==========================================================

  { id: 'github-dark', name: 'GitHub Dark' },
  { id: 'github-light', name: 'GitHub Light' },
  { id: 'dracula', name: 'Dracula' },
  { id: 'nord', name: 'Nord' },
  { id: 'material', name: 'Material' },
  { id: 'monokai-pro', name: 'Monokai Pro' },
  { id: 'solarized-dark', name: 'Solarized Dark' },
  { id: 'solarized-light', name: 'Solarized Light' },
  { id: 'deep-ocean', name: 'Deep Ocean' },

  // Небесно-голубой разделитель
  { type: 'divider' },


  // ==========================================================
  // SYSTEM THEMES
  // Темы, вдохновлённые операционными системами
  // ==========================================================

  { id: 'mac', name: 'Mac' },
  { id: 'linux', name: 'Linux' },

  // Windows удалён:
  // Light уже выполняет роль основной светлой темы.


  // Небесно-голубой разделитель
  { type: 'divider' },


  // ==========================================================
  // MODERN / SOFT THEMES
  // Современная спокойная палитра
  // ==========================================================

  { id: 'mint-lagoon', name: 'Mint Lagoon' },
  { id: 'dreamy-periwinkle', name: 'Dreamy Periwinkle' },
  { id: 'ocean-breeze', name: 'Ocean Breeze' },
  { id: 'pearl-mauve', name: 'Pearl Mauve' },
  { id: 'eucalyptus-glow', name: 'Eucalyptus Glow' },
  { id: 'peach-whisper', name: 'Peach Whisper' },
  { id: 'sage-dew', name: 'Sage Dew' },
  { id: 'twilight-haze', name: 'Twilight Haze' },
  { id: 'morning-mist', name: 'Morning Mist' },
  { id: 'rose-cloud', name: 'Rose Cloud' },

  // Небесно-голубой разделитель
  { type: 'divider' },


  // ==========================================================
  // EXPERIMENTAL
  // Нестандартные экспериментальные темы
  // ==========================================================

  { id: 'coffee', name: 'Coffee' },
  { id: 'kitty', name: 'Kitty' },
  { id: 'rainbow', name: 'Rainbow' }
];

const LANGUAGES = [
  { id: 'ru', name: 'Русский' },
  { id: 'en', name: 'English' }
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  const currentThemeObj =
    THEMES_LIST.find(item => item.id === theme) || THEMES_LIST[0];

  const currentLanguageObj =
    LANGUAGES.find(lang => lang.id === i18n.language) || LANGUAGES[0];

  const handleLanguageSelect = (selected) => {
    i18n.changeLanguage(selected.id);
    localStorage.setItem('ksc_language', selected.id);
  };

  const handleThemeSelect = (selected) => {
    setTheme(selected.id);
  };

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h1>{t('settings.title')}</h1>
        <p>{t('settings.subtitle')}</p>
      </div>

      <div className="settings-card">

        {/* ================================================
            ВЫБОР ТЕМЫ
            Для тем используется отдельный dropdown:
            - показывает выбранную тему в списке;
            - ставит галочку напротив активной;
            - поддерживает визуальные разделители.
           ================================================ */}
        <div className="settings-block">
          <div className="settings-block-info">
            <h3>{t('settings.theme')}</h3>
            <p>{t('settings.themeDescription')}</p>
          </div>

          <ThemeDropdown
            selectedItem={currentThemeObj}
            items={THEMES_LIST}
            onSelect={handleThemeSelect}
          />
        </div>

        {/* ================================================
            ЯЗЫК
            Обычный универсальный Dropdown оставляем как есть.
           ================================================ */}
        <div className="settings-block">
          <div className="settings-block-info">
            <h3>{t('settings.language')}</h3>
            <p>{t('settings.languageDescription')}</p>
          </div>

          <Dropdown
            selectedItem={currentLanguageObj}
            items={LANGUAGES.filter(item => item.id !== i18n.language)}
            onSelect={handleLanguageSelect}
          />
        </div>

      </div>
    </div>
  );
}
