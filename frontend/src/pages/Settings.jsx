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

import '../App.css';
import '../styles/settings.css';
import { useTheme } from '../contexts/ThemeContext';

export default function Settings() {
  const {
    theme,
    setTheme
  } = useTheme();
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
          <select
            className="settings-theme-select"
            value={theme}
            onChange={(e) =>
              setTheme(e.target.value)
            }
          >
            <option value="dark">
              Dark
            </option>

            <option value="light">
              Light
            </option>

            <option value="kitty">
              Kitty
            </option>

          </select>
        </div>
      </div>
    </div>
  );
}