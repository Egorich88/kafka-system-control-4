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
import '../styles/topics.css';
import '../styles/shared/modals.css';
import '../styles/shared/buttons.css';
import '../styles/shared/forms.css';
import '../styles/shared/tables.css';
import '../styles/shared/scrollbars.css';

import { useEffect, useState, useRef } from 'react';

import axios from 'axios';

import toast, { Toaster } from 'react-hot-toast';

import { useCluster } from '../contexts/ClusterContext';

export default function Topics() {

  const { currentCluster } = useCluster();

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState('');

  // EXPORT
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState(null);

  // MULTI SELECT
  const [selectedTopics, setSelectedTopics] = useState([]);

  const [detailTopic, setDetailTopic] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [newTopic, setNewTopic] = useState({
    topic: '',
    partitions: '1',
    replication: '1',

    cleanupPolicy: 'delete',

    retentionMs: '604800000',

    minInSyncReplicas: '1',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [editingParam, setEditingParam] = useState(null);

  const [editValue, setEditValue] = useState('');

  const [originalValue, setOriginalValue] = useState('');

  const panelRef = useRef(null);

  const formatRetention = (value) => {

    if (!value || value === '-') return '-';

    const ms = Number(value);

    if (ms === -1) return 'infinite';

    const days = Math.floor(ms / 86400000);

    if (days >= 1) return `${days}d`;

    const hours = Math.floor(ms / 3600000);

    if (hours >= 1) return `${hours}h`;

    return `${ms}ms`;
  };

  const CONFIG_DESCRIPTIONS = {
    'cleanup.policy': 'Политика очистки топика',
    'retention.ms': 'Время хранения сообщений',
    'min.insync.replicas': 'Минимальное количество синхронных реплик',
    'segment.bytes': 'Максимальный размер сегмента',
    'segment.ms': 'Время жизни сегмента',
    'compression.type': 'Тип сжатия сообщений',
    'max.message.bytes': 'Максимальный размер сообщения',
    'message.timestamp.type': 'Тип временной метки',
  };

  useEffect(() => {

    if (detailTopic) {

      document.body.classList.add('drawer-open');

    } else {

      document.body.classList.remove('drawer-open');
    }

    return () => {
      document.body.classList.remove('drawer-open');
    };

  }, [detailTopic]);

  // =========================================================
  // RESET STATE ON CLUSTER CHANGE
  // =========================================================

  useEffect(() => {

    setTopics([]);

    setSelectedTopic(null);

    setDetailTopic(null);

    setEditingParam(null);

    setFilter('');

  }, [currentCluster?.brokers]);

  // =========================================================
  // FETCH TOPICS
  // =========================================================

  const fetchTopics = async () => {

    if (!currentCluster) {

      setTopics([]);

      return;
    }

    setLoading(true);

    try {

      const response = await axios.get('/api/topics/', {
        headers: {
          'X-Kafka-Bootstrap': currentCluster.brokers,
        },
      });

      const topicsData = response.data.topics || [];

      const normalized = topicsData.map((t) => ({
        name: t.name || t,
        partitions: t.partitions || 0,
        replicationFactor: t.replicationFactor || 1,

        cleanupPolicy:
          t.cleanupPolicy ||
          t['cleanup.policy'] ||
          '-',

        retentionMs:
          t.retentionMs ||
          t['retention.ms'] ||
          '-',
      }));

      setTopics(normalized);

    } catch (error) {

      console.error(error);

      setTopics([]);

      toast.error('Ошибка загрузки топиков');

    } finally {

      setLoading(false);
    }
  };

  useEffect(() => {

    fetchTopics();

  }, [currentCluster?.brokers]);

  // =========================================================
  // LOAD DETAILS
  // =========================================================

  const loadTopicDetails = async (topicName) => {

    if (!currentCluster) return;

    setDetailLoading(true);

    setDetailTopic(null);

    setEditingParam(null);

    try {

      const response = await axios.get(
        `/api/topics/${encodeURIComponent(topicName)}`,
        {
          headers: {
            'X-Kafka-Bootstrap': currentCluster.brokers,
          },
        }
      );

      setDetailTopic(response.data);

    } catch (error) {

      console.error(error);

      toast.error('Ошибка загрузки деталей топика');

    } finally {

      setDetailLoading(false);
    }
  };

  // TABLE EVENTS

  const toggleTopicSelection = (topicName) => {
    setSelectedTopics((prev) =>
      prev.includes(topicName)
        ? prev.filter((t) => t !== topicName)
        : [...prev, topicName]
    );
  };

  const toggleSelectAll = () => {
    if (selectedTopics.length === filteredTopics.length) {
      setSelectedTopics([]);
    } else {
      setSelectedTopics(filteredTopics.map((t) => t.name));
    }
  };

  const handleRowClick = (topic) => {

    setSelectedTopic(topic);

    loadTopicDetails(topic.name);
  };

  // =========================================================
  // CLOSE PANEL
  // =========================================================

  const closePanel = () => {

    setDetailTopic(null);

    setEditingParam(null);
  };

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        detailTopic &&
        panelRef.current &&
        !panelRef.current.contains(event.target)
      ) {
        closePanel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

  }, [detailTopic]);

  // =========================================================
  // EDIT CONFIG
  // =========================================================

  const handleConfigDoubleClick = (key, currentValue) => {

    setEditingParam(key);

    setEditValue(String(currentValue));

    setOriginalValue(String(currentValue));
  };

  const handleSaveEdit = async () => {

    if (!selectedTopic || !editingParam) return;

    if (editValue === originalValue) {

      setEditingParam(null);

      return;
    }

    try {

      await axios.patch(
        `/api/topics/${encodeURIComponent(selectedTopic.name)}/config`,
        {
          configs: {
            [editingParam]: editValue,
          },
        },
        {
          headers: {
            'X-Kafka-Bootstrap': currentCluster.brokers,
          },
        }
      );

      toast.success(`Параметр ${editingParam} обновлён`);

      setDetailTopic((prev) => ({
        ...prev,
        configs: {
          ...prev.configs,
          [editingParam]: editValue,
        },
      }));

      setEditingParam(null);

    } catch (error) {

      console.error(error);

      toast.error(
        'Ошибка сохранения: ' +
          (error.response?.data?.error || error.message)
      );
    }
  };

  const handleCancelEdit = () => {

    setEditingParam(null);

    setEditValue('');
  };

  // =========================================================
  // CREATE TOPIC
  // =========================================================

  const handleCreateTopic = async (e) => {

    e.preventDefault();

    if (!currentCluster) return;

    if (!newTopic.topic.trim()) {

      toast.error('Введите имя топика');

      return;
    }

    try {

      const payload = {
        topic: newTopic.topic.trim(),

        partitions: Number(newTopic.partitions),

        replication: Number(newTopic.replication),
      };

      if (showAdvanced) {

        payload.configs = {
          'cleanup.policy': newTopic.cleanupPolicy,

          'retention.ms': newTopic.retentionMs,

          'min.insync.replicas':
            newTopic.minInSyncReplicas,
        };
      }

      await axios.post(
        '/api/topics',
        payload,
        {
          headers: {
            'X-Kafka-Bootstrap': currentCluster.brokers,
          },
        }
      );

      toast.success(`Топик "${newTopic.topic}" создан`);

      setNewTopic({
        topic: '',
        partitions: '1',
        replication: '1',

        cleanupPolicy: 'delete',

        retentionMs: '604800000',

        minInSyncReplicas: '1',
      });

      setShowAdvanced(false);

      setShowCreateModal(false);

      fetchTopics();

    } catch (error) {

      console.error(error);

      const backendError =
        error.response?.data?.error || '';

      if (
        backendError.includes('Topic name is invalid') ||
        backendError.includes('contains one or more characters')
      ) {

        toast.error(
          'Ошибка создания топика. Используйте только латинские символы, цифры, ".", "_" или "-"'
        );

      } else {

        toast.error(
          backendError || 'Ошибка создания топика'
        );
      }
    }
  };

  // =========================================================
  // DELETE TOPIC
  // =========================================================

  const handleDeleteTopic = async () => {

    if (!selectedTopic) {

      toast.error('Выберите топик');

      return;
    }

    if (
      !window.confirm(`Удалить топик "${selectedTopic.name}"?`)
    ) {
      return;
    }

    try {

      await axios.delete(
        `/api/topics/${encodeURIComponent(selectedTopic.name)}`,
        {
          headers: {
            'X-Kafka-Bootstrap': currentCluster.brokers,
          },
        }
      );

      toast.success(`Топик "${selectedTopic.name}" удалён`);

      closePanel();

      fetchTopics();

    } catch (error) {

      console.error(error);

      toast.error('Ошибка удаления топика');
    }
  };

  // Экспорт списка топиков
  const exportTopicsList = () => {

    const selected =
      selectedTopics.length > 0
        ? topics.filter(t =>
            selectedTopics.includes(t.name)
          )
        : topics;

    const content = selected
      .map(t => t.name)
      .join('\n');

    const blob = new Blob(
      [content],
      { type: 'text/plain;charset=utf-8' }
    );

    const url =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement('a');

    link.href = url;

    link.download =
      'topics-list.txt';

    link.click();

    window.URL.revokeObjectURL(url);

    setShowExportMenu(false);

    toast.success(
      `Экспортировано ${selected.length} топиков`
    );
  };

  // Экспорт конфигурацити топиков
  const exportTopicsConfig = async () => {

    if (!currentCluster) {
      return;
    }

    try {

      const selected =
        selectedTopics.length > 0
          ? topics.filter(t =>
              selectedTopics.includes(t.name)
            )
          : topics;

      const result = [];

      // Получаем конфигурацию каждого топика
      for (const topic of selected) {

        const response = await axios.get(
          `/api/topics/${encodeURIComponent(topic.name)}`,
          {
            headers: {
              'X-Kafka-Bootstrap': currentCluster.brokers,
            },
          }
        );

        result.push({
          topic: topic.name,
          configs: response.data.configs || {},
        });
      }

      const blob = new Blob(
        [JSON.stringify(result, null, 2)],
        {
          type: 'application/json;charset=utf-8',
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement('a');

      link.href = url;

      link.download =
        `topics-config-${selected.length}.json`;

      link.click();

      window.URL.revokeObjectURL(url);

      setShowExportMenu(false);

      toast.success(
        `Экспортировано ${selected.length} топиков`
      );

    } catch (error) {

      console.error(error);

      toast.error(
        'Ошибка экспорта конфигурации'
      );
    }
  };

  // FILTER
  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(filter.toLowerCase())
  );


  // RENDER
  return (

    <div className="topics-container">

      <Toaster position="top-right" />

      <div className="topics-header">

        <div>

          <h1 className="topics-title">
            Управление топиками
          </h1>

        </div>

      </div>

      <div className="topics-toolbar">

        <input
          type="text"
          placeholder="Поиск топика..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />

        <div className="action-buttons">

          {/* Создание топика */}
          <button
            className="action-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Создать
          </button>

          {/* Экспорт */}
          <div className="export-dropdown">

            <button
              className="action-btn"
              onClick={() =>
                setShowExportMenu(!showExportMenu)
              }
            >
              Экспорт ({selectedTopics.length || topics.length})
              ▼
            </button>

            {showExportMenu && (

              <div className="export-menu">

                <button
                  className="export-item"
                  title="Экспорт только названий топиков"
                  onClick={() =>
                    exportTopicsList()
                  }
                >
                  📄 Список топиков
                </button>

                <button
                  className="export-item"
                  title="Экспорт топиков вместе с конфигурацией"
                  onClick={() =>
                    exportTopicsConfig()
                  }
                >
                  📄 Конфигурация топиков
                </button>

              </div>

            )}

          </div>

          {/* Удаление */}
          <button
            className="action-btn delete"
            onClick={handleDeleteTopic}
            disabled={!selectedTopic}
          >
            Удалить
          </button>

        </div>

      </div>

      <div
        className={`topics-content ${
          detailTopic ? 'with-details' : ''
        }`}
      >

      <div className="topics-table-wrapper">

        <table className="topics-table">

          <thead>

            <tr>

              <th className="checkbox-column">

                <input
                  type="checkbox"
                  checked={
                    filteredTopics.length > 0 &&
                    selectedTopics.length === filteredTopics.length
                  }
                  onChange={toggleSelectAll}
                />

              </th>

              <th>Название</th>
              <th>Партиции</th>
              <th>Репликация</th>
              <th>Cleanup</th>
              <th>Retention</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td colSpan="4" className="topics-loading">
                  Загрузка топиков...
                </td>

              </tr>

            ) : filteredTopics.length === 0 ? (

              <tr>

                <td colSpan="4" className="topics-empty-cell">

                  <div className="topics-empty">

                    <h3>Топики отсутствуют</h3>

                    <p>
                      В выбранном кластере нет топиков
                      либо кластер недоступен.
                    </p>

                  </div>

                </td>

              </tr>

            ) : (

              filteredTopics.map((topic) => (

                <tr
                  key={topic.name}
                  className={
                    selectedTopic?.name === topic.name
                      ? 'selected'
                      : ''
                  }
                  onClick={() => handleRowClick(topic)}
                >
                  <td className="checkbox-column">

                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.name)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleTopicSelection(topic.name);
                      }}
                    />

                  </td>

                  <td className="topic-name">
                    {topic.name}
                  </td>

                  <td>
                    {topic.partitions}
                  </td>

                  <td>
                    {topic.replicationFactor}
                  </td>

                  <td>
                    {topic.cleanupPolicy}
                  </td>

                  <td>
                    {formatRetention(topic.retentionMs)}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

        </div> {/* topics-table-wrapper */}

        {detailTopic && (

          <div className="topic-details-panel">

            <div className="topic-details-header">

              <h2>
                {selectedTopic?.name}
              </h2>

              <button
                className="topic-close-btn"
                onClick={closePanel}
              >
                Закрыть
              </button>

            </div>

            <div className="topic-details-body">

              <div className="topic-section">

                <h3>Основная информация</h3>

                <div className="topic-meta">

                  <div className="topic-meta-item">
                    <strong>Название:</strong>
                    {detailTopic.name}
                  </div>

                  <div className="topic-meta-item">
                    <strong>Партиций:</strong>
                    {detailTopic.partitions?.length || 0}
                  </div>

                  <div className="topic-meta-item">
                    <strong>Репликация:</strong>
                    {detailTopic.replicationFactor}
                  </div>

                  <div className="topic-meta-item">
                    <strong>Cleanup:</strong>
                    {detailTopic.configs?.['cleanup.policy'] || '-'}
                  </div>

                  <div className="topic-meta-item">
                    <strong>Retention:</strong>
                    {detailTopic.configs?.['retention.ms'] || '-'}
                  </div>

                </div>

              </div>

              <div className="topic-section">

                <h3>Конфигурация</h3>

                <div className="topic-config-wrapper">

                  <table className="topic-config-table">

                    <thead>
                      <tr>
                        <th>Параметр</th>
                        <th>Значение</th>
                      </tr>
                    </thead>

                    <tbody>

                      {Object.entries(detailTopic.configs || {}).map(
                        ([key, value]) => (

                          <tr key={key}>

                            <td className="config-key">

                              <div className="config-key-name">
                                {key}
                              </div>

                              {CONFIG_DESCRIPTIONS[key] && (
                                <div className="config-key-description">
                                  {CONFIG_DESCRIPTIONS[key]}
                                </div>
                              )}

                            </td>

                            <td>

                              <span
                                className={`editable-config ${
                                  editingParam === key
                                    ? 'editing-highlight'
                                    : ''
                                }`}
                                onDoubleClick={() =>
                                  handleConfigDoubleClick(key, value)
                                }
                              >
                                {value}
                              </span>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              </div>

              <div className="topic-section">

                <h3>Партиции</h3>

                <div className="topic-config-wrapper">

                  <table className="topic-config-table">

                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Leader</th>
                        <th>ISR</th>
                      </tr>
                    </thead>

                    <tbody>

                      {detailTopic.partitions?.map((partition) => (

                        <tr key={partition.id}>
                          <td>{partition.id}</td>
                          <td>{partition.leader}</td>
                          <td>{partition.isr?.join(', ')}</td>
                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

                {editingParam && (

                  <div className="config-edit-box">

                    <h4>
                      Редактирование: {editingParam}
                    </h4>

                    <input
                      value={editValue}
                      onChange={(e) =>
                        setEditValue(e.target.value)
                      }
                    />

                    <div className="config-edit-actions">

                      <button onClick={handleSaveEdit}>
                        Сохранить
                      </button>

                      <button onClick={handleCancelEdit}>
                        Отмена
                      </button>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        )}

     </div> {/* topics-content */}

      {/* DRAWER */}


      {/* ===================================================== */}
      {/* CREATE MODAL */}
      {/* ===================================================== */}

      {showCreateModal && (

        <div
          className="modal-overlay"
          onClick={() => setShowCreateModal(false)}
        >

          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >

            <h2>Создать топик</h2>

            <form onSubmit={handleCreateTopic}>

              <div className="modal-field">

                <label>Имя топика</label>

                <input
                  type="text"
                  placeholder="Например: orders.events"
                  value={newTopic.topic}
                  onChange={(e) =>
                    setNewTopic({
                      ...newTopic,
                      topic: e.target.value,
                    })
                  }
                  required
                />

              </div>

              <div className="modal-field">

                <label>Количество партиций</label>

                <input
                  type="text"
                  placeholder="1"
                  value={newTopic.partitions}
                  onChange={(e) =>
                    setNewTopic({
                      ...newTopic,
                      partitions: e.target.value,
                    })
                  }
                />

              </div>

              <div className="modal-field">

                <label>Фактор репликации</label>

                <input
                  type="text"
                  placeholder="1"
                  value={newTopic.replication}
                  onChange={(e) =>
                    setNewTopic({
                      ...newTopic,
                      replication: e.target.value,
                    })
                  }
                />

              </div>

              <button
                type="button"
                className="advanced-toggle"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced
                  ? 'Скрыть дополнительные параметры'
                  : 'Дополнительные параметры'}
              </button>

              {showAdvanced && (

                <div className="advanced-section">

                  <div className="modal-field">

                    <label>cleanup.policy</label>

                    <select
                      value={newTopic.cleanupPolicy}
                      onChange={(e) =>
                        setNewTopic({
                          ...newTopic,
                          cleanupPolicy: e.target.value,
                        })
                      }
                    >

                      <option value="delete">
                        delete
                      </option>

                      <option value="compact">
                        compact
                      </option>

                      <option value="compact,delete">
                        compact,delete
                      </option>

                    </select>

                  </div>

                  <div className="modal-field">

                    <label>retention.ms</label>

                    <input
                      type="text"
                      value={newTopic.retentionMs}
                      onChange={(e) =>
                        setNewTopic({
                          ...newTopic,
                          retentionMs: e.target.value,
                        })
                      }
                    />

                  </div>

                  <div className="modal-field">

                    <label>min.insync.replicas</label>

                    <input
                      type="text"
                      placeholder="1"
                      value={newTopic.minInSyncReplicas}
                      onChange={(e) =>
                        setNewTopic({
                          ...newTopic,
                          minInSyncReplicas: e.target.value,
                        })
                      }
                    />

                  </div>

                </div>

              )}

              <div className="modal-buttons">

                <button type="submit">
                  Создать
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Отмена
                </button>

              </div>

            </form>

          </div>

        </div>

      )}
    </div>
  );
}