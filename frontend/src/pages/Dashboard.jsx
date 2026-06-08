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
import {
  FiInfo,
  FiCode,
  FiPlus,
  FiStar,
  FiServer,
  FiLayers,
  FiGrid,
  FiUsers,
  FiMail
} from 'react-icons/fi';

import { useCluster } from '../contexts/ClusterContext';

export default function Dashboard() {

  const { currentCluster } = useCluster();

  /* Отладка текущего кластера */
  console.log( "CURRENT CLUSTER:", currentCluster );

  /* Данные мониторинга кластера */
  const [overview, setOverview] = useState(null);
  const [brokers, setBrokers] = useState([]);
  const [consumerGroups, setConsumerGroups] = useState([]);
  const [messagesTotal, setMessagesTotal] = useState(0);

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
        groupsResponse,
        messagesResponse
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
        ),

        axios.get(
          '/api/dashboard/messages-total',
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

      setMessagesTotal(
        messagesResponse.data.total || 0
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

            <FiServer className="kpi-icon" />

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

            <FiLayers className="kpi-icon" />

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

            <FiGrid className="kpi-icon" />

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

            <FiUsers className="kpi-icon" />

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

        {/*
           Общее количество сообщений,
           найденных в кластере.
        */}
        <div className="kpi-card">

          <div className="kpi-header">

            <FiMail className="kpi-icon" />

            <div className="kpi-title">
              Сообщения
            </div>

          </div>

          <div className="kpi-value">
            {messagesTotal}
          </div>

          <div className="kpi-sub">
            Всего сообщений
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

        {/*
           График пропускной способности кластера.

           В дальнейшем здесь будет отображаться:

           - входящий поток сообщений
           - исходящий поток сообщений
           - сообщения в секунду
           - сообщения в минуту
        */}
        <div className="dashboard-panel">

          <div className="panel-header">
            Пропускная способность кластера
          </div>

          <div className="panel-body">

            {/*
               Временная заглушка до реализации графика.
            */}
            График входящих и исходящих сообщений

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

            {
              brokers.map((broker, index) => (

                <div
                  key={index}
                  className="broker-row"
                >

                  {/*
                     ID брокера и адрес подключения.
                  */}
                  {broker.id}
                  {" — "}
                  {broker.address}

                  {/*
                     Отметка текущего контроллера кластера.
                  */}
                  {
                    broker.controller
                      ? " (Контроллер)"
                      : ""
                  }

                </div>
              ))
            }

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