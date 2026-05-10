import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ClusterContext = createContext();

export const useCluster = () => useContext(ClusterContext);

export const ClusterProvider = ({ children }) => {
  const [clusters, setClusters] = useState([]);
  const [currentCluster, setCurrentCluster] = useState(null);

  useEffect(() => {
    // Загружаем список кластеров при монтировании
    axios.get('/api/clusters')
      .then(res => {
        setClusters(res.data);
        // Восстанавливаем выбранный кластер из localStorage или берём первый
        const savedId = localStorage.getItem('current-cluster-id');
        let cluster = res.data.find(c => c.id === savedId);
        if (!cluster && res.data.length > 0) cluster = res.data[0];
        if (cluster) setCurrentCluster(cluster);
      })
      .catch(err => console.error('Failed to load clusters:', err));
  }, []);

  const changeCluster = (cluster) => {
    setCurrentCluster(cluster);
    localStorage.setItem('current-cluster-id', cluster.id);
    // Можно также обновить глобальный baseURL для axios (если бэкенд один, но нужно передавать кластер)
    // Либо добавить перехватчик, который вставляет заголовок X-Kafka-Cluster
    axios.defaults.headers.common['X-Kafka-Cluster'] = cluster.id;
  };

  return (
    <ClusterContext.Provider value={{ clusters, currentCluster, changeCluster }}>
      {children}
    </ClusterContext.Provider>
  );
};