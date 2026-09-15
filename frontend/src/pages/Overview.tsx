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
 * @fileoverview Главная страница мониторинга (Overview).
 * Отображает KPI-карточки, графики пропускной способности,
 * таблицу брокеров, отставание групп и события.
 * При смене кластера автоматически очищает все данные и загружает новые.
 * Поддерживается автообновление с выбираемым интервалом (как в Grafana).
 *
 * Структура страницы:
 *   - Ряд 1: KPI-карточки;
 *   - Ряд 2: состояние кластера | распределение партиций | Consumer rate | Producer rate;
 *   - Ряд 3: пропускная способность кластера | пропускная способность по топикам;
 *   - Ряд 4: Consumer Lag + таблица Group/Topic/Status/Lag | последние события.
 */

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import '../styles/overview.css';
import { FiInfo, FiCode, FiPlus, FiStar } from 'react-icons/fi';
import { useCluster } from '../contexts/ClusterContext';
import { useDashboardControls } from '../contexts/DashboardControlsContext';

import ThroughputPanel from './overview/ThroughputPanel';
import KpiCards from './overview/KpiCards';
import TopicsPanel from './overview/TopicsPanel';
import ConsumerLagPanel from './overview/ConsumerLagPanel';
import EventsPanel from './overview/EventsPanel';
import ClusterHealthPanel from './overview/ClusterHealthPanel';
import PartitionDistributionPanel from './overview/PartitionDistributionPanel';
import RatePanels from './overview/RatePanels';

export default function Overview(): JSX.Element {
  const { currentCluster } = useCluster();

  const [overview, setOverview] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [throughputData, setThroughputData] = useState([]);
  const [messagesIn, setMessagesIn] = useState(0);
  const [messagesOut, setMessagesOut] = useState(0);
  const { timeRange, registerRefreshHandler } = useDashboardControls();
  // Текущий backend поддерживает относительные диапазоны; абсолютный
  // диапазон уже принят frontend-контрактом и будет использован будущим источником истории.
  const apiRange = timeRange.type === 'relative' ? timeRange.id : '24h';
  const [loading, setLoading] = useState(false);
  const [clusterHealth, setClusterHealth] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);

  // ============================================================
  // Логотип приветственной страницы
  // ============================================================

  const welcomeLogo = '/logo.svg';

  const clearDashboardData = () => {
    setOverview(null);
    setBrokers([]);
    setConsumerGroups([]);
    setThroughputData([]);
    setMessagesIn(0);
    setMessagesOut(0);
    setClusterHealth(null);
  };

  const loadDashboard = useCallback(async () => {
    if (!currentCluster) return;
    setLoading(true);
    clearDashboardData();

    try {
      const bootstrap = currentCluster.brokers || currentCluster.bootstrapServers;
      if (!bootstrap) {
        console.error('Не указаны брокеры для кластера', currentCluster);
        setLoading(false);
        return;
      }

      const headers = { 'X-Kafka-Bootstrap': bootstrap };

      const throughputQuery = timeRange.type === 'relative'
        ? `range=${timeRange.id}`
        : `range=${apiRange}&from=${encodeURIComponent(timeRange.from)}&to=${encodeURIComponent(timeRange.to)}`;

      const [overviewResponse, brokersResponse, groupsResponse, throughputResponse] = await Promise.all([
        axios.get('/api/overview', { headers }),
        axios.get('/api/overview/brokers-detailed', { headers }),  // ← НОВЫЙ API
        axios.get('/api/overview/consumer-groups', { headers }),
        axios.get(`/api/overview/throughput?${throughputQuery}`, { headers })
      ]);

      setOverview(overviewResponse.data);
      setBrokers(brokersResponse.data.brokers || []);
      setConsumerGroups(groupsResponse.data.groups || []);

      const points = throughputResponse.data.points || [];
      setThroughputData(points);
      const latestPoint = points[points.length - 1];
      setMessagesIn(latestPoint?.incoming || 0);
      setMessagesOut(latestPoint?.outgoing || 0);

      setRefreshKey(prev => prev + 1);

    } catch (error) {
      console.error('Ошибка загрузки дашборда:', error);
    } finally {
      setLoading(false);
    }
  }, [currentCluster, timeRange, apiRange]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    registerRefreshHandler(loadDashboard);
    return () => registerRefreshHandler(null);
  }, [loadDashboard, registerRefreshHandler]);

  if (!currentCluster) {
    return (
      <div className="welcome-page">
        <div className="welcome-card">
          <div className="welcome-logo-wrap">
            <img src={welcomeLogo} alt="Kafka System Control" className="welcome-logo" />
          </div>

          <p className="welcome-subtitle">
              KAFKA SYSTEM CONTROL
          </p>

          <div className="welcome-feature">
            <div className="welcome-icon-box"><FiInfo /></div>
            <div className="welcome-feature-text">
              Современный интерфейс для работы с{' '}
              <a href="https://kafka.apache.org/" target="_blank" rel="noreferrer">Apache Kafka</a>
            </div>
          </div>
          <div className="welcome-feature">
            <div className="welcome-icon-box"><FiPlus /></div>
            <div className="welcome-feature-text">
              Чтобы начать работу — нажмите{' '}
              <span className="welcome-highlight">+ Добавить кластер</span>
            </div>
          </div>
          <div className="welcome-feature">
            <div className="welcome-icon-box"><FiCode /></div>
            <div className="welcome-feature-text">
              Проект распространяется по лицензии{' '}
              <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer">Apache License 2.0</a>
            </div>
          </div>
          <a href="https://github.com/Egorich88/kafka-system-control-4" target="_blank" rel="noreferrer" className="welcome-github">
            <FiStar className="welcome-github-icon" />
            <span>Поддержите проект на GitHub</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">

      {/* Ряд 1: KPI-карточки */}
      <KpiCards
        brokers={brokers}
        overview={overview}
        consumerGroups={consumerGroups}
        messagesIn={messagesIn}
        messagesOut={messagesOut}
        underReplicated={overview?.underReplicated ?? 0}
      />

      {/* Ряд 2: фактическое состояние Kafka | распределение партиций | rates */}
      <div className="dashboard-row dashboard-row-status">
        <ClusterHealthPanel
          refreshKey={refreshKey}
          onData={setClusterHealth}
        />
        <PartitionDistributionPanel data={clusterHealth} />
        <RatePanels data={throughputData} />
      </div>

      {/* Ряд 3: существующие панели throughput — без изменения назначения */}
      <div className="dashboard-row dashboard-row-top">
        <div className="panel-throughput">
          <ThroughputPanel data={throughputData} />
        </div>
        <div className="panel-topics">
          <TopicsPanel timeRange={apiRange} refreshKey={refreshKey} />
        </div>
      </div>

      {/* Ряд 4: Consumer Lag + таблица | Последние события */}
      <div className="dashboard-row dashboard-row-main">
        <div className="panel-lag">
          <ConsumerLagPanel
            timeRange={apiRange}
            refreshKey={refreshKey}
          />
        </div>
        <div className="panel-events">
          <EventsPanel refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}