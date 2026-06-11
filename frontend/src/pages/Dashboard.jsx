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

import { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/dashboard.css';
import Dropdown from '../components/common/Dropdown';
import { FiInfo, FiCode, FiPlus, FiStar, FiClock, FiRotateCw } from 'react-icons/fi';
import { useCluster } from '../contexts/ClusterContext';

// Импорты вынесенных панелей
import ThroughputPanel from './monitoring/ThroughputPanel';
import KpiCards from './monitoring/KpiCards';
import BrokersPanel from './monitoring/BrokersPanel';
import TopicsPanel from './monitoring/TopicsPanel';
import ConsumerLagPanel from './monitoring/ConsumerLagPanel';
import EventsPanel from './monitoring/EventsPanel';

// Доступные интервалы времени для графика
const TIME_RANGES = [
  { id: '15m', name: 'Последние 15 минут' },
  { id: '1h', name: 'Последний час' },
  { id: '6h', name: 'Последние 6 часов' },
  { id: '24h', name: 'Последние 24 часа' }
];

// Временные данные для графика пропускной способности (заглушка)
const THROUGHPUT_DATA = {
  '15m': [
    { time: '00', incoming: 120, outgoing: 100 },
    { time: '05', incoming: 240, outgoing: 180 },
    { time: '10', incoming: 430, outgoing: 390 },
    { time: '15', incoming: 610, outgoing: 570 }
  ],
  '1h': [
    { time: '00', incoming: 120, outgoing: 100 },
    { time: '15', incoming: 260, outgoing: 240 },
    { time: '30', incoming: 430, outgoing: 390 },
    { time: '45', incoming: 700, outgoing: 640 },
    { time: '60', incoming: 620, outgoing: 590 }
  ],
  '6h': [
    { time: '01h', incoming: 200, outgoing: 180 },
    { time: '02h', incoming: 320, outgoing: 280 },
    { time: '03h', incoming: 580, outgoing: 520 },
    { time: '04h', incoming: 720, outgoing: 690 },
    { time: '05h', incoming: 640, outgoing: 600 },
    { time: '06h', incoming: 800, outgoing: 760 }
  ],
  '24h': [
    { time: '04', incoming: 250, outgoing: 200 },
    { time: '08', incoming: 420, outgoing: 390 },
    { time: '12', incoming: 800, outgoing: 760 },
    { time: '16', incoming: 680, outgoing: 630 },
    { time: '20', incoming: 530, outgoing: 500 },
    { time: '24', incoming: 910, outgoing: 870 }
  ]
};

export default function Dashboard() {
  const { currentCluster } = useCluster();

  // Состояния с данными от API
  const [overview, setOverview] = useState(null);      // общая информация о кластере
  const [brokers, setBrokers] = useState([]);          // список брокеров
  const [consumerGroups, setConsumerGroups] = useState([]); // группы потребителей

  // Заглушки для будущих метрик
  const [messagesIn] = useState(0);
  const [messagesOut] = useState(0);
  const [underReplicated] = useState(0);

  // Выбранный временной диапазон для графика
  const [timeRange, setTimeRange] = useState(TIME_RANGES[0]);

  // Данные графика для выбранного периода
  const chartData = THROUGHPUT_DATA[timeRange.id] || [];

  // Загрузка данных при смене кластера
  useEffect(() => {
    if (!currentCluster) return;
    loadDashboard();
  }, [currentCluster]);

  // Функция загрузки данных с бэкенда
  async function loadDashboard() {
    try {
      const headers = { 'X-Kafka-Bootstrap': currentCluster.bootstrapServers };
      const [overviewResponse, brokersResponse, groupsResponse] = await Promise.all([
        axios.get('/api/dashboard/overview', { headers }),
        axios.get('/api/dashboard/brokers', { headers }),
        axios.get('/api/dashboard/consumer-groups', { headers })
      ]);
      setOverview(overviewResponse.data);
      setBrokers(brokersResponse.data.brokers || []);
      setConsumerGroups(groupsResponse.data.groups || []);
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
  }

  // Рендер основной панели, если кластер выбран
  if (currentCluster) {
    return (
      <div className="dashboard-container">
        {/* Верхняя панель: заголовок, выбор периода, кнопка обновления */}
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
            <button className="dashboard-refresh-button" onClick={loadDashboard}>
              <FiRotateCw className="dashboard-refresh-icon" />
            </button>
          </div>
        </div>

        {/* Блок KPI-карточек */}
        <KpiCards
          brokers={brokers}
          overview={overview}
          consumerGroups={consumerGroups}
          messagesIn={messagesIn}
          messagesOut={messagesOut}
          underReplicated={underReplicated}
        />

        {/* Основная сетка: график пропускной способности + таблица брокеров */}
        <div className="dashboard-main-grid">
          <ThroughputPanel data={chartData} />
          <BrokersPanel brokers={brokers} />
        </div>

        {/* Нижняя сетка: дополнительные панели (топики, lag, события) */}
        <div className="dashboard-bottom-grid">
          <TopicsPanel />
          <ConsumerLagPanel />
          <EventsPanel />
        </div>
      </div>
    );
  }

  // Приветственный экран, когда кластер не выбран
  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <div className="welcome-logo-wrap">
          <img src="/kafka-system-logo.png" alt="Kafka System Control" className="welcome-logo" />
        </div>
        <h1 className="welcome-title">Kafka System Control</h1>
        <p className="welcome-subtitle">Open-source платформа</p>
        <div className="welcome-divider-small" />

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