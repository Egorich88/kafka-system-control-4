/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import '../App.css';

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