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
 * @fileoverview Панель со списком брокеров Kafka-кластера.
 * Отображает таблицу: ID, адрес, статус (онлайн), признак контроллера.
 * Данные приходят с бэкенда через API.
 */

/**
 * Компонент панели брокеров.
 * @param {Object} props
 * @param {Array} props.brokers - Массив объектов брокеров.
 *   Каждый объект должен содержать поля: id (число/строка), address (строка), controller (boolean).
 */
export default function BrokersPanel({ brokers }) {
  return (
    <div className="dashboard-panel">
      <div className="panel-header">Брокеры</div>

      <div className="panel-body">
        {/* Таблица брокеров */}
        <div className="broker-table">
          {/* Заголовок таблицы */}
          <div className="broker-table-header">
            <div>ID</div>
            <div>Адрес</div>
            <div>Статус</div>
            <div>Контроллер</div>
          </div>

          {/* Список брокеров */}
          {brokers.map((broker, index) => (
            <div key={index} className="broker-table-row">
              <div>{broker.id}</div>
              <div>{broker.address}</div>
              <div className="broker-status">
                <span className="broker-status-dot" />
                Онлайн
              </div>
              <div>
                {broker.controller ? (
                  <span className="broker-controller-badge">Да</span>
                ) : (
                  <span className="broker-no-controller">Нет</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}