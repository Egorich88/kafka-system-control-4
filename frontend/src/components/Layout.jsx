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

import { Outlet, useNavigate } from 'react-router-dom';

import { useCluster } from '../contexts/ClusterContext';

import { useState } from 'react';

import CreateClusterPanel from './CreateClusterPanel';

import ClusterSettingsPanel from './ClusterSettingsPanel';

import Sidebar from './layout/Sidebar';

import packageJson from '../../package.json';

import { useTranslation } from 'react-i18next';

const Layout = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {

    clusters,
    currentCluster,
    changeCluster,
    addCluster,
    updateCluster,
    removeCluster

  } = useCluster();

  const [showPanel, setShowPanel] =
    useState(false);

  const [panelMode, setPanelMode] =
    useState(null);

  const [editingCluster, setEditingCluster] =
    useState(null);

  const handleAdd = () => {

    setPanelMode('create');

    setEditingCluster(null);

    setShowPanel(true);
  };

  const handleEdit = () => {

    if (!currentCluster) return;

    setPanelMode('settings');

    setEditingCluster(currentCluster);

    setShowPanel(true);
  };

  const handleSave = (clusterConfig) => {

    if (
      editingCluster &&
      !clusters.find(
        c => c.id === editingCluster.id
      )
    ) {

      setShowPanel(false);

      setEditingCluster(null);

      setPanelMode(null);

      return;
    }

    if (editingCluster) {

      updateCluster({

        ...clusterConfig,

        id: editingCluster.id
      });

    } else {

      addCluster(clusterConfig);
    }

    setShowPanel(false);

    setEditingCluster(null);

    setPanelMode(null);
  };

  const handleCancel = () => {

    setShowPanel(false);

    setEditingCluster(null);

    setPanelMode(null);
  };

  const version = packageJson.version;

  const author = 'Егор Хоменко';

  const githubUrl =
    'https://github.com/Egorich88';

  return (

    <div className="app-layout sidebar-dark">

      <Sidebar
        onAddCluster={handleAdd}
        onEditCluster={handleEdit}
      />

      <main className="main-content">

        <Outlet />

      </main>

      {showPanel && (

        <div
          className="config-overlay"
          onClick={handleCancel}
        >

          <div
            className="config-panel"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {panelMode === 'create' && (

              <CreateClusterPanel
                onSave={handleSave}
                onCancel={handleCancel}
              />
            )}

            {panelMode === 'settings' && (

              <ClusterSettingsPanel
                cluster={editingCluster}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={(clusterId) => {

                  removeCluster(clusterId);

                  setShowPanel(false);

                  setEditingCluster(null);

                  setPanelMode(null);

                  navigate('/');
                }}
              />
            )}

          </div>

        </div>
      )}

    </div>
  );
};

export default Layout;