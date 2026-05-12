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
import packageJson from '../../package.json';

const Layout = () => {
  const { clusters, currentCluster, changeCluster } = useCluster();
  const version = packageJson.version;
  const author = "Егор Хоменко";
  const githubUrl = "https://github.com/Egorich88";

  return (
    <div className="app-layout sidebar-dark">
      <aside className="sidebar">
        <div className="logo">
          <img src="/logo.svg" alt="Kafka Control" width="32" height="32" style={{ marginRight: 8 }} />
          <h3>Kafka System Control</h3>
        </div>
        {/* Выбор кластера */}
        {clusters.length > 0 && currentCluster && (
          <div className="cluster-selector">
            <label>Кластер:</label>
            <select
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
          </div>
        )}
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
    </div>
  );
};

export default Layout;