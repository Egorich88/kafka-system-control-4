 /*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import {
  FiInfo,
  FiCode,
  FiPlus,
  FiStar
} from 'react-icons/fi';

import { useCluster } from '../contexts/ClusterContext';

export default function Dashboard() {

  const { currentCluster } = useCluster();

  if (currentCluster) {

    return (

      <div className="overview-page">

        <div className="overview-card">

          <h1>Обзор кластера</h1>

          <p>
            Здесь будет отображаться мониторинг Kafka-кластера.
          </p>

        </div>

      </div>
    );
  }

  return (

    <div className="welcome-page">

      <div className="welcome-card">

        <div className="welcome-logo-wrap">

          <img
            src="/kafka-system-logo.png"
            alt="Kafka System Control"
            className="welcome-logo"
          />

        </div>

        <h1 className="welcome-title">
          Kafka System Control
        </h1>

        <p className="welcome-subtitle">

          Open-source платформа

        </p>

        <div className="welcome-divider-small" />

        {/* INFO */}

        <div className="welcome-feature">

          <div className="welcome-icon-box">

            <FiInfo />

          </div>

          <div className="welcome-feature-text">

            Современный интерфейс для работы с{' '}

            <a
              href="https://kafka.apache.org/"
              target="_blank"
              rel="noreferrer"
            >
              Apache Kafka
            </a>

          </div>

        </div>

        {/* ADD */}

        <div className="welcome-feature">

          <div className="welcome-icon-box">

            <FiPlus />

          </div>

          <div className="welcome-feature-text">

            Чтобы начать работу — добавьте кластер
            через кнопку{' '}

            <span className="welcome-highlight">
              + Добавить
            </span>

            {' '}в боковом меню

          </div>

        </div>

        {/* LICENSE */}

        <div className="welcome-feature">

          <div className="welcome-icon-box">

            <FiCode />

          </div>

          <div className="welcome-feature-text">

            Проект распространяется по лицензии{' '}

            <a
              href="https://www.apache.org/licenses/LICENSE-2.0"
              target="_blank"
              rel="noreferrer"
            >
              Apache License 2.0
            </a>

          </div>

        </div>

        <div className="welcome-divider large" />

        <a
          href="https://github.com/Egorich88/kafka-system-control-4"
          target="_blank"
          rel="noreferrer"
          className="welcome-github"
        >

          <FiStar className="welcome-github-icon" />

          <span>
            Поддержите проект на GitHub
          </span>

        </a>

      </div>

    </div>
  );
}