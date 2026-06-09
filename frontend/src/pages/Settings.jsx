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

// ===============================
// ПЛОСКИЙ СПИСОК ТЕМ (НОВАЯ СТРУКТУРА UI)
// ===============================
// ===============================
// FLAT THEMES (FINAL CLEAN STRUCTURE)
// ===============================
const THEMES = [
  // ===============================
  // BASE (самые важные)
  // ===============================
  { key: 'dark', label: 'Dark' },
  { key: 'light', label: 'Light' },

  // разделитель после базовых
  { type: 'divider' },

  // ===============================
  // DEVELOPER THEMES
  // ===============================
  { key: 'github-dark', label: 'GitHub Dark' },
  { key: 'github-light', label: 'GitHub Light' },
  { key: 'dracula', label: 'Dracula' },
  { key: 'nord', label: 'Nord' },
  { key: 'material', label: 'Material Theme UI' },
  { key: 'monokai-pro', label: 'Monokai Pro' },
  { key: 'monocai', label: 'Monocai' },
  { key: 'deep-ocean', label: 'Deep Ocean' },
  { key: 'solarized-dark', label: 'Solarized Dark' },
  { key: 'solarized-light', label: 'Solarized Light' },

  // разделитель перед OS темами
  { type: 'divider' },

  // ===============================
  // OS THEMES (НОВЫЕ)
  // ===============================
  // Mac
  { key: 'mac', label: 'Mac' },

  // Windows LIGHT
  { key: 'windows', label: 'Windows' },

  // Windows DARK (ОТДЕЛЬНАЯ ТЕМА)
  { key: 'windows-dark', label: 'Windows Dark' },

  // Linux
  { key: 'linux', label: 'Linux' },

  // разделитель перед experimental
  { type: 'divider' },

  // ===============================
  // EXPERIMENTAL
  // ===============================
  { key: 'coffee', label: 'Coffee' },
  { key: 'kitty', label: 'Kitty' },
  { key: 'rainbow', label: 'Rainbow' }
];

import '../App.css';
import '../styles/settings.css';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h1>
          Настройки
        </h1>
        <p>
          Персонализация интерфейса Kafka System Control
        </p>
      </div>
      <div className="settings-card">
        <div className="settings-block">
          <div className="settings-block-info">
            <h3>
              Темы
            </h3>
            <p>
              Настройка внешнего вида интерфейса
            </p>
          </div>
          <div className="dropdown-wrapper">

            <button
              type="button"
              className={`dropdown-selected ${
                isThemeOpen ? 'open' : ''
              }`}
              onClick={() =>
                setIsThemeOpen(!isThemeOpen)
              }
            >

              <div className="dropdown-selected-left">

                <span className="dropdown-selected-name">

                  {THEMES.find(t => t.key === theme)?.label || theme}

                </span>

              </div>

              <div className="dropdown-chevron">

                {isThemeOpen ? (
                  <FiChevronUp />
                ) : (
                  <FiChevronDown />
                )}

              </div>

            </button>

            {isThemeOpen && (
              <div className="dropdown-menu">

                {THEMES.map((t, index) => {

                  // 🔹 разделитель
                  if (t.type === 'divider') {
                    return (
                      <div
                        key={`divider-${index}`}
                        className="dropdown-divider"
                      />
                    );
                  }

                  // 🔹 обычная тема
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