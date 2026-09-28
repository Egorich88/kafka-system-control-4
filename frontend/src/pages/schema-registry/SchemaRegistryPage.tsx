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
 * @file SchemaRegistryPage.tsx
 * Управление subjects, версиями, schema viewer и compatibility.
 */
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiCheckCircle, FiChevronRight, FiCode, FiCopy, FiDatabase, FiFileText, FiGitBranch, FiPlus, FiRefreshCw, FiSearch, FiSettings, FiTrash2, FiX } from 'react-icons/fi';

import { useCluster } from '../../contexts/ClusterContext';
import { useDashboardControls } from '../../contexts/DashboardControlsContext';
import {
  deleteSchemaSubject, deleteSchemaVersion, fetchSchemaSubjects,
  registerSchema, updateCompatibility, type SchemaApiMode,
} from './services/schema-registry.api';
import type { CompatibilityLevel, SchemaSubject, SchemaType } from './types/schema-registry.types';
import './styles/schema-registry.css';

export default function SchemaRegistryPage() {
  const { currentCluster } = useCluster();
  const { registerRefreshHandler, setPageLoading } = useDashboardControls();
  const [subjects, setSubjects] = useState<SchemaSubject[]>([]);
  const [selected, setSelected] = useState<SchemaSubject | null>(null);
  const [search, setSearch] = useState('');
  const [type, setType] = useState<'all' | SchemaType>('all');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<SchemaApiMode>('demo');
  const [editorOpen, setEditorOpen] = useState(false);
  const [schemaText, setSchemaText] = useState(`{
  "type": "record",
  "name": "Order",
  "fields": []
}`);
  const [compatibility, setCompatibility] = useState<CompatibilityLevel>('BACKWARD');
  const bootstrap = currentCluster?.brokers || currentCluster?.bootstrapServers || '';

  const load = async (notify = false) => {
    if (!bootstrap) return;
    setLoading(true);
    try {
      const result = await fetchSchemaSubjects(bootstrap);
      setSubjects(result.items);
      setMode(result.mode);
      setSelected(prev => result.items.find(x => x.subject === prev?.subject) || result.items[0] || null);
      if (notify) toast.success('Schema Registry обновлён');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Не удалось загрузить Schema Registry');
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
    const q = search.toLowerCase().trim();
    return subjects.filter(s => (!q || s.subject.toLowerCase().includes(q)) && (type === 'all' || s.type === type));
  }, [subjects, search, type]);

  const removeSubject = async () => {
    if (!selected || !window.confirm(`Удалить subject "${selected.subject}"?`)) return;
    try { await deleteSchemaSubject(bootstrap, selected.subject); toast.success('Subject удалён'); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Не удалось удалить subject'); }
  };
  const removeVersion = async (version: number) => {
    if (!selected || !window.confirm(`Удалить версию ${version}?`)) return;
    try { await deleteSchemaVersion(bootstrap, selected.subject, version); toast.success(`Версия ${version} удалена`); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Не удалось удалить версию'); }
  };
  const register = async () => {
    if (!selected) return;
    try {
      JSON.parse(schemaText);
      await registerSchema(bootstrap, selected.subject, selected.type, schemaText);
      toast.success('Новая версия схемы зарегистрирована');
      setEditorOpen(false);
      await load();
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Некорректная схема'); }
  };
  const saveCompatibility = async () => {
    if (!selected) return;
    try { await updateCompatibility(bootstrap, selected.subject, compatibility); toast.success('Compatibility обновлён'); await load(); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Не удалось изменить compatibility'); }
  };

  return (
    <section className="sr-page">
      <div className="sr-hero">
        <div><div className="sr-eyebrow"><FiFileText /> Schema Registry</div><h2>Схемы и subjects</h2><p>Управление версиями схем, compatibility и контрактами сообщений.</p></div>
        <div className="sr-live"><span className={mode === 'demo' ? 'demo' : ''} />{mode === 'demo' ? 'Demo API' : 'Connected'}</div>
      </div>

      <div className="sr-stats">
        <div><span>Subjects</span><strong>{subjects.length}</strong><FiFileText /></div>
        <div><span>Avro</span><strong>{subjects.filter(x => x.type === 'AVRO').length}</strong><FiDatabase /></div>
        <div><span>Версий</span><strong>{subjects.reduce((s, x) => s + x.versions.length, 0)}</strong><FiGitBranch /></div>
        <div><span>Latest</span><strong>{selected?.versions.at(-1)?.version ?? '—'}</strong><FiCheckCircle /></div>
      </div>

      <div className="sr-toolbar">
        <div className="sr-search"><FiSearch /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск subject..." /></div>
        <select value={type} onChange={e => setType(e.target.value as typeof type)}><option value="all">Все типы</option><option value="AVRO">Avro</option><option value="JSON">JSON Schema</option><option value="PROTOBUF">Protobuf</option></select>
        <button className="sr-button" onClick={() => void load(true)}><FiRefreshCw className={loading ? 'sr-spin' : ''} /> Обновить</button>
      </div>

      <div className="sr-layout">
        <div className="sr-table-card">
          <div className="sr-table-head"><span>Subject</span><span>Тип</span><span>Версия</span><span>Compatibility</span><span /></div>
          {filtered.map(item => (
            <button key={item.subject} className={`sr-row ${selected?.subject === item.subject ? 'selected' : ''}`} onClick={() => { setSelected(item); setCompatibility(item.compatibility); }}>
              <span><b>{item.subject}</b><small>ID {item.schemaId}</small></span>
              <span><b className="sr-type">{item.type}</b></span>
              <span>v{item.versions.at(-1)?.version}</span>
              <span>{item.compatibility}</span>
              <FiChevronRight />
            </button>
          ))}
          {filtered.length === 0 && <div className="sr-empty">Subjects не найдены.</div>}
        </div>

        <aside className="sr-details">
          {selected ? (
            <>
              <div className="sr-detail-head">
                <div><span>Subject</span><h3>{selected.subject}</h3><p>{selected.description}</p></div>
                <button onClick={() => setSelected(null)}><FiX /></button>
              </div>

              <div className="sr-actions">
                <button className="sr-primary" onClick={() => setEditorOpen(true)}><FiPlus /> Новая версия</button>
                <button onClick={() => void removeSubject()} className="danger"><FiTrash2 /> Удалить subject</button>
              </div>

              <div className="sr-compat">
                <div><span>Compatibility</span><b>{selected.compatibility}</b></div>
                <select value={compatibility} onChange={e => setCompatibility(e.target.value as CompatibilityLevel)}>
                  <option>BACKWARD</option><option>BACKWARD_TRANSITIVE</option><option>FORWARD</option><option>FORWARD_TRANSITIVE</option><option>FULL</option><option>FULL_TRANSITIVE</option><option>NONE</option>
                </select>
                <button onClick={() => void saveCompatibility()}><FiSettings /> Сохранить</button>
              </div>

              <h4>Версии</h4>
              <div className="sr-versions">
                {[...selected.versions].reverse().map(v => (
                  <div key={v.version} className={v.version === selected.versions.at(-1)?.version ? 'latest' : ''}>
                    <div><b>v{v.version}</b><span>{v.schemaType} · ID {v.id}</span></div>
                    <div className="sr-version-actions">
                      <button title="Скопировать" onClick={() => navigator.clipboard?.writeText(v.schema)}><FiCopy /></button>
                      <button title="Удалить" onClick={() => void removeVersion(v.version)}><FiTrash2 /></button>
                      <button title="Просмотр" onClick={() => setSchemaText(v.schema)}><FiCode /></button>
                    </div>
                  </div>
                ))}
              </div>

              <h4>Latest schema</h4>
              <pre className="sr-schema">{selected.versions.at(-1)?.schema}</pre>
            </>
          ) : <div className="sr-empty">Выберите subject.</div>}
        </aside>
      </div>

      {editorOpen && (
        <div className="sr-modal-backdrop" onMouseDown={e => e.currentTarget === e.target && setEditorOpen(false)}>
          <div className="sr-modal">
            <div className="sr-modal-head"><div><span>Schema Registry</span><h3>Зарегистрировать новую версию</h3></div><button onClick={() => setEditorOpen(false)}><FiX /></button></div>
            <textarea value={schemaText} onChange={e => setSchemaText(e.target.value)} spellCheck={false} />
            <div className="sr-modal-foot"><button className="sr-button" onClick={() => setEditorOpen(false)}>Отмена</button><button className="sr-button sr-primary" onClick={() => void register()}><FiPlus /> Зарегистрировать</button></div>
          </div>
        </div>
      )}
    </section>
  );
}
