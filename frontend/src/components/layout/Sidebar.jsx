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

import {
  FiHome,
  FiLayers,
  FiUsers,
  FiSearch,
  FiSliders,
  FiShield,
  FiRotateCcw,
  FiAlertTriangle,
  FiFileText,
  FiSettings,
  FiGithub
} from 'react-icons/fi';

import { NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import packageJson from '../../../package.json';
import Dropdown from '../common/Dropdown';

/* Импорт версии обновления */
import { getLatestVersion } from '../../services/versionService';

import { useCluster } from '../../contexts/ClusterContext';

/* Нормализация версии */
function normalizeVersion(version) { return version.replace(/^v/, ''); }
function compareVersions(local, remote) {

  const l = local.split('.').map(Number);
  const r = remote.replace(/^v/, '')
                  .split('.')
                  .map(Number);

  for (let i = 0; i < 3; i++) {

    if (r[i] > l[i]) return 1;
    if (r[i] < l[i]) return -1;

  }

  return 0;

}
export default function Sidebar({
  onAddCluster,
  onEditCluster
}) {

  const {
    clusters,
    currentCluster,
    changeCluster
  } = useCluster();

  {/* Проверка версии */}
  useEffect(() => {
    const lastCheck = localStorage.getItem('lastVersionCheck');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    if ( !lastCheck || now - Number(lastCheck) > oneHour ) { getLatestVersion().then(version => { setLatestVersion(version); localStorage.setItem( 'lastVersionCheck', now.toString() ); });
    }
  }, []);

  {/* объявляем переменную версии */}
  const version = packageJson.version;

  {/* обновление версии */}
  const [latestVersion, setLatestVersion] = useState(null);

  {/* сравнение/нормализация версии */}
  const versionState =
    latestVersion
      ? compareVersions(version, latestVersion)
      : 0;

  const hasUpdate =
    versionState === 1;

  const localIsNewer =
    versionState === -1;

  const hasCluster =
    clusters.length > 0 &&
    Boolean(currentCluster);

  return (

    <aside className="sidebar">

      {/* ========================= ВЕРХНЯЯ ОБЛАСТЬ (TOP) ========================= */}

      <div className="sidebar-top">

        {/* LOGO */}

        <div className="sidebar-logo">

          <img
            src="/logo.svg"
            alt="Kafka System Control"
          />

          <div>

            <h2>
              Kafka System Control
            </h2>
            {/* Отображение версии */}
            <a
              href="https://github.com/Egorich88/kafka-system-control-4/releases"
              target="_blank"
              rel="noopener noreferrer"
              className={`sidebar-version ${
                hasUpdate ? 'update-available' : ''
              }`}
              title={
                hasUpdate
                  ? `Доступна версия ${latestVersion}`
                  : localIsNewer
                    ? `Локальная версия новее GitHub`
                    : `Актуальная версия`
              }
            >
              {/* Светодиод с версией */}
              <span className="version-label">
                Version {version}
                {hasUpdate && (
                  <span className="version-update-dot" />
                )}
              </span>
            </a>

          </div>

        </div>

        {/* CLUSTER */}

        <div className="sidebar-cluster">

          <div className="cluster-top">

            <span>
              КЛАСТЕР
            </span>

          </div>

          {hasCluster ? (

            <div className="cluster-row">

              <Dropdown
                selectedItem={currentCluster}
                items={clusters.filter(
                  cluster =>
                    cluster.id !== currentCluster.id
                )}
                onSelect={changeCluster}
                addLabel="+ Добавить кластер"
                onAdd={onAddCluster}
                statusResolver={(cluster) =>
                  cluster?.connectionStatus || 'unknown'
                }
              />

              <FiSliders
                className="cluster-settings-icon"
                title="Настройки кластера"
                onClick={onEditCluster}
              />

            </div>

          ) : (

            <div
                className="cluster-add-link"
                onClick={onAddCluster}
              >
                + Добавить кластер
              </div>
            )}

        </div>

        {/* ========================= НАВИГАЦИЯ (NAVIGATION) ========================= */}

        {hasCluster && (

          <nav className="sidebar-nav">

            <NavLink
              to="/"
              end
              className="sidebar-link"
            >

              <FiHome />

              <span>
                Обзор
              </span>

            </NavLink>

            <NavLink
              to="/topics"
              className="sidebar-link"
            >

              <FiLayers />

              <span>
                Топики
              </span>

            </NavLink>

            <NavLink
              to="/groups"
              className="sidebar-link"
            >

              <FiUsers />

              <span>
                Консьюмеры
              </span>

            </NavLink>

            <NavLink
              to="/offset-reset"
              className="sidebar-link"
            >

              <FiRotateCcw />

              <span>
                Сброс оффсетов
              </span>

            </NavLink>

            <NavLink
              to="/search"
              className="sidebar-link"
            >

              <FiSearch />

              <span>
                Поиск сообщений
              </span>

            </NavLink>

            <NavLink
              to="/acls"
              className="sidebar-link"
            >

              <FiShield />

              <span>
                ACL
              </span>

            </NavLink>

            <NavLink
              to="/alerts"
              className="sidebar-link"
            >

              <FiAlertTriangle />

              <span>
                Оповещения
              </span>

            </NavLink>

            <NavLink
              to="/logs"
              className="sidebar-link"
            >

              <FiFileText />

              <span>
                Логи
              </span>

            </NavLink>

          </nav>

        )}

      </div>

      {/* ========================= НИЖНИЙ КОЛОНТИТУЛ (BOTTOM) ========================= */}

      <div className="sidebar-bottom">

        {/* НАСТРОЙКИ */}

        <nav className="sidebar-nav sidebar-settings-nav">

          <NavLink
            to="/settings"
            className="sidebar-link"
          >

            <FiSettings />

            <span>
              Настройки
            </span>

          </NavLink>

        </nav>

        {/* НИЖНИЙ КОЛОНТИТУЛ (FOOTER) */}

        <div className="sidebar-footer">

          <a
            href="https://github.com/Egorich88/kafka-system-control-4"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-project-link"
            title="Автор продукта"
          >

            <FiGithub className="footer-github-icon" />

            <span>
              Egorich88
            </span>

          </a>

          <a
            href="https://www.apache.org/licenses/LICENSE-2.0"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-license"
          >

            Apache License 2.0

          </a>

        </div>

      </div>

    </aside>
  );
}