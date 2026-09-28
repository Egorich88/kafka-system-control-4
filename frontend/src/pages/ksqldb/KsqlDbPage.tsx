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
 * @file KsqlDbPage.tsx
 * Рабочее пространство ksqlDB: SQL editor, Streams, Tables и Queries.
 */
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiActivity, FiCheckCircle, FiCode, FiDatabase, FiPlay, FiRefreshCw, FiSearch, FiStopCircle, FiTable, FiX, FiZap } from 'react-icons/fi';

import { useCluster } from '../../contexts/ClusterContext';
import { useDashboardControls } from '../../contexts/DashboardControlsContext';
import { executeStatement, fetchKsqlState, terminateQuery, type KsqlResult } from './services/ksqldb.api';
import type { KsqlObject, KsqlState, KsqlTab } from './types/ksqldb.types';
import './styles/ksqldb.css';

const defaultSql = 'SELECT * FROM orders EMIT CHANGES LIMIT 50;';

export default function KsqlDbPage() {
  const { currentCluster } = useCluster();
  const { registerRefreshHandler, setPageLoading } = useDashboardControls();
  const [state, setState] = useState<KsqlState>({ mode: 'demo', queries: [], streams: [], tables: [] });
  const [tab, setTab] = useState<KsqlTab>('editor');
  const [sql, setSql] = useState(defaultSql);
  const [result, setResult] = useState<KsqlResult | null>(null);
  const [selected, setSelected] = useState<KsqlObject | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const bootstrap = currentCluster?.brokers || currentCluster?.bootstrapServers || '';

  const load = async (notify = false) => {
    if (!bootstrap) return;
    setLoading(true);
    try {
      const data = await fetchKsqlState(bootstrap);
      setState(data);
      if (notify) toast.success('ksqlDB обновлён');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось загрузить ksqlDB');
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

  const objects = useMemo(() => {
    const source = tab === 'streams' ? state.streams : tab === 'tables' ? state.tables : state.queries;
    const q = search.toLowerCase().trim();
    return source.filter(x => !q || x.name.toLowerCase().includes(q) || x.query.toLowerCase().includes(q));
  }, [tab, state, search]);

  const execute = async () => {
    if (!sql.trim()) return;
    setLoading(true);
    try {
      setResult(await executeStatement(bootstrap, sql));
      toast.success('Statement выполнен');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка выполнения statement');
    } finally {
      setLoading(false);
    }
  };

  const terminate = async (queryId: string) => {
    try {
      await terminateQuery(bootstrap, queryId);
      toast.success('Запрос остановлен');
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось остановить запрос');
    }
  };

  return (
    <section className="ks-page">
      <div className="ks-hero">
        <div>
          <div className="ks-eyebrow"><FiZap /> ksqlDB</div>
          <h2>Потоки и запросы</h2>
          <p>Выполнение SQL, просмотр Streams и Tables и управление persistent queries.</p>
        </div>
        <div className="ks-live"><span />{state.mode === 'demo' ? 'Demo API' : 'Connected'}</div>
      </div>

      <div className="ks-metrics">
        <div><span>Streams</span><strong>{state.streams.length}</strong><FiActivity /></div>
        <div><span>Tables</span><strong>{state.tables.length}</strong><FiTable /></div>
        <div><span>Queries</span><strong>{state.queries.length}</strong><FiDatabase /></div>
        <div><span>Running</span><strong>{state.queries.filter(q => q.state === 'RUNNING').length}</strong><FiCheckCircle /></div>
      </div>

      <div className="ks-workspace">
        <div className="ks-editor-card">
          <div className="ks-editor-head">
            <div><b><FiCode /> SQL Editor</b><span>ksqlDB REST API</span></div>
            <button onClick={() => void load(true)}><FiRefreshCw className={loading ? 'ks-spin' : ''} /> Обновить</button>
          </div>
          <textarea value={sql} onChange={e => setSql(e.target.value)} spellCheck={false} />
          <div className="ks-editor-foot">
            <span>CREATE STREAM, CREATE TABLE, SELECT, INSERT и другие statements.</span>
            <button className="ks-primary" onClick={() => void execute()} disabled={loading}><FiPlay /> Выполнить</button>
          </div>

          {result && (
            <div className={`ks-result ${result.error ? 'has-error' : ''}`}>
              <div className="ks-result-head"><b>Результат</b><button onClick={() => setResult(null)}><FiX /></button></div>
              {result.error ? <pre>{result.error}</pre> : (
                <div className="ks-result-table">
                  <table><thead><tr>{result.columns.map(c => <th key={c}>{c}</th>)}</tr></thead>
                    <tbody>{result.rows.map((row, i) => <tr key={i}>{result.columns.map(c => <td key={c}>{String(row[c] ?? '')}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="ks-objects">
          <div className="ks-tabs">
            {(['editor', 'streams', 'tables', 'queries'] as KsqlTab[]).map(item => (
              <button key={item} className={tab === item ? 'active' : ''} onClick={() => setTab(item)}>
                {item === 'editor' ? 'Editor' : item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          {tab !== 'editor' && <div className="ks-object-search"><FiSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." /></div>}
          {tab === 'editor' ? (
            <div className="ks-editor-help"><FiCode /><h3>Рабочее пространство ksqlDB</h3><p>Выполняйте statements и затем переходите к Streams, Tables или Queries для управления созданными объектами.</p></div>
          ) : (
            <div className="ks-object-list">
              {objects.map(item => (
                <button key={item.id} className={`ks-object ${selected?.id === item.id ? 'selected' : ''}`} onClick={() => setSelected(item)}>
                  <span><b>{item.name}</b><small>{item.query}</small></span><FiZap />
                </button>
              ))}
              {objects.length === 0 && <div className="ks-empty">Объекты не найдены.</div>}
            </div>
          )}
        </aside>
      </div>

      {selected && (
        <div className="ks-detail">
          <div className="ks-detail-head"><div><span>{selected.kind}</span><h3>{selected.name}</h3></div><button onClick={() => setSelected(null)}><FiX /></button></div>
          <div className="ks-detail-grid">
            <div><span>Статус</span><strong>{selected.state}</strong></div>
            <div><span>Created</span><strong>{selected.createdAt}</strong></div>
            <div><span>Topic</span><strong>{selected.topic || '—'}</strong></div>
            <div><span>Format</span><strong>{selected.format || '—'}</strong></div>
          </div>
          <pre>{selected.query}</pre>
          {selected.kind === 'QUERY' && selected.state === 'RUNNING' && (
            <button className="ks-danger" onClick={() => void terminate(selected.id)}><FiStopCircle /> Остановить запрос</button>
          )}
        </div>
      )}
    </section>
  );
}
