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
 * Названия тем – цветовые, без привязки к оригинальным именам.
 */

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { useTheme } from '../contexts/ThemeContext';
import '../App.css';
import '../styles/settings.css';

/** Список тем: ключ (для кода) и отображаемая метка (цветовое название) */
const THEMES = [
  // Базовые темы
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },
  { type: 'divider' },

  // Цветовые темы (названия отражают цветовую гамму)
  { key: 'linux', label: 'Forest' },
  { key: 'kitty', label: 'Lavender' },
  { key: 'dracula', label: 'Purple' },
  { key: 'nord', label: 'Ice Blue' },
  { key: 'solarized-light', label: 'Amber Light' },
  { key: 'solarized-dark', label: 'Amber Dark' },
  { key: 'coffee', label: 'Brown' },
  { key: 'material', label: 'Indigo' },
  { key: 'monocai', label: 'Violet' },
  { key: 'monokai-pro', label: 'Golden' },
  { key: 'deep-ocean', label: 'Navy' },
  { key: 'github-light', label: 'Graphite Light' },
  { key: 'github-dark', label: 'Graphite Dark' },
  { key: 'mac', label: 'Silver' },
  { key: 'windows-dark', label: 'Charcoal' },
  { type: 'divider' },

  // Экспериментальная
  { key: 'rainbow', label: 'Rainbow' }
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  // Текущая выбранная тема для отображения в заголовке дропдауна
  const currentThemeLabel = THEMES.find(t => t.key === theme)?.label || theme;

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h1>Settings</h1>
        <p>Customize the interface appearance of Kafka System Control</p>
      </div>

      <div className="settings-card">
        <div className="settings-block">
          <div className="settings-block-info">
            <h3>Themes</h3>
            <p>Choose a color scheme for the interface</p>
          </div>

          <div className="dropdown-wrapper">
            <button
              type="button"
              className={`dropdown-selected ${isThemeOpen ? 'open' : ''}`}
              onClick={() => setIsThemeOpen(!isThemeOpen)}
            >
              <div className="dropdown-selected-left">
                <span className="dropdown-selected-name">{currentThemeLabel}</span>
              </div>
              <div className="dropdown-chevron">
                {isThemeOpen ? <FiChevronUp /> : <FiChevronDown />}
              </div>
            </button>

            {isThemeOpen && (
              <div className="dropdown-menu">
                {THEMES.map((t, idx) => {
                  if (t.type === 'divider') {
                    return <div key={`divider-${idx}`} className="dropdown-divider" />;
                  }
                  return (
                    <div
                      key={t.key}
                      className="dropdown-item"
                      onClick={() => {
                        setTheme(t.key);
                        setIsThemeOpen(false);
                      }}
                    >
                      {t.label}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}