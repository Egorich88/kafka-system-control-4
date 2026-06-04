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
          <div className="cluster-dropdown-wrapper">

            <button
              type="button"
              className={`cluster-selected ${
                isThemeOpen ? 'open' : ''
              }`}
              onClick={() =>
                setIsThemeOpen(!isThemeOpen)
              }
            >

              <div className="cluster-selected-left">

                <span className="cluster-selected-name">

                  {theme === 'dark' && 'Dark'}
                  {theme === 'light' && 'Light'}
                  {theme === 'kitty' && 'Kitty'}

                </span>

              </div>

              <div className="cluster-chevron">

                {isThemeOpen ? (
                  <FiChevronUp />
                ) : (
                  <FiChevronDown />
                )}

              </div>

            </button>

            {isThemeOpen && (

              <div className="cluster-dropdown">

                <div
                  className="cluster-dropdown-item"
                  onClick={() => {
                    setTheme('dark');
                    setIsThemeOpen(false);
                  }}
                >
                  Dark
                </div>
                <div
                  className="cluster-dropdown-item"
                  onClick={() => {
                    setTheme('light');
                    setIsThemeOpen(false);
                  }}
                >
                  Light
                </div>
                <div
                  className="cluster-dropdown-item"
                  onClick={() => {
                    setTheme('kitty');
                    setIsThemeOpen(false);
                  }}
                >
                  Kitty
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}