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
 * Позволяет выбрать тему оформления из выпадающего списка.
 * Использует универсальный компонент Dropdown.
 */

import { useTheme } from '../contexts/ThemeContext';
import Dropdown from '../components/common/Dropdown';
import { useTranslation } from 'react-i18next';
import '../styles/settings.css';

/** Список тем: ключ и отображаемая метка */
const THEMES_LIST = [
  { id: 'dark', name: 'Dark' },
  { id: 'light', name: 'Light' },
  { id: 'linux', name: 'Forest' },
  { id: 'kitty', name: 'Lavender' },
  { id: 'dracula', name: 'Purple' },
  { id: 'nord', name: 'Ice Blue' },
  { id: 'solarized-light', name: 'Amber Light' },
  { id: 'solarized-dark', name: 'Amber Dark' },
  { id: 'coffee', name: 'Brown' },
  { id: 'material', name: 'Indigo' },
  { id: 'monocai', name: 'Violet' },
  { id: 'monokai-pro', name: 'Golden' },
  { id: 'deep-ocean', name: 'Navy' },
  { id: 'github-light', name: 'Graphite Light' },
  { id: 'github-dark', name: 'Graphite Dark' },
  { id: 'mac', name: 'Silver' },
  { id: 'windows-dark', name: 'Charcoal' },
  { id: 'rainbow', name: 'Rainbow' }
];

const LANGUAGES = [
    {
        id: 'ru',
        name: 'Русский'
    },
    {
        id: 'en',
        name: 'English'
    }
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { t, i18n } = useTranslation();

  console.log('LANG =', i18n.language);
  console.log('RU =', i18n.getResourceBundle('ru', 'translation'));
  console.log('EN =', i18n.getResourceBundle('en', 'translation'));
  console.log('TITLE =', t('settings.title'));

  // Текущий выбранный объект для Dropdown
  const currentThemeObj = THEMES_LIST.find(t => t.id === theme) || THEMES_LIST[0];

  const currentLanguageObj =
      LANGUAGES.find(
          lang => lang.id === i18n.language
      ) || LANGUAGES[0];

  const handleLanguageSelect = (selected) => {

      i18n.changeLanguage(selected.id);

      localStorage.setItem(
          'ksc_language',
          selected.id
      );
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

        {/* Темы */}
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

        {/* Язык */}
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