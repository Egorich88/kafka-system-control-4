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
 * @file KafkaConnectPage.tsx
 * Страница управления Kafka Connect.
 *
 * Реализованы: smart-table, поиск, фильтр состояния, статистика,
 * просмотр задач, конфигурации, restart/pause/resume/delete и создание.
 *
 * HTTP-операции вынесены в services/kafka-connect.api.ts.
 */
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  FiActivity, FiAlertTriangle, FiCheckCircle, FiChevronRight, FiDatabase,
  FiPause, FiPlay, FiPlus, FiRefreshCw, FiSearch, FiRotateCw, FiTrash2, FiX,
} from 'react-icons/fi';

import { useCluster } from '../../contexts/ClusterContext';
import { useDashboardControls } from '../../contexts/DashboardControlsContext';
import {
  createConnector, deleteConnector, fetchConnectors, pauseConnector,
  restartConnector, resumeConnector, type ApiMode,
} from './services/kafka-connect.api';
import type { Connector, ConnectorState } from './types/kafka-connect.types';
import './styles/kafka-connect.css';

const stateLabels: Record<ConnectorState, string> = {
  RUNNING: 'Работает',
  PAUSED: 'Пауза',
  FAILED: 'Ошибка',
  UNASSIGNED: 'Не назначен',
  UNKNOWN: 'Неизвестно',
};
const stateClass: Record<ConnectorState, string> = {
  RUNNING: 'kc-state-running',
  PAUSED: 'kc-state-paused',
  FAILED: 'kc-state-failed',
  UNASSIGNED: 'kc-state-unassigned',
  UNKNOWN: 'kc-state-unknown',
};

