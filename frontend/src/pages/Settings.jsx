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
 * Позволяет выбрать тему оформления и язык интерфейса.
 * Использует универсальный компонент Dropdown.
 */

import { useTheme } from '../contexts/ThemeContext';
import Dropdown from '../components/common/Dropdown';
import { useTranslation } from 'react-i18next';
import '../styles/settings.css';

/**
 * Список доступных тем оформления.
 *
 * id — используется в коде (data-theme)
 * name — отображается в интерфейсе (оригинальные названия)
 *
 * Названия тем соответствуют оригинальным именам:
 * - Dark      → Dark (стандартная тёмная)
 * - Light     → Light (стандартная светлая)
 * - Linux     → Forest (зелёная, как терминал)
 * - Kitty     → Lavender (лавандовая)
 * - Dracula   → Dracula (пурпурная, Dracula Theme)
 * - Nord      → Nord (ледяная, Nord Theme)
 * - Solarized → Solarized (янтарная)
 * - Coffee    → Coffee (кофейная)
 * - Material  → Material (индиго, Material Theme)
 * - Monocai   → Monocai (фиолетовая)
 * - Monokai   → Monokai (золотая)
 * - Ocean     → Ocean (тёмно-синяя)
 * - GitHub    → GitHub (графитовая)
 * - Mac       → Mac (серебристая)
 * - Windows   → Windows (угольная)
 * - Rainbow   → Rainbow (радужная)
 */
const THEMES_LIST = [
  { id: 'dark', name: 'Dark' },
  { id: 'light', name: 'Light' },
  { id: 'linux', name: 'Forest' },
  { id: 'kitty', name: 'Kitty' },
  { id: 'dracula', name: 'Dracula' },
  { id: 'nord', name: 'Nord' },
  { id: 'solarized-light', name: 'Solarized Light' },
  { id: 'solarized-dark', name: 'Solarized Dark' },
  { id: 'coffee', name: 'Coffee' },
  { id: 'material', name: 'Material' },
  { id: 'monocai', name: 'Monocai' },
  { id: 'monokai-pro', name: 'Monokai' },
  { id: 'deep-ocean', name: 'Ocean' },
  { id: 'github-light', name: 'GitHub Light' },
  { id: 'github-dark', name: 'GitHub Dark' },
  { id: 'mac', name: 'Mac' },
  { id: 'windows-dark', name: 'Windows' },
  { id: 'rainbow', name: 'Rainbow' }
];

/**
 * Список доступных языков интерфейса.
 */
const LANGUAGES = [
  { id: 'ru', name: 'Русский' },
  { id: 'en', name: 'English' }
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  console.log('LANG =', i18n.language);
  console.log('RU =', i18n.getResourceBundle('ru', 'translation'));
  console.log('EN =', i18n.getResourceBundle('en', 'translation'));
  console.log('TITLE =', t('settings.title'));

  // Текущий выбранный объект темы для Dropdown
  const currentThemeObj = THEMES_LIST.find(t => t.id === theme) || THEMES_LIST[0];

  // Текущий выбранный объект языка для Dropdown
  const currentLanguageObj =
      LANGUAGES.find(lang => lang.id === i18n.language) || LANGUAGES[0];

  /**
   * Обработчик выбора языка.
   * Меняет язык в i18n и сохраняет в localStorage.
   */
  const handleLanguageSelect = (selected) => {
    i18n.changeLanguage(selected.id);
    localStorage.setItem('ksc_language', selected.id);
  };

  /**
   * Обработчик выбора темы.
   * Меняет тему в контексте.
   */
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

        {/* Блок выбора темы оформления */}
        <div className="settings-block">
          <div className="settings-block-info">
            <h3>{t('settings.theme')}</h3>
            <p>{t('settings.themeDescription')}</p>
          </div>

          <Dropdown
            selectedItem={currentThemeObj}
            items={THEMES_LIST.filter(item => item.id !== theme)}
            onSelect={handleThemeSelect}
          />
        </div>

        {/* Блок выбора языка интерфейса */}
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