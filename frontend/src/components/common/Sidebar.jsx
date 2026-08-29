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
 * @fileoverview Боковое меню (Sidebar) приложения Kafka System Control.
 * Содержит логотип, информацию о версии, выбор/добавление кластера,
 * основную навигацию по разделам, настройки и футер с лицензией.
 */

import { useState, useEffect } from 'react';
import { Tooltip } from 'react-tooltip';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiServer,
  FiLayers,
  FiUsers,
  FiSearch,
  FiSliders,
  FiShield,
  FiAlertTriangle,
  FiFileText,
  FiTerminal,
  FiSettings,
  FiGithub,
  FiFeather,
  FiUser,
  FiSidebar
} from 'react-icons/fi';
import packageJson from '../../../package.json';
import Dropdown from '../common/Dropdown';
import { getLatestVersion } from '../../services/versionService';
import { useCluster } from '../../contexts/ClusterContext';
import ThemeToggle from '../common/ThemeToggle';

// =============================================================================
// Вспомогательные функции для работы с версиями
// =============================================================================

/**
 * Нормализует строку версии: удаляет ведущий символ 'v', если он есть.
 * @param {string} version - Сырая строка версии (например, "v1.2.3" или "1.2.3").
 * @returns {string} Нормализованная версия без префикса 'v'.
 */
function normalizeVersion(version) {
  return version.replace(/^v/, '');
}

/**
 * Сравнивает локальную и удалённую версии.
 * @param {string} local  - Локальная версия (из package.json).
 * @param {string} remote - Удалённая версия (с GitHub).
 * @returns {number} 1, если удалённая новее; -1, если локальная новее; 0, если равны.
 */
function compareVersions(local, remote) {
  const l = local.split('.').map(Number);
  const r = remote.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (r[i] > l[i]) return 1;
    if (r[i] < l[i]) return -1;
  }
  return 0;
}

// =============================================================================
// Основной компонент Sidebar
// =============================================================================

/**
 * Боковая панель навигации.
 * @param {Object} props
 * @param {Function} props.onAddCluster   - Колбэк для добавления нового кластера.
 * @param {Function} props.onEditCluster  - Колбэк для редактирования текущего кластера.
 */