export default function KafkaConnectPage() {
  const { currentCluster } = useCluster();
  const { registerRefreshHandler, setPageLoading } = useDashboardControls();
  const [connectors, setConnectors] = useState<Connector[]>([]);
  const [selected, setSelected] = useState<Connector | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | ConnectorState>('all');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ApiMode>('demo');
  const [createOpen, setCreateOpen] = useState(false);
  const [configText, setConfigText] = useState(`{
  "name": "orders-sink",
  "config": {
    "connector.class": "org.apache.kafka.connect.file.FileStreamSinkConnector",
    "tasks.max": "1",
    "topics": "orders",
    "file": "/tmp/orders.txt"
  }
}`);

  const bootstrap = currentCluster?.brokers || currentCluster?.bootstrapServers || '';

  const load = async (notify = false) => {
    if (!bootstrap) {
      setConnectors([]);
      setSelected(null);
      return;
    }
    setLoading(true);
    try {
      const result = await fetchConnectors(bootstrap);
      setConnectors(result.items);
      setMode(result.mode);
      setSelected(prev => result.items.find(x => x.name === prev?.name) || result.items[0] || null);
      if (notify) toast.success('Kafka Connect обновлён');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось загрузить Kafka Connect');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [bootstrap]);
  useEffect(() => {
    registerRefreshHandler(() => load(true));
    return () => registerRefreshHandler(null);
  }, [registerRefreshHandler, bootstrap]);
  useEffect(() => {
    setPageLoading(loading);
    return () => setPageLoading(false);
  }, [loading, setPageLoading]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return connectors.filter(item =>
      (!q || item.name.toLowerCase().includes(q) || item.connectorClass.toLowerCase().includes(q)) &&
      (filter === 'all' || item.state === filter)
    );
  }, [connectors, search, filter]);

  const stats = useMemo(() => ({
    total: connectors.length,
    running: connectors.filter(x => x.state === 'RUNNING').length,
    failed: connectors.filter(x => x.state === 'FAILED').length,
    tasks: connectors.reduce((sum, x) => sum + x.tasks.length, 0),
  }), [connectors]);

  const runAction = async (action: () => Promise<void>, success: string) => {
    try {
      await action();
      toast.success(success);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Операция не выполнена');
    }
  };

  const submitCreate = async () => {
    try {
      const payload = JSON.parse(configText);
      await createConnector(bootstrap, payload);
      toast.success('Коннектор создан');
      setCreateOpen(false);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Некорректная JSON-конфигурация');
    }
  };

  return (
    <section className="kc-page">
      <div className="kc-hero">
        <div>
          <div className="kc-eyebrow"><FiDatabase /> Kafka Connect</div>
          <h2>Коннекторы</h2>
          <p>Управление источниками, приёмниками и задачами Kafka Connect.</p>
        </div>
        <div className="kc-connection">
          <span className={`kc-dot ${mode === 'demo' ? 'is-demo' : ''}`} />
          {mode === 'demo' ? 'Demo API' : 'Подключено'}
        </div>
      </div>

      <div className="kc-stats">
        <div className="kc-stat"><span>Коннекторы</span><strong>{stats.total}</strong><FiDatabase /></div>
        <div className="kc-stat"><span>Работают</span><strong>{stats.running}</strong><FiCheckCircle /></div>
        <div className="kc-stat"><span>Ошибки</span><strong>{stats.failed}</strong><FiAlertTriangle /></div>
        <div className="kc-stat"><span>Задачи</span><strong>{stats.tasks}</strong><FiActivity /></div>
      </div>

      <div className="kc-toolbar">
        <div className="kc-search"><FiSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск коннектора..." /></div>
        <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}>
          <option value="all">Все состояния</option>
          <option value="RUNNING">Работает</option>
          <option value="PAUSED">Пауза</option>
          <option value="FAILED">Ошибка</option>
          <option value="UNASSIGNED">Не назначен</option>
        </select>
        <button className="kc-button" onClick={() => void load(true)} disabled={loading}><FiRefreshCw className={loading ? 'kc-spin' : ''} /> Обновить</button>
        <button className="kc-button kc-primary" onClick={() => setCreateOpen(true)}><FiPlus /> Создать</button>
      </div>

      <div className="kc-layout">
        <div className="kc-table-card">
          <div className="kc-table-head"><span>Коннектор</span><span>Тип</span><span>Состояние</span><span>Задачи</span><span>Worker</span><span /></div>
          {filtered.map(item => (
            <button key={item.name} className={`kc-row ${selected?.name === item.name ? 'is-selected' : ''}`} onClick={() => setSelected(item)}>
              <span><strong>{item.name}</strong><small>{item.connectorClass.split('.').pop()}</small></span>
              <span>{item.type}</span>
              <span><b className={`kc-state ${stateClass[item.state]}`}><i />{stateLabels[item.state]}</b></span>
              <span>{item.tasks.filter(t => t.state === 'RUNNING').length} / {item.tasks.length}</span>
              <span className="kc-mono">{item.worker}</span>
              <FiChevronRight />
            </button>
          ))}
          {filtered.length === 0 && <div className="kc-empty">Коннекторы не найдены.</div>}
        </div>

        <aside className="kc-details">
          {selected ? (
            <>
              <div className="kc-details-head">
                <div>
                  <span className={`kc-state ${stateClass[selected.state]}`}><i />{stateLabels[selected.state]}</span>
                  <h3>{selected.name}</h3>
                  <p>{selected.description}</p>
                </div>
                <button className="kc-icon-button" onClick={() => setSelected(null)}><FiX /></button>
              </div>

              <div className="kc-actions">
                <button onClick={() => void runAction(() => restartConnector(bootstrap, selected.name), 'Коннектор перезапущен')}><FiRotateCw /> Restart</button>
                {selected.state === 'PAUSED'
                  ? <button onClick={() => void runAction(() => resumeConnector(bootstrap, selected.name), 'Коннектор возобновлён')}><FiPlay /> Возобновить</button>
                  : <button onClick={() => void runAction(() => pauseConnector(bootstrap, selected.name), 'Коннектор приостановлен')}><FiPause /> Пауза</button>}
                <button className="is-danger" onClick={() => void runAction(() => deleteConnector(bootstrap, selected.name), 'Коннектор удалён')}><FiTrash2 /> Удалить</button>
              </div>

              <div className="kc-detail-grid">
                <div><span>Класс</span><strong className="kc-mono">{selected.connectorClass}</strong></div>
                <div><span>Тип</span><strong>{selected.type}</strong></div>
                <div><span>Создан</span><strong>{selected.createdAt}</strong></div>
                <div><span>Обновлён</span><strong>{selected.updatedAt}</strong></div>
              </div>

              <h4>Задачи</h4>
              <div className="kc-task-list">
                {selected.tasks.map(task => (
                  <div key={task.id}>
                    <span>Task {task.id}</span>
                    <b className={`kc-state ${stateClass[task.state]}`}><i />{stateLabels[task.state]}</b>
                    <small>{task.worker}</small>
                  </div>
                ))}
              </div>

              {selected.error && <div className="kc-error"><FiAlertTriangle /><div><b>Последняя ошибка</b><p>{selected.error}</p></div></div>}
              <h4>Конфигурация</h4>
              <pre className="kc-config">{JSON.stringify(selected.config, null, 2)}</pre>
            </>
          ) : <div className="kc-empty kc-details-empty">Выберите коннектор для просмотра подробностей.</div>}
        </aside>
      </div>

      {createOpen && (
        <div className="kc-modal-backdrop" onMouseDown={e => e.currentTarget === e.target && setCreateOpen(false)}>
          <div className="kc-modal">
            <div className="kc-modal-head"><div><span>Новый ресурс</span><h3>Создать Kafka Connect connector</h3></div><button onClick={() => setCreateOpen(false)}><FiX /></button></div>
            <textarea value={configText} onChange={e => setConfigText(e.target.value)} spellCheck={false} />
            <div className="kc-modal-actions"><button className="kc-button" onClick={() => setCreateOpen(false)}>Отмена</button><button className="kc-button kc-primary" onClick={() => void submitCreate()}><FiPlus /> Создать</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
