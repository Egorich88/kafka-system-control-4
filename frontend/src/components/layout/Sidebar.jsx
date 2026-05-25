/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import {
  FiHome,
  FiLayers,
  FiUsers,
  FiSearch,
  FiShield,
  FiRotateCcw,
  FiAlertTriangle,
  FiFileText,
  FiSettings,
  FiGithub,
  FiChevronDown,
  FiChevronUp
} from 'react-icons/fi';

import {
  NavLink
} from 'react-router-dom';

import {
  useState
} from 'react';

import packageJson from '../../../package.json';

import {
  useTranslation
} from 'react-i18next';

import {
  useCluster
} from '../../contexts/ClusterContext';

export default function Sidebar({

  onAddCluster,
  onEditCluster

}) {

  const {
    t
  } = useTranslation();

  const {
    clusters,
    currentCluster,
    changeCluster
  } = useCluster();

  const [isClusterOpen, setIsClusterOpen] =
    useState(false);

  const version =
    packageJson.version;

  return (

    <aside className="sidebar">

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

          <span className="sidebar-version">
            Version {version}
          </span>

        </div>

      </div>

      {/* CLUSTER */}

      <div className="sidebar-cluster">

        <div className="cluster-top">

          <span>
            КЛАСТЕР
          </span>

          <div
            className="cluster-add-link"
            onClick={onAddCluster}
          >

            + Добавить

          </div>

        </div>

        {clusters.length > 0 &&
          currentCluster ? (

          <div className="cluster-row">

            <div className="cluster-dropdown-wrapper">

              {/* SELECTED */}

              <button
                className={`cluster-selected ${
                  isClusterOpen ? 'open' : ''
                } ${
                  clusters.length <= 1
                    ? 'single'
                    : ''
                }`}
                onClick={() => {

                  if (clusters.length > 1) {

                    setIsClusterOpen(
                      !isClusterOpen
                    );
                  }
                }}
              >

                <div className="cluster-selected-left">

                  <div
                    className={`cluster-status-dot ${
                      currentCluster?.id
                        ? 'connected'
                        : 'unknown'
                    }`}
                  />

                  <span className="cluster-selected-name">

                    {currentCluster.name}

                  </span>

                </div>

                {clusters.length > 1 && (

                  <div className="cluster-chevron">

                    {isClusterOpen ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}

                  </div>

                )}

              </button>

              {/* DROPDOWN */}

              {isClusterOpen &&
                clusters.length > 1 && (

                <div className="cluster-dropdown">

                  {clusters
                    .filter(cluster => cluster.id !== currentCluster.id)
                    .map(cluster => (

                    <div
                      key={cluster.id}
                      className={`cluster-dropdown-item ${
                        currentCluster.id === cluster.id
                          ? 'active'
                          : ''
                      }`}
                      onClick={() => {

                        changeCluster(cluster);

                        setIsClusterOpen(false);
                      }}
                    >

                      <div
                        className={`cluster-status-dot ${
                          currentCluster.id === cluster.id
                            ? 'connected'
                            : (
                              cluster?.connectionStatus ||
                              'unknown'
                            )
                        }`}
                      />

                      <span>

                        {cluster.name}

                      </span>

                    </div>

                  ))}

                </div>

              )}

            </div>

            <button
              className="cluster-settings-btn"
              title="Cluster settings"
              onClick={onEditCluster}
            >

              <FiSettings />

            </button>

          </div>

        ) : (

          <div className="no-cluster-card">

            {t('noActiveCluster')}

          </div>

        )}

      </div>

      {/* NAVIGATION */}

      {clusters.length > 0 &&
        currentCluster && (

        <nav className="sidebar-nav">

          <NavLink
            to="/"
            end
            className="sidebar-link"
          >

            <FiHome />

            <span>
              {t('overview')}
            </span>

          </NavLink>

          <NavLink
            to="/topics"
            className="sidebar-link"
          >

            <FiLayers />

            <span>
              {t('topics')}
            </span>

          </NavLink>

          <NavLink
            to="/groups"
            className="sidebar-link"
          >

            <FiUsers />

            <span>
              {t('consumerGroups')}
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
              {t('searchMessages')}
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

          <NavLink
            to="/settings"
            className="sidebar-link"
          >

            <FiSettings />

            <span>
              {t('settings')}
            </span>

          </NavLink>

        </nav>
      )}

      {/* FOOTER */}

      <div className="sidebar-footer">

        <a
          href="https://github.com/Egorich88/kafka-system-control-4"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-project-link"
        >

          <img
            src="/github-mark-white.svg"
            alt="GitHub"
            className="footer-github-logo"
          />

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

    </aside>
  );
}