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
 * @fileoverview
 * Точка входа (Entry Point) frontend-приложения Kafka System Control.
 *
 * Назначение файла:
 * - является первой точкой запуска React-приложения;
 * - подключает глобальные стили приложения;
 * - инициализирует систему локализации (i18n);
 * - подключает глобальные Context Provider'ы;
 * - монтирует корневой компонент <App /> в DOM.
 *
 * Что НЕ должно находиться в этом файле:
 * - бизнес-логика;
 * - маршрутизация приложения;
 * - компоненты интерфейса;
 * - запросы к API;
 * - состояние приложения.
 *
 * Любая логика должна располагаться в соответствующих компонентах,
 * сервисах или Context Provider'ах.
 */

/* Библиотеки React */
import React from 'react';
import ReactDOM from 'react-dom/client';

/* Глобальные стили */
import './styles/global.css';
import './styles/themes.css';
import './styles/layout.css';
import './styles/sidebar.css';

/* Инициализация локализации */
import './i18n/index.js';

/* Корневой компонент приложения */
import LoadingDemo from "./components/loading/LoadingDemo";
//import App from './App';

/* Глобальные провайдеры */
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <LanguageProvider>
        <LoadingDemo />

      </LanguageProvider>
    </ThemeProvider>
  </React.StrictMode>
);