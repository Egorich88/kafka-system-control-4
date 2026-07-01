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
 * Отображает таблицу: ID, адрес, статус (онлайн), признак контроллера, версия.
 * Данные приходят с бэкенда через API.
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useCluster } from '../../contexts/ClusterContext';

export default function BrokersPanel({ brokers: initialBrokers }) {
  const { currentCluster } = useCluster();
  const [brokers, setBrokers] = useState(initialBrokers || []);
  const [loading, setLoading] = useState(false);

  // Загружаем детальную информацию о брокерах
  useEffect(() => {
    const loadBrokers = async () => {
      if (!currentCluster) return;
      setLoading(true);
      try {
        const headers = {
          'X-Kafka-Bootstrap': currentCluster.brokers || currentCluster.bootstrapServers
        };
        const response = await axios.get('/api/overview/brokers-detailed', { headers });
        setBrokers(response.data.brokers || []);
      } catch (err) {
        console.error('Ошибка загрузки брокеров:', err);
        // Если новый API не работает, используем переданные данные
        setBrokers(initialBrokers || []);
      } finally {
        setLoading(false);
      }
    };

    // Если есть initialBrokers, используем их, но потом обновляем
    if (initialBrokers && initialBrokers.length > 0) {
      setBrokers(initialBrokers);
    }
    loadBrokers();
  }, [currentCluster]);

  if (loading && brokers.length === 0) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="brokers-panel-title">Брокеры</div>
        </div>
        <div className="panel-body brokers-placeholder">
          Загрузка брокеров...
        </div>
      </div>
    );
  }

  if (brokers.length === 0 && !loading) {
    return (
      <div className="dashboard-panel">
        <div className="panel-header">
          <div className="brokers-panel-title">Брокеры</div>
        </div>
        <div className="panel-body brokers-placeholder">
          Нет доступных брокеров
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-panel">
      <div className="panel-header">
        <div className="brokers-panel-title">Брокеры</div>
        <div className="brokers-panel-count">
          {brokers.length} {brokers.length === 1 ? 'брокер' : brokers.length < 5 ? 'брокера' : 'брокеров'}
        </div>
      </div>

      <div className="panel-body">
        <div className="broker-table">
          {/* Заголовок таблицы - нормальная шапка */}
          <div className="broker-table-header">
            <div className="col-id">ID</div>
            <div className="col-address">Адрес</div>
            <div className="col-status">Статус</div>
            <div className="col-controller">Контроллер</div>
            <div className="col-version">Версия</div>
          </div>

          {/* Список брокеров */}
          {brokers.map((broker) => (
            <div key={broker.id} className="broker-table-row">
              <div className="col-id broker-id">{broker.id}</div>
              <div className="col-address broker-address">{broker.address}</div>
              <div className="col-status">
                <span className="broker-status">
                  <span className="broker-status-dot" />
                  Онлайн
                </span>
              </div>
              <div className="col-controller">
                {broker.controller ? (
                  <span className="broker-controller-badge">Контроллер</span>
                ) : (
                  <span className="broker-no-controller">—</span>
                )}
              </div>
              <div className="col-version">
                <span className="broker-version">
                  {broker.version || '2.8.0'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}