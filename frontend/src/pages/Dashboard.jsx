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
import {
  FiInfo,
  FiCode,
  FiPlus,
  FiStar,

  /* Панель управления */
  FiClock,
  FiRotateCw
} from 'react-icons/fi';

import { useCluster } from '../contexts/ClusterContext';
import ThroughputPanel from './monitoring/ThroughputPanel';
import KpiCards from './monitoring/KpiCards';
import BrokersPanel from './monitoring/BrokersPanel';

/* Периоды отображения Dashboard. Используются для выбора диапазона отображения метрик и графиков. */
const TIME_RANGES = [

  {
    id: '15m',
    name: 'Последние 15 минут'
  },

  {
    id: '1h',
    name: 'Последний час'
  },

  {
    id: '6h',
    name: 'Последние 6 часов'
  },

  {
    id: '24h',
    name: 'Последние 24 часа'
  }
];


/* Временные данные графика. Используются до подключения реальных метрик Kafka.
После реализации Monitoring API будут заменены ответом backend. */
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

  /* Отладка текущего кластера */
  console.log( "CURRENT CLUSTER:", currentCluster );

  /* Данные мониторинга кластера */
  const [overview, setOverview] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [consumerGroups, setConsumerGroups] = useState([]);

  /* Входящие сообщения в секунду */
  const [messagesIn] = useState(0);

  /* Исходящие сообщения в секунду */
  const [messagesOut] = useState(0);

  /* Недореплицированные партиции */
  const [underReplicated] = useState(0);

  /* Период отображения */
  const [timeRange, setTimeRange] = useState(TIME_RANGES[0]);

  /* Отображаемые линии графика.Позволяет временно скрывать отдельные метрики */
  const [showIncoming, setShowIncoming] =
    useState(true);
  const [showOutgoing, setShowOutgoing] =
    useState(true);

  /* Данные графика текущего периода
  Автоматически изменяются при выборе периода Dashboard. */
  const chartData = THROUGHPUT_DATA[timeRange.id] || [];

  /* Загрузка данных мониторинга */
  useEffect(() => {

    if (!currentCluster) {
      return;
    }

    loadDashboard();
  }, [currentCluster]);

  /* Загружает данные Dashboard */
  async function loadDashboard() {

    try {

      const headers = {
        'X-Kafka-Bootstrap':
          currentCluster.bootstrapServers
      };

      const [
        overviewResponse,
        brokersResponse,
        groupsResponse
      ] = await Promise.all([

        axios.get(
          '/api/dashboard/overview',
          { headers }
        ),

        axios.get(
          '/api/dashboard/brokers',
          { headers }
        ),

        axios.get(
          '/api/dashboard/consumer-groups',
          { headers }
        )
      ]);

      setOverview(
        overviewResponse.data
      );

      setBrokers(
        brokersResponse.data.brokers || []
      );

      setConsumerGroups(
        groupsResponse.data.groups || []
      );


    } catch (error) {

      /* Полная информация об ошибке Dashboard */
      console.error( 'Dashboard load error:', error );

      console.error( 'Dashboard response:', error.response?.data );

      console.error( 'Dashboard status:', error.response?.status );
    }
  }

  if (currentCluster) {

    return (

    <div className="dashboard-container">

       {/* ======================================================
           Заголовок страницы Dashboard
       ====================================================== */}
       <div className="page-header">

         {/* Левая часть */}
         <div className="page-header-text">

           <h1 className="page-title">
             Обзор кластера
           </h1>

           <div className="page-cluster-name">
             Кластер: {currentCluster.name}
           </div>

         </div>

         {/* Правая часть */}
         <div className="dashboard-toolbar">

           {/* Выбор периода */}
           <div className="dashboard-time-selector">

             <FiClock />

             <Dropdown
               selectedItem={timeRange}
               items={
                 TIME_RANGES.filter(
                   item => item.id !== timeRange.id
                 )
               }
               onSelect={setTimeRange}
             />

           </div>

           {/* Обновление Dashboard */}
           <button
             className="dashboard-refresh-button"
             onClick={loadDashboard}
           >
             <FiRotateCw className="dashboard-refresh-icon" />
           </button>

         </div>

       </div>

      {/* KPI карточки */}
      <KpiCards
        brokers={brokers}
        overview={overview}
        consumerGroups={consumerGroups}
        messagesIn={messagesIn}
        messagesOut={messagesOut}
        underReplicated={underReplicated}
      />

      {/* ОСНОВНАЯ ОБЛАСТЬ DASHBOARD

         Левая панель:
         график нагрузки кластера.

         Правая панель:
         таблица брокеров. */}
      <div className="dashboard-main-grid">
        <ThroughputPanel
          data={chartData}
          showIncoming={showIncoming}
          showOutgoing={showOutgoing}
          onToggleIncoming={() => setShowIncoming(!showIncoming)}
          onToggleOutgoing={() => setShowOutgoing(!showOutgoing)}
        />
        <BrokersPanel brokers={brokers} />
      </div>

      {/* НИЖНЯЯ ОБЛАСТЬ DASHBOARD

         Содержит дополнительные панели мониторинга.
         Будут реализованы позднее. */}
      <div className="dashboard-bottom-grid">

        {/*
           Топ топиков по активности.
        */}
        <div className="dashboard-panel">

          <div className="panel-header">
            Самые активные топики
          </div>

          <div className="panel-body">

            Таблица будет реализована позже

          </div>

        </div>

        {/*
           Топ Consumer Groups по величине Lag.
        */}
        <div className="dashboard-panel">

          <div className="panel-header">
            Отставание групп потребителей
          </div>

          <div className="panel-body">

            Таблица будет реализована позже

          </div>

        </div>

        {/* Последние события Kafka-кластера.

           В будущем здесь будут отображаться:
           - создание топиков
           - удаление топиков
           - подключение брокеров
           - смена контроллера
           - ошибки кластера */}
        <div className="dashboard-panel">

          <div className="panel-header">
            Последние события
          </div>

          <div className="panel-body">

            Список событий будет реализован позже

          </div>

        </div>

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

            Чтобы начать работу — нажмите кнопку{' '}

            <span className="welcome-highlight">
              + Добавить кластер
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