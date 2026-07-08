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
 * @fileoverview Контекст для управления кластерами Kafka.
 * Хранит список кластеров, текущий кластер, статусы подключения.
 * Предоставляет функции для добавления, редактирования, удаления и переключения кластеров.
 * Автоматически проверяет доступность кластера при добавлении, переключении и загрузке страницы.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const ClusterContext = createContext();

export function ClusterProvider({ children }) {
  const [clusters, setClusters] = useState([]);
  const [currentCluster, setCurrentCluster] = useState(null);

  // --- Загрузка сохранённых кластеров из localStorage при старте ---
  useEffect(() => {
    const stored = localStorage.getItem('kafka_clusters');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.length > 0) {
          setClusters(parsed);
          setCurrentCluster(parsed[0]); // выбираем первый кластер по умолчанию
          // 👇 Принудительно запускаем проверку для первого кластера
          const first = parsed[0];
          if (first.brokers) {
            checkClusterStatus(first.id, first.brokers);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []); // только один раз при монтировании

  /**
   * Проверка доступности кластера (health check)
   * @param {string} clusterId - ID кластера
   * @param {string} bootstrap - адрес брокера (localhost:9092)
   */
  const checkClusterStatus = useCallback(async (clusterId, bootstrap) => {
    if (!bootstrap) return;
    try {
      const response = await axios.get('/api/clusters/health', {
        headers: { 'X-Kafka-Bootstrap': bootstrap },
        timeout: 5000
      });
      const status = response.data.status; // "connected" или "disconnected"
      updateClusterStatus(clusterId, status);
    } catch (error) {
      updateClusterStatus(clusterId, 'error');
    }
  }, []);

  /**
   * Обновляет статус подключения конкретного кластера
   * @param {string} clusterId - ID кластера
   * @param {string} status - connected, disconnected, checking, unknown, error
   */
  const updateClusterStatus = useCallback((clusterId, status) => {
    setClusters(prev => prev.map(cluster => {
      if (cluster.id === clusterId) {
        const updated = { ...cluster, connectionStatus: status };
        // Если обновляем статус текущего выбранного кластера – синхронизируем currentCluster
        if (currentCluster?.id === clusterId) {
          setCurrentCluster(updated);
        }
        return updated;
      }
      return cluster;
    }));
  }, [currentCluster]);

  // --- Автоматическая проверка статуса при смене текущего кластера ---
  useEffect(() => {
    if (currentCluster && currentCluster.brokers) {
      checkClusterStatus(currentCluster.id, currentCluster.brokers);
    }
  }, [currentCluster, checkClusterStatus]);

  // --- Проверка статуса всех кластеров при загрузке (один раз) ---
  useEffect(() => {
    clusters.forEach(cluster => {
      if (cluster.brokers) {
        checkClusterStatus(cluster.id, cluster.brokers);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // только один раз при монтировании

  // --- Автоматическое сохранение списка кластеров ---
  useEffect(() => {
    localStorage.setItem(
      'kafka_clusters',
      JSON.stringify(clusters)
    );
  }, [clusters]);

  const addCluster = (cluster) => {
    const newCluster = {
      ...cluster,
      id: Date.now().toString(),
      connectionStatus: 'checking'
    };
    setClusters(prev => [...prev, newCluster]);

    setCurrentCluster(newCluster);
    checkClusterStatus(newCluster.id, newCluster.brokers);
  };

  const updateCluster = (updatedCluster) => {
    setClusters(prev => prev.map(c => c.id === updatedCluster.id ? updatedCluster : c));

    if (currentCluster?.id === updatedCluster.id) setCurrentCluster(updatedCluster);
  };

  const removeCluster = (clusterId) => {
    const newClusters = clusters.filter(c => c.id !== clusterId);
    setClusters(newClusters);

    if (currentCluster?.id === clusterId) setCurrentCluster(newClusters[0] || null);
  };

  const changeCluster = (cluster) => {
    setCurrentCluster(cluster);
  };

  return (
    <ClusterContext.Provider value={{
      clusters,
      currentCluster,
      addCluster,
      updateCluster,
      removeCluster,
      changeCluster,
      updateClusterStatus
    }}>
      {children}
    </ClusterContext.Provider>
  );
}

export const useCluster = () => useContext(ClusterContext);