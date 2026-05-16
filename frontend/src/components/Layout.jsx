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
import { NavLink, Outlet } from 'react-router-dom';
import { useCluster } from '../contexts/ClusterContext';
import { useState } from 'react';
import ClusterConfigPanel from './ClusterConfigPanel';
import packageJson from '../../package.json';

const Layout = () => {
  const {
    clusters,
    currentCluster,
    changeCluster,
    addCluster,
    updateCluster,
    removeCluster
  } = useCluster();

  const [showPanel, setShowPanel] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null);

  const handleAdd = () => {
    setEditingCluster(null);
    setShowPanel(true);
  };

  const handleEdit = () => {
    if (!currentCluster) return;
    setEditingCluster(currentCluster);
    setShowPanel(true);
  };

  const handleSave = (clusterConfig) => {
    // Если редактируемый кластер был удалён — просто закрываем панель
    if (editingCluster && !clusters.find(c => c.id === editingCluster.id)) {
      setShowPanel(false);
      setEditingCluster(null);
      return;
    }
    if (editingCluster) {
      updateCluster({ ...clusterConfig, id: editingCluster.id });
    } else {
      addCluster(clusterConfig);
    }
    setShowPanel(false);
    setEditingCluster(null);
  };

  const handleCancel = () => {
    setShowPanel(false);
    setEditingCluster(null);
  };

  const handleDelete = () => {
    if (!currentCluster) return;
    const confirmDelete = window.confirm(`Удалить кластер "${currentCluster.name}"?`);
    if (confirmDelete) {
      removeCluster(currentCluster.id);
      setShowPanel(false);
      setEditingCluster(null);
    }
  };

  const version = packageJson.version;
  const author = "Егор Хоменко";
  const githubUrl = "https://github.com/Egorich88";

  return (
    <div className="app-layout sidebar-dark">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo.svg" alt="Kafka Control" width="72" height="72" style={{ marginRight: 8 }} />
          <h3>Kafka System Control</h3>
        </div>

        {/* Блок кластера */}
        <div className="cluster-section">
          <div className="cluster-header">
            <span>Кластер</span>
            <button onClick={handleAdd} className="add-cluster-btn" title="Добавить кластер">Add</button>
          </div>
          {clusters.length > 0 && currentCluster ? (
            <div className="cluster-select-row">
              <select
                className="cluster-select"
                value={currentCluster.id}
                onChange={(e) => {
                  const selected = clusters.find(c => c.id === e.target.value);
                  if (selected) changeCluster(selected);
                }}
              >
                {clusters.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <button onClick={handleEdit} className="edit-cluster-btn" title="Редактировать">Edit</button>
              <button onClick={handleDelete} className="delete-cluster-btn" title="Удалить">Delete</button>
            </div>
          ) : (
            <div className="no-cluster" style={{ display: 'none' }}></div>
          )}
        </div>

        {/* Навигация — показываем только если есть выбранный кластер */}
        {clusters.length > 0 && currentCluster ? (
          <nav>
            <NavLink to="/topics" className={({ isActive }) => (isActive ? 'active' : '')}>
              Топики
            </NavLink>
            <NavLink to="/groups" className={({ isActive }) => (isActive ? 'active' : '')}>
              Группы потребителей
            </NavLink>
            <NavLink to="/acls" className={({ isActive }) => (isActive ? 'active' : '')}>
              ACL
            </NavLink>
            <NavLink to="/search" className={({ isActive }) => (isActive ? 'active' : '')}>
              Поиск сообщений
            </NavLink>
          </nav>
        ) : (
          <div className="no-cluster-message">
            <p>Нет активного кластера</p>
            <p className="hint">Добавьте кластер через кнопку Add</p>
          </div>
        )}

        <div className="sidebar-footer">
          <div className="version">Версия: {version}</div>
          <div className="author">
            <a href={githubUrl} target="_blank" rel="noopener noreferrer">
              {author}
            </a>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      {showPanel && (
        <div className="config-overlay">
          <div className="config-panel">
            <ClusterConfigPanel
              cluster={editingCluster}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;