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
import '../App.css';
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

export default function Settings() {
  const { theme, setTheme } = useTheme();

  // Текущий выбранный объект для Dropdown
  const currentThemeObj = THEMES_LIST.find(t => t.id === theme) || THEMES_LIST[0];

  const handleThemeSelect = (selected) => {
    setTheme(selected.id);
  };

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

          {/* Используем универсальный Dropdown */}
          <Dropdown
            selectedItem={currentThemeObj}
            items={THEMES_LIST.filter(item => item.id !== theme)}
            onSelect={handleThemeSelect}
          />
        </div>
      </div>
    </div>
  );
}