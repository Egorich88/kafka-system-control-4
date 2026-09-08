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
 * @fileoverview Сводная панель состояния Kafka-кластера.
 *
 * Показывает фактическое состояние кластера и компактную информацию
 * по брокерам. Статус рассчитывается на бэкенде на основании доступности
 * брокеров, состояния партиций и Consumer Groups.
 */

import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiXCircle,
  FiHelpCircle,
  FiServer,
  FiGitBranch,
  FiActivity,
  FiWifi
} from 'react-icons/fi';
import PanelInfo from '../../components/common/PanelInfo';
import { useCluster } from '../../contexts/ClusterContext';

const STATUS_META = {
  healthy: {
    title: 'Кластер стабилен',
    description: 'Все контролируемые компоненты работают штатно',
    className: 'cluster-status-healthy',
    Icon: FiCheckCircle
  },
  warning: {
    title: 'Есть предупреждения',
    description: 'Кластер доступен, но обнаружены состояния, требующие внимания',
    className: 'cluster-status-warning',
    Icon: FiAlertTriangle
  },
  critical: {
    title: 'Критическое состояние',
    description: 'Обнаружена проблема, влияющая на работу кластера',
    className: 'cluster-status-critical',
    Icon: FiXCircle
  },
  unknown: {
    title: 'Состояние уточняется',
    description: 'Получение актуального состояния кластера',
    className: 'cluster-status-unknown',
    Icon: FiHelpCircle
  }
};

const formatNumber = (value) =>
  new Intl.NumberFormat('ru-RU').format(Number(value || 0));

const formatMemory = (value) =>
  value == null || Number.isNaN(Number(value)) ? '—' : `${Math.round(value)} MB`;

const formatDisk = (broker) => {
  if (broker.diskUsage == null || broker.diskTotal == null || broker.diskTotal <= 0) {
    return '—';
  }
  return `${Number(broker.diskUsage).toFixed(1)}/${Number(broker.diskTotal).toFixed(0)} GB`;
};

export default function ClusterHealthPanel({ refreshKey, onData }) {
  const { currentCluster } = useCluster();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    if (!currentCluster) return;

    setLoading(true);

    try {
      const bootstrap =
        currentCluster.brokers || currentCluster.bootstrapServers;

      const response = await axios.get('/api/overview/health', {
        headers: { 'X-Kafka-Bootstrap': bootstrap }
      });

      setData(response.data);
      onData?.(response.data);
    } catch (error) {
      console.error('Ошибка получения состояния кластера:', error);
      const fallback = {
        status: 'unknown',
        brokers: [],
        isr: { inSync: 0, total: 0 },
        offlinePartitions: 0,
        rebalancingGroups: 0,
        deadGroups: 0,
        networkProblems: 1
      };
      setData(fallback);
      onData?.(fallback);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, [currentCluster, refreshKey]);

  const meta = STATUS_META[data?.status || 'unknown'];
  const StatusIcon = meta.Icon;

  return (
    <div className={`dashboard-panel cluster-health-panel ${meta.className}`}>
      <div className="panel-header">
        <div className="panel-title-with-info">
          <PanelInfo
            title="Состояние кластера"
            description="Фактический статус рассчитывается по доступности брокеров, синхронизации ISR, offline-партициям и состоянию Consumer Groups. Сетевой показатель отражает только связность KSC с брокерами и не заменяет полноценный мониторинг сетевых метрик."
          />
          <span>Состояние кластера</span>
        </div>
      </div>

      <div className="cluster-health-body">
        <section className="cluster-status-summary">
          <div className="cluster-status-icon">
            <StatusIcon />
          </div>

          <div className="cluster-status-copy">
            <div className="cluster-status-title">{meta.title}</div>
            <div className="cluster-status-description">{meta.description}</div>
          </div>
        </section>

        <div className="cluster-health-divider" />

        <section className="cluster-health-metrics">
          <div className="cluster-health-metric">
            <FiServer />
            <span>Брокеры</span>
            <strong>
              {loading ? '—' : `${data?.onlineBrokers || 0}/${data?.brokerCount || 0}`}
            </strong>
          </div>

          <div className="cluster-health-metric">
            <FiGitBranch />
            <span>ISR</span>
            <strong>
              {loading
                ? '—'
                : `${formatNumber(data?.isr?.inSync)}/${formatNumber(data?.isr?.total)}`}
            </strong>
          </div>

          <div className="cluster-health-metric">
            <FiActivity />
            <span>Offline партиции</span>
            <strong className={data?.offlinePartitions > 0 ? 'metric-danger' : ''}>
              {loading ? '—' : formatNumber(data?.offlinePartitions)}
            </strong>
          </div>

          <div className="cluster-health-metric">
            <FiActivity />
            <span>Ребалансировка</span>
            <strong className={data?.rebalancingGroups > 0 ? 'metric-warning' : ''}>
              {loading ? '—' : formatNumber(data?.rebalancingGroups)}
            </strong>
          </div>

          <div className="cluster-health-metric">
            <FiWifi />
            <span>Связность</span>
            <strong
              className={data?.networkProblems > 0 ? 'metric-danger' : 'metric-success'}
            >
              {loading ? '—' : data?.networkProblems > 0
                ? `${data.networkProblems} проблем`
                : 'OK'}
            </strong>
          </div>
        </section>

        <div className="cluster-brokers-table-wrap">
          <div className="cluster-brokers-table-header">
            <span>ID</span>
            <span>Адрес</span>
            <span>Статус</span>
            <span>ISR</span>
            <span>Контроллер</span>
            <span>Лидеры</span>
            <span>Реплики</span>
            <span>CPU</span>
            <span>Память</span>
            <span>Диск</span>
            <span>Kafka</span>
          </div>

          {loading ? (
            <div className="cluster-broker-empty">Загрузка данных брокеров...</div>
          ) : data?.brokers?.length ? (
            data.brokers.map((broker) => (
              <div className="cluster-brokers-table-row" key={broker.id}>
                <span>{broker.id}</span>
                <span className="broker-address">{broker.address}</span>
                <span className={broker.online ? 'broker-online' : 'broker-offline'}>
                  <i />
                  {broker.online ? 'Онлайн' : 'Офлайн'}
                </span>
                <span>{formatNumber(broker.isrCount)}/{formatNumber(broker.replicaCount)}</span>
                <span>
                  {broker.controller ? (
                    <em className="broker-controller">Контроллер</em>
                  ) : '—'}
                </span>
                <span>{formatNumber(broker.leaderCount)}</span>
                <span>{formatNumber(broker.replicaCount)}</span>
                <span>{broker.cpu != null ? `${Number(broker.cpu).toFixed(1)}%` : '—'}</span>
                <span>{formatMemory(broker.memory)}</span>
                <span>{formatDisk(broker)}</span>
                <span className="broker-version">{broker.version || '—'}</span>
              </div>
            ))
          ) : (
            <div className="cluster-broker-empty">Нет доступных брокеров</div>
          )}
        </div>
      </div>
    </div>
  );
}
