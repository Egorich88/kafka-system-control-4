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
 *   - Ряд 1: KPI-карточки (7 штук)
 *   - Ряд 2: Throughput (40%) | Topics (60%)
 *   - Ряд 3 + Ряд 4: Consumer Lag (60%) | Events (40%)
 *                    Brokers (60%)   |
 */

import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import '../styles/overview.css';
import Dropdown from '../components/common/Dropdown';
import { FiInfo, FiCode, FiPlus, FiStar, FiClock, FiRefreshCcw } from 'react-icons/fi';
import { useCluster } from '../contexts/ClusterContext';

import ThroughputPanel from './overview/ThroughputPanel';
import KpiCards from './overview/KpiCards';
import BrokersPanel from './overview/BrokersPanel';
import TopicsPanel from './overview/TopicsPanel';
import ConsumerLagPanel from './overview/ConsumerLagPanel';
import EventsPanel from './overview/EventsPanel';

const TIME_RANGES = [
  { id: '15m', name: 'Последние 15 минут' },
  { id: '1h', name: 'Последний час' },
  { id: '6h', name: 'Последние 6 часов' },
  { id: '24h', name: 'Последние 24 часа' }
];

const REFRESH_INTERVALS = [
  { value: 0, label: 'Выкл' },
  { value: 10, label: '10с' },
  { value: 30, label: '30с' },
  { value: 60, label: '1м' }
];

const REFRESH_ITEMS = REFRESH_INTERVALS.map(item => ({
  id: item.value,
  name: item.label
}));

export default function Overview() {
  const { currentCluster } = useCluster();

  const [overview, setOverview] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [throughputData, setThroughputData] = useState([]);
  const [messagesIn, setMessagesIn] = useState(0);
  const [messagesOut, setMessagesOut] = useState(0);
  const [timeRange, setTimeRange] = useState(TIME_RANGES[0]);
  const [loading, setLoading] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const [autoRefreshInterval, setAutoRefreshInterval] = useState(10);
  const intervalRef = useRef(null);

  const currentRefreshItem = REFRESH_ITEMS.find(item => item.id === autoRefreshInterval) || REFRESH_ITEMS[0];

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
  };

  const loadDashboard = async () => {
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

      const [overviewResponse, brokersResponse, groupsResponse, throughputResponse] = await Promise.all([
        axios.get('/api/overview', { headers }),
        axios.get('/api/overview/brokers-detailed', { headers }),  // ← НОВЫЙ API
        axios.get('/api/overview/consumer-groups', { headers }),
        axios.get(`/api/overview/throughput?range=${timeRange.id}`, { headers })
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
  };

  useEffect(() => {
    loadDashboard();
  }, [currentCluster, timeRange]);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (autoRefreshInterval > 0 && currentCluster) {
      intervalRef.current = setInterval(() => {
        loadDashboard();
      }, autoRefreshInterval * 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [autoRefreshInterval, currentCluster]);

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
              Чтобы начать работу — нажмите кнопку{' '}
              <span className="welcome-highlight">+ Добавить кластер</span> в боковом меню
            </div>
          </div>
          <div className="welcome-feature">
            <div className="welcome-icon-box"><FiCode /></div>
            <div className="welcome-feature-text">
              Проект распространяется по лицензии{' '}
              <a href="https://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer">Apache License 2.0</a>
            </div>
          </div>
          <div className="welcome-divider large" />
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
      <div className="page-header">
        <div className="page-header-text">
          <h1 className="page-title">Обзор кластера</h1>
          <div className="page-cluster-name">Кластер: {currentCluster.name}</div>
        </div>
        <div className="dashboard-toolbar">
          <div className="dashboard-time-selector">
            <FiClock />
            <Dropdown
              selectedItem={timeRange}
              items={TIME_RANGES.filter(item => item.id !== timeRange.id)}
              onSelect={setTimeRange}
            />
          </div>
          <div className="dashboard-auto-refresh">
            <Dropdown
              selectedItem={currentRefreshItem}
              items={REFRESH_ITEMS.filter(item => item.id !== autoRefreshInterval)}
              onSelect={(item) => setAutoRefreshInterval(item.id)}
            />
          </div>
          <button className="dashboard-refresh-button" onClick={loadDashboard} disabled={loading}>
            <FiRefreshCcw className={`dashboard-refresh-icon ${loading ? 'dashboard-refresh-loading' : ''}`} />
          </button>
        </div>
      </div>

      {/* Ряд 1: KPI-карточки */}
      <KpiCards
        brokers={brokers}
        overview={overview}
        consumerGroups={consumerGroups}
        messagesIn={messagesIn}
        messagesOut={messagesOut}
        underReplicated={overview?.underReplicated ?? 0}
      />

      {/* Ряд 2: Throughput (40%) | Topics (60%) */}
      <div className="dashboard-row dashboard-row-top">
        <div className="panel-throughput">
          <ThroughputPanel data={throughputData} />
        </div>
        <div className="panel-topics">
          <TopicsPanel timeRange={timeRange.id} refreshKey={refreshKey} />
        </div>
      </div>

      {/* Ряд 3 + Ряд 4: Consumer Lag + Brokers (60%) | Events (40%) */}
      <div className="dashboard-row dashboard-row-main">
        <div className="dashboard-main-left">
          <div className="panel-lag">
            <ConsumerLagPanel timeRange={timeRange.id} refreshKey={refreshKey} />
          </div>
          <div className="panel-brokers">
            <BrokersPanel brokers={brokers} refreshKey={refreshKey} />
          </div>
        </div>
        <div className="panel-events">
          <EventsPanel />
        </div>
      </div>
    </div>
  );
}