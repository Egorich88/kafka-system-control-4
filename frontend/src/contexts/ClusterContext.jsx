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
import { createContext, useContext, useState, useEffect } from 'react';

const ClusterContext = createContext();

export function ClusterProvider({ children }) {
  const [clusters, setClusters] = useState([]);
  const [currentCluster, setCurrentCluster] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('kafka_clusters');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setClusters(parsed);
        if (parsed.length > 0) setCurrentCluster(parsed[0]);
      } catch (e) {}
    }
  }, []);

  const addCluster = (cluster) => {
    const newCluster = { ...cluster, id: Date.now().toString() };
    const newClusters = [...clusters, newCluster];
    setClusters(newClusters);
    localStorage.setItem('kafka_clusters', JSON.stringify(newClusters));
    setCurrentCluster(newCluster);
  };

  const updateCluster = (updatedCluster) => {
    const newClusters = clusters.map(c => c.id === updatedCluster.id ? updatedCluster : c);
    setClusters(newClusters);
    localStorage.setItem('kafka_clusters', JSON.stringify(newClusters));
    if (currentCluster?.id === updatedCluster.id) setCurrentCluster(updatedCluster);
  };

  const removeCluster = (clusterId) => {
    const newClusters = clusters.filter(c => c.id !== clusterId);
    setClusters(newClusters);
    localStorage.setItem('kafka_clusters', JSON.stringify(newClusters));
    if (currentCluster?.id === clusterId) {
      setCurrentCluster(newClusters[0] || null);
    }
  };

  const changeCluster = (cluster) => {
    setCurrentCluster(cluster);
  };

  return (
    <ClusterContext.Provider value={{ clusters, currentCluster, addCluster, updateCluster, removeCluster, changeCluster }}>
      {children}
    </ClusterContext.Provider>
  );
}

export const useCluster = () => useContext(ClusterContext);