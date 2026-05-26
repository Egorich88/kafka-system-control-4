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

import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import packageJson from '../../../package.json';

import { useTranslation } from 'react-i18next';
import { useCluster } from '../../contexts/ClusterContext';

export default function Sidebar({

  onAddCluster,
  onEditCluster

}) {

  const { t } = useTranslation();

  const {
    clusters,
    currentCluster,
    changeCluster
  } = useCluster();

  const [isClusterOpen, setIsClusterOpen] =
    useState(false);

  const version =
    packageJson.version;

  const hasCluster =
    clusters.length > 0 &&
    currentCluster;

  return (

    <aside className="sidebar">

      {/* ========================= HEADER ========================= */}

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

          {hasCluster ? (

            <div className="cluster-row">

              <div className="cluster-dropdown-wrapper">

                {/* SELECTED */}

                <button
                  type="button"
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
                      .filter(
                        cluster =>
                          cluster.id !== currentCluster.id
                      )
                      .map(cluster => (

                      <div
                        key={cluster.id}
                        className="cluster-dropdown-item"
                        onClick={() => {

                          changeCluster(cluster);

                          setIsClusterOpen(false);
                        }}
                      >

                        <div
                          className={`cluster-status-dot ${
                            cluster?.connectionStatus ||
                            'unknown'
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

              <FiSettings
                className="cluster-settings-icon"
                title="Настройки кластера"
                onClick={onEditCluster}
              />

            </div>

          ) : (

            <div className="no-cluster-card">

              Нет подключенного кластера

            </div>

          )}

        </div>

        {/* ========================= NAVIGATION ========================= */}

        <nav className="sidebar-nav">

          <NavLink
            to="/"
            end
            className="sidebar-link"
          >

            <FiHome />

            <span>
              Главная
            </span>

          </NavLink>

          <NavLink
            to="/topics"
            className={`sidebar-link ${
              !hasCluster ? 'disabled' : ''
            }`}
          >

            <FiLayers />

            <span>
              Топики
            </span>

          </NavLink>

          <NavLink
            to="/groups"
            className={`sidebar-link ${
              !hasCluster ? 'disabled' : ''
            }`}
          >

            <FiUsers />

            <span>
              Консьюмеры
            </span>

          </NavLink>

          <NavLink
            to="/offset-reset"
            className={`sidebar-link ${
              !hasCluster ? 'disabled' : ''
            }`}
          >

            <FiRotateCcw />

            <span>
              Сброс оффсетов
            </span>

          </NavLink>

          <NavLink
            to="/search"
            className={`sidebar-link ${
              !hasCluster ? 'disabled' : ''
            }`}
          >

            <FiSearch />

            <span>
              Поиск сообщений
            </span>

          </NavLink>

          <NavLink
            to="/acls"
            className={`sidebar-link ${
              !hasCluster ? 'disabled' : ''
            }`}
          >

            <FiShield />

            <span>
              ACL
            </span>

          </NavLink>

          <NavLink
            to="/alerts"
            className={`sidebar-link ${
              !hasCluster ? 'disabled' : ''
            }`}
          >

            <FiAlertTriangle />

            <span>
              Оповещения
            </span>

          </NavLink>

          <NavLink
            to="/logs"
            className={`sidebar-link ${
              !hasCluster ? 'disabled' : ''
            }`}
          >

            <FiFileText />

            <span>
              Логи
            </span>

          </NavLink>

        </nav>

      </div>

      {/* ========================= BOTTOM ========================= */}

      <div className="sidebar-bottom">

        {/* SETTINGS */}

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

        {/* FOOTER */}

        <div className="sidebar-footer">

          <a
            href="https://github.com/Egorich88/kafka-system-control-4"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-project-link"
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