export default function Sidebar({ onAddCluster, onEditCluster }) {
  const { clusters, currentCluster, changeCluster } = useCluster();
  const version = packageJson.version;
  const [latestVersion, setLatestVersion] = useState(null);
  const [animateVersion, setAnimateVersion] = useState(false);

  // Состояние боковой панели
  const [collapsed, setCollapsed] = useState(false);

  // ----- Проверка наличия обновлений (не чаще раза в час) -----
  useEffect(() => {
    const lastCheck = localStorage.getItem('lastVersionCheck');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    if (!lastCheck || now - Number(lastCheck) > oneHour) {
      getLatestVersion().then(remoteVersion => {
        setLatestVersion(remoteVersion);
        localStorage.setItem('lastVersionCheck', now.toString());
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateVersion(true);

      setTimeout(() => {
        setAnimateVersion(false);
      }, 2000);

    }, 2000);

    return () => clearTimeout(timer);
  }, []);



  // Результат сравнения версий
  const versionState = latestVersion ? compareVersions(version, latestVersion) : 0;
  const hasUpdate = versionState === 1;
  const localIsNewer = versionState === -1;
  const hasCluster = clusters.length > 0 && Boolean(currentCluster);

  useEffect(() => {
      if (!hasUpdate) return;

      const interval = setInterval(() => {
        setAnimateVersion(true);

        setTimeout(() => {
          setAnimateVersion(false);
        }, 2000);

      }, 60000);

      return () => clearInterval(interval);
    }, [hasUpdate]);



  // =========================================================================
  // Рендер
  // =========================================================================
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* -------------------- Верхняя область (логотип + кластер) -------------------- */}
      <div className="sidebar-top">
        {/* Логотип и название проекта */}
        <div className="sidebar-logo">

          {/* ----------------------------------------------------------
              Верхняя строка Sidebar
          ----------------------------------------------------------- */}
          <div className="sidebar-header">

            {/* Логотип */}
            {/* ==========================================================
                Брендинг Kafka System Control

                Слева:
                фирменный графический знак.

                Справа:
                короткий wordmark KSC.

                Полное название Kafka System Control
                в Sidebar не используется — здесь нужен
                компактный фирменный идентификатор.
               ========================================================== */}

            <div className="sidebar-logo-brand">

              <img
                  src="/logo.svg"
                  alt="Kafka System Control"
                  className="sidebar-logo-image"
              />

              {!collapsed && (
                <span className="sidebar-brand-name">
                  KSC
                </span>
              )}

            </div>

            {/* Кнопка сворачивания боковой панели */}
            <button
                className="sidebar-collapse-button"
                onClick={() => setCollapsed(!collapsed)}
                data-tooltip-id="sidebar-tooltip"
                data-tooltip-content={collapsed ? "Открыть боковую панель" : "Закрыть боковую панель"}
            >
              <FiSidebar />
            </button>

          </div>

        </div>

        {/* Блок выбора / добавления кластера */}
        <div className="sidebar-cluster">
          {!collapsed && (
              <div className="cluster-top">
                  <span>КЛАСТЕР</span>
              </div>
          )}
          {hasCluster ? (
              <div className={`cluster-row ${collapsed ? 'collapsed' : ''}`}>
                  {!collapsed && (
                      <Dropdown
                          selectedItem={currentCluster}
                          items={clusters.filter(cluster => cluster.id !== currentCluster.id)}
                          onSelect={changeCluster}
                          addLabel="+ Добавить кластер"
                          onAdd={onAddCluster}
                          statusResolver={(cluster) => cluster?.connectionStatus || 'unknown'}
                      />
                  )}

                  <FiSliders
                      className="cluster-settings-icon"
                      onClick={onEditCluster}
                      data-tooltip-id="sidebar-tooltip"
                      data-tooltip-content="Настройки кластера"
                  />
              </div>
          ) : (
              collapsed ? (
                  <button
                      className="cluster-add-collapsed"
                      onClick={onAddCluster}
                      data-tooltip-id="sidebar-tooltip"
                      data-tooltip-content="Добавить кластер"
                  >
                      +
                  </button>
              ) : (
                  <div
                      className="cluster-add-link"
                      onClick={onAddCluster}
                  >
                      + Добавить кластер
                  </div>
              )
          )}
        </div>

        {/* -------------------- Основная навигация (отображается только при выбранном кластере) -------------------- */}
        {hasCluster && (
          <nav className="sidebar-nav">
            {/* Обзор */}
            <NavLink to="/" end className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "Обзор" : undefined}>
              <FiHome />
              {!collapsed && (
                <span>Обзор</span>
              )}
            </NavLink>

            {/* ----------------------------------------------------------
                Разделитель навигации
            ----------------------------------------------------------- */}
            <div className="sidebar-divider" />

            {/* Брокеры */}
            <NavLink to="/brokers" className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "Брокеры" : undefined}>
              <FiServer />
              {!collapsed && (
                <span>Брокеры</span>
              )}
            </NavLink>

            {/* Топики */}
            <NavLink to="/topics" className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "Топики" : undefined}>
              <FiLayers />
              {!collapsed && (
                <span>Топики</span>
              )}
            </NavLink>

            {/* Группы потребителей */}
            <NavLink to="/groups" className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "Группы потребителей" : undefined}>
              <FiUsers />
              {!collapsed && (
              <span>Группы потребителей</span>
              )}
            </NavLink>

            {/* Поиск сообщений */}
            <NavLink to="/search" className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "Поиск сообщений" : undefined}>
              <FiSearch />
              {!collapsed && (
              <span>Поиск сообщений</span>
              )}
            </NavLink>

            {/* ACL */}
            <NavLink to="/acls" className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "ACL" : undefined}>
              <FiShield />
              {!collapsed && (
              <span>ACL</span>
              )}
            </NavLink>

            {/* ----------------------------------------------------------
                Разделитель навигации
            ----------------------------------------------------------- */}
            <div className="sidebar-divider" />

            {/* Оповещения */}
            <NavLink to="/alerts" className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "Оповещения" : undefined}>
              <FiAlertTriangle />
              {!collapsed && (
              <span>Оповещения</span>
              )}
            </NavLink>

            {/* Аудит */}
            <NavLink to="/logs" className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "Аудит" : undefined}>
              <FiFileText />
              {!collapsed && (
              <span>Аудит</span>
              )}
            </NavLink>

            {/* Консоль Kafka */}
            <NavLink to="/console" className="sidebar-link"
                data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
                data-tooltip-content={collapsed ? "Консоль" : undefined}>
              <FiTerminal />
              {!collapsed && (
              <span>Консоль</span>
              )}
            </NavLink>
          </nav>
        )}
      </div>

      {/* -------------------- Нижняя область -------------------- */}
      <div className="sidebar-bottom">
        {/* Настройки + профиль администратора */}
        <nav className="sidebar-bottom-nav">
          <NavLink
            to="/settings"
            className="sidebar-link"
            data-tooltip-id={collapsed ? "sidebar-tooltip" : undefined}
            data-tooltip-content={collapsed ? "Настройки" : undefined}
          >
            <FiSettings />
            {!collapsed && <span>Настройки</span>}
          </NavLink>

          <div
            className="sidebar-user-link"
            data-tooltip-id="sidebar-tooltip"
            data-tooltip-content="Профиль пользователя"
          >
            <FiUser />
            {!collapsed && <span>Пользователь</span>}
          </div>
        </nav>

        <div className="sidebar-divider sidebar-divider-bottom" />

        {/* Быстрый переключатель Light / Dark */}
        <div className="sidebar-theme-control">
          <ThemeToggle />
        </div>

        {/* Футер: GitHub + Apache License и версия */}
        <div className="sidebar-footer">
          <div className="footer-links-row">
            <a
              href="https://github.com/Egorich88/kafka-system-control-4"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-link"
              data-tooltip-id="sidebar-tooltip"
              data-tooltip-content="GitHub проекта — Egorich88"
              aria-label="GitHub проекта — Egorich88"
            >
              <FiGithub className="footer-github-icon" />
            </a>

            <a
              href="https://www.apache.org/licenses/LICENSE-2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-icon-link"
              data-tooltip-id="sidebar-tooltip"
              data-tooltip-content="Apache License 2.0"
              aria-label="Apache License 2.0"
            >
              <FiFeather className="footer-license-icon" />
            </a>
          </div>

          <a
            href="https://github.com/Egorich88/kafka-system-control-4/releases"
            target="_blank"
            rel="noopener noreferrer"
            className={`sidebar-version ${hasUpdate ? 'update-available' : ''} ${animateVersion ? 'animate' : ''}`}
            data-tooltip-id="sidebar-tooltip"
            data-tooltip-content={
              hasUpdate
                ? `Доступна версия ${latestVersion}`
                : localIsNewer
                  ? `Локальная версия новее GitHub`
                  : `Актуальная версия ${version}`
            }
          >
            <span className="version-label">
              {`ver. ${version}`}
            </span>
          </a>
        </div>
      </div>
      <Tooltip id="sidebar-tooltip" place="right" offset={12} />
    </aside>
  );
}