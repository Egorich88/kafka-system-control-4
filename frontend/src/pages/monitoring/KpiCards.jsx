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

/*======================================================
               KPI-КАРТОЧКИ.
  Основные показатели состояния Kafka-кластера.
  Отображаются всегда сверху страницы.
======================================================== */
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