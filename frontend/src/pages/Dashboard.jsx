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
/*
==================================================
Компоненты библиотеки Recharts

Используются для построения графиков
мониторинга Kafka-кластера.

ResponsiveContainer
- автоматически растягивает график
  по размеру панели

LineChart
- основной контейнер графика

Line
- отдельная линия метрики

XAxis
- ось времени

YAxis
- ось значений

Tooltip
- всплывающая подсказка
  при наведении мыши

CartesianGrid
- сетка графика в стиле Grafana
==================================================
*/
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

import {
  FiInfo,
  FiCode,
  FiPlus,
  FiStar,

  /* KPI карточки */
  FiServer,
  FiLayers,
  FiGrid,
  FiUsers,


  /* Входящий поток */
  FiArrowDown,

  /* Исходящий поток */
  FiArrowUp,

  /* Under Replicated */
  FiAlertTriangle,

  /* Панель управления */
  FiClock,
  FiRotateCw
} from 'react-icons/fi';

import { useCluster } from '../contexts/ClusterContext';

/*
==================================================
Периоды отображения Dashboard

Используются для выбора диапазона
отображения метрик и графиков.
==================================================
*/
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


/*
==================================================
Временные данные графика

Используются до подключения
реальных метрик Kafka.

После реализации Monitoring API
будут заменены ответом backend.
==================================================
*/
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

