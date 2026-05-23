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

import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react';

const ClusterContext = createContext();

export function ClusterProvider({ children }) {

  const [clusters, setClusters] = useState([]);

  const [currentCluster, setCurrentCluster] =
    useState(null);

  useEffect(() => {

    const stored =
      localStorage.getItem('kafka_clusters');

    if (stored) {

      try {

        const parsed = JSON.parse(stored);

        setClusters(parsed);

        if (parsed.length > 0) {

          setCurrentCluster(parsed[0]);
        }

      } catch (e) {

        console.error(e);
      }
    }

  }, []);

  const addCluster = (cluster) => {

    const newCluster = {

      ...cluster,

      id: Date.now().toString(),

      // unknown | checking | connected | error
      connectionStatus: 'unknown'
    };

    const newClusters = [
      ...clusters,
      newCluster
    ];

    setClusters(newClusters);

    localStorage.setItem(
      'kafka_clusters',
      JSON.stringify(newClusters)
    );

    setCurrentCluster(newCluster);
  };

  const updateCluster = (updatedCluster) => {

    const newClusters = clusters.map(cluster => {

      if (cluster.id === updatedCluster.id) {

        return updatedCluster;
      }

      return cluster;
    });

    setClusters(newClusters);

    localStorage.setItem(
      'kafka_clusters',
      JSON.stringify(newClusters)
    );

    if (currentCluster?.id === updatedCluster.id) {

      setCurrentCluster(updatedCluster);
    }
  };

  const removeCluster = (clusterId) => {

    const newClusters = clusters.filter(
      cluster => cluster.id !== clusterId
    );

    setClusters(newClusters);

    localStorage.setItem(
      'kafka_clusters',
      JSON.stringify(newClusters)
    );

    if (currentCluster?.id === clusterId) {

      setCurrentCluster(
        newClusters[0] || null
      );
    }
  };

  const changeCluster = (cluster) => {

    const updatedCluster = {
      ...cluster,
      connectionStatus: 'connected'
    };

    const updatedClusters = clusters.map(c =>
      c.id === cluster.id
        ? updatedCluster
        : c
    );

    setClusters(updatedClusters);

    localStorage.setItem(
      'kafka_clusters',
      JSON.stringify(updatedClusters)
    );

    setCurrentCluster(updatedCluster);
  };

  const updateClusterStatus = (
    clusterId,
    status
  ) => {

    const newClusters = clusters.map(cluster => {

      if (cluster.id === clusterId) {

        return {

          ...cluster,

          connectionStatus: status
        };
      }

      return cluster;
    });

    setClusters(newClusters);

    localStorage.setItem(
      'kafka_clusters',
      JSON.stringify(newClusters)
    );

    if (currentCluster?.id === clusterId) {

      const updated = newClusters.find(
        cluster => cluster.id === clusterId
      );

      setCurrentCluster(updated);
    }
  };

  return (

    <ClusterContext.Provider
      value={{

        clusters,

        currentCluster,

        addCluster,

        updateCluster,

        removeCluster,

        changeCluster,

        updateClusterStatus
      }}
    >

      {children}

    </ClusterContext.Provider>
  );
}

export const useCluster = () =>
  useContext(ClusterContext);