/*
==================================================
Пользовательский Tooltip графика

Отображает подробную информацию
о точке графика при наведении.

Используется вместо стандартного
Tooltip библиотеки Recharts.
==================================================
*/
function ThroughputTooltip({
  active, /* Показывает наведен ли курсор.*/
  payload, /* Значения точки графика.*/
  label /* Метка временной оси */
}) {

  if (
    !active ||
    !payload ||
    !payload.length
  ) {
    return null;
  }

  return (

    <div className="throughput-tooltip">

      <div className="throughput-tooltip-title">

        Время: {label}

      </div>

      <div className="throughput-tooltip-row">

        Входящие сообщения:

        <strong>
          {payload[0].value} msg/s
        </strong>

      </div>

      <div className="throughput-tooltip-row">

        Исходящие сообщения:

        <strong>
          {payload[1].value} msg/s
        </strong>

      </div>

    </div>

  );
}

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

  /*
  ==================================================
  Данные графика текущего периода

  Автоматически изменяются
  при выборе периода Dashboard.
  ==================================================
  */
  const chartData = THROUGHPUT_DATA[timeRange.id] || [];

  /*
  ==================================================
  Последняя точка графика

  Используется для отображения
  актуальных значений метрик
  в заголовке панели.
  ==================================================
  */
  const latestPoint =
    chartData[chartData.length - 1];

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

    /*
       ============================================================
       Dashboard мониторинга Kafka-кластера

       Структура страницы:

       1. Верхний ряд KPI-карточек
          - Брокеры
          - Топики
          - Партиции
          - Группы потребителей
          - Сообщения

       2. Основная область мониторинга
          - График пропускной способности кластера
          - Таблица брокеров

       3. Нижняя область
          - Топ топиков
          - Consumer Lag
          - Последние события

       Все блоки являются контейнерами для будущего
       наполнения реальными метриками Kafka.
       ============================================================
    */

    <div className="dashboard-container">

       {/* ==========================================================
           Панель управления Dashboard

           Содержит:

           - выбор периода отображения
           - ручное обновление данных

           В дальнейшем:
           15 минут
           1 час
           6 часов
           24 часа
       ========================================================== */}

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

      {/*
         ============================================================
         KPI-КАРТОЧКИ

         Основные показатели состояния Kafka-кластера.

         Отображаются всегда сверху страницы.
         ============================================================
      */}
      <div className="dashboard-kpi-grid">

        {/*
           Количество брокеров в кластере.
        */}
        <div className="kpi-card">

          <div className="kpi-header">

            <FiServer className="kpi-icon kpi-icon-blue" />

            <div className="kpi-title">
              Брокеры
            </div>

          </div>

          <div className="kpi-value">
            {brokers.length}
          </div>

          <div className="kpi-sub">
            Онлайн: {brokers.length}
          </div>

        </div>

        {/*
           Количество топиков Kafka.
        */}
        <div className="kpi-card">

          <div className="kpi-header">

            <FiLayers className="kpi-icon kpi-icon-purple" />

            <div className="kpi-title">
              Топики
            </div>

          </div>

          <div className="kpi-value">
            {overview?.topics ?? 0}
          </div>

          <div className="kpi-sub">
            Активных: {overview?.topics ?? 0}
          </div>

        </div>

        {/*
           Общее количество партиций.
        */}
        <div className="kpi-card">

          <div className="kpi-header">

            <FiGrid className="kpi-icon kpi-icon-orange" />

            <div className="kpi-title">
              Партиции
            </div>

          </div>

          <div className="kpi-value">
            {overview?.partitions ?? 0}
          </div>

          <div className="kpi-sub">
            Всего партиций
          </div>

        </div>

        {/*
           Количество Consumer Groups.
        */}
        <div className="kpi-card">

          <div className="kpi-header">

            <FiUsers className="kpi-icon kpi-icon-green" />

            <div className="kpi-title">
              Группы потребителей
            </div>

          </div>

          <div className="kpi-value">
            {consumerGroups.length}
          </div>

          <div className="kpi-sub">
            Активных групп
          </div>

        </div>



        <div className="kpi-card">

          <div className="kpi-header">

            <FiArrowDown
              className="kpi-icon kpi-icon-blue"
            />

            <div className="kpi-title">
              Входящие сообщения
            </div>

          </div>

          <div className="kpi-value">

            {messagesIn}

          </div>

          <div className="kpi-sub">

            сообщений/сек

          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-header">

            <FiArrowUp
              className="kpi-icon kpi-icon-purple"
            />

            <div className="kpi-title">
              Исходящие сообщения
            </div>

          </div>

          <div className="kpi-value">

            {messagesOut}

          </div>

          <div className="kpi-sub">

            сообщений/сек

          </div>

        </div>

        <div className="kpi-card">

          <div className="kpi-header">

            <FiAlertTriangle
              className="kpi-icon kpi-icon-red"
            />

            <div className="kpi-title">
              Недореплицированные
            </div>

          </div>

          <div className="kpi-value">

            {underReplicated}

          </div>

          <div className="kpi-sub">

            проблемных партиций

          </div>

        </div>


      </div>
      {/*
         ============================================================
         ОСНОВНАЯ ОБЛАСТЬ DASHBOARD

         Левая панель:
         график нагрузки кластера.

         Правая панель:
         таблица брокеров.
         ============================================================
      */}
      <div className="dashboard-main-grid">

        {/* ==========================================================
            График пропускной способности Kafka-кластера

            Отображает:

            - входящие сообщения в секунду
            - исходящие сообщения в секунду

            Временной диапазон выбирается
            через панель управления Dashboard.

            В дальнейшем данные будут
            поступать из Kafka Monitoring API.

        ========================================================== */}
        <div className="dashboard-panel">

          <div className="panel-header">

            <div>

              <div>
                Пропускная способность кластера
              </div>

              <div className="throughput-current-values">

                <span className="incoming-value">
                  Входящие: {latestPoint?.incoming ?? 0} msg/s
                </span>

                <span className="outgoing-value">
                  Исходящие: {latestPoint?.outgoing ?? 0} msg/s
                </span>

              </div>

            </div>

            <div className="throughput-legend">

              <div className="throughput-legend-item">

                <span
                  className="throughput-legend-dot incoming"
                />

                Входящие сообщения

              </div>

              <div className="throughput-legend-item">

                <span
                  className="throughput-legend-dot outgoing"
                />

                Исходящие сообщения

              </div>

            </div>

          </div>

          <div className="panel-body throughput-chart">

            <ResponsiveContainer
              width="100%"
              height={260}
            >
              {/* ==========================================================
                  Настройка осей графика

                  XAxis
                  - временная шкала

                  YAxis
                  - количество сообщений

                  Стилизация выполнена
                  в стиле Grafana.

              ========================================================== */}
              <LineChart data={chartData}>

                {/* Сетка графика */}
                <CartesianGrid
                  stroke="var(--border-color)"
                  strokeDasharray="4 4"
                />

                {/* Цвет текста временной шкалы */}
                <XAxis
                  dataKey="time"
                  tick={{
                    fill: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                  tickLine={false}
                  axisLine={false}
                />

                {/* Левая шкала значений */}
                <YAxis
                  tick={{
                    fill: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                  tickLine={false}
                  axisLine={false}
                />
                {/* ==========================================================
                    Подсказка графика

                    Отображает значения метрик
                    при наведении курсора мыши.

                    Стилизована под общий интерфейс
                    Kafka System Control и Grafana.
                ========================================================== */}
                <Tooltip
                  content={<ThroughputTooltip />}
                  cursor={{
                    stroke: '#3b82f6',
                    strokeWidth: 1,
                    strokeDasharray: '4 4'
                  }}
                />
                {/* Линия входящего трафика */}
                <Line
                  type="natural"
                  dataKey="incoming"
                  name="Входящие сообщения"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                />
                {/* Линия исходящего трафика */}
                <Line
                  type="natural"
                  dataKey="outgoing"
                  name="Исходящие сообщения"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/*
           Таблица брокеров Kafka-кластера.
        */}
        <div className="dashboard-panel">

          <div className="panel-header">
            Брокеры
          </div>

          <div className="panel-body">

            {/* Таблица брокеров Kafka */}
            <div className="broker-table">

              {/* Заголовок таблицы */}
              <div className="broker-table-header">

                {/* Идентификатор брокера */}
                <div>ID</div>

                {/* Адрес подключения */}
                <div>Адрес</div>

                {/* Состояние брокера */}
                <div>Статус</div>

                {/* Является ли брокер контроллером */}
                <div>Контроллер</div>

              </div>

              {/* Список брокеров */}
              {
                brokers.map((broker, index) => (

                  <div
                    key={index}
                    className="broker-table-row"
                  >

                    {/* Идентификатор брокера */}
                    <div>
                      {broker.id}
                    </div>

                    {/* Адрес подключения */}
                    <div>
                      {broker.address}
                    </div>

                    {/* Статус брокера */}
                    <div className="broker-status">

                      <span className="broker-status-dot" />

                      Онлайн

                    </div>

                    {/* Признак контроллера Kafka */}
                    <div>

                      {
                        broker.controller
                          ? (
                              <span className="broker-controller-badge">
                                Да
                              </span>
                            )
                          : (
                              <span className="broker-no-controller">
                                Нет
                              </span>
                            )
                      }

                    </div>

                  </div>

                ))
              }

            </div>

          </div>

        </div>

      </div>

      {/*
         ============================================================
         НИЖНЯЯ ОБЛАСТЬ DASHBOARD

         Содержит дополнительные панели мониторинга.

         Будут реализованы позднее.
         ============================================================
      */}
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

        {/*
           Последние события Kafka-кластера.

           В будущем здесь будут отображаться:

           - создание топиков
           - удаление топиков
           - подключение брокеров
           - смена контроллера
           - ошибки кластера
        */}
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