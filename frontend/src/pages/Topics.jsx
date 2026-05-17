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
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useCluster } from '../contexts/ClusterContext';

export default function Topics() {
  const { currentCluster } = useCluster();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [detailTopic, setDetailTopic] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    topic: '',
    partitions: '1',
    replication: '1',
    configs: '',
  });
  const [editingParam, setEditingParam] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const panelRef = useRef(null);

  const fetchTopics = async () => {
    if (!currentCluster) return;
    setLoading(true);
    try {
      const response = await axios.get('/api/topics/', {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers },
      });
      const topicsData = response.data.topics || [];
      const normalized = topicsData.map((t) => ({
        name: t.name || t,
        partitions: t.partitions || 0,
        replicationFactor: t.replicationFactor || 1,
      }));
      setTopics(normalized);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка загрузки топиков');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCluster) fetchTopics();
  }, [currentCluster]);

  const loadTopicDetails = async (topicName) => {
    setDetailLoading(true);
    setDetailTopic(null);
    setEditingParam(null);
    try {
      const response = await axios.get(`/api/topics/${encodeURIComponent(topicName)}`, {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers },
      });
      setDetailTopic(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка загрузки деталей топика');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRowClick = (topic) => {
    setSelectedTopic(topic);
    // не открываем панель
  };

  const handleRowDoubleClick = (topic) => {
    setSelectedTopic(topic);
    loadTopicDetails(topic.name);
  };

  const closePanel = () => {
    setSelectedTopic(null);
    setDetailTopic(null);
    setEditingParam(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectedTopic && panelRef.current && !panelRef.current.contains(event.target)) {
        closePanel();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedTopic]);

  // Редактирование конфигурации (двойной клик по значению)
  const handleConfigDoubleClick = (key, currentValue) => {
    setEditingParam(key);
    setEditValue(currentValue);
    setOriginalValue(currentValue);
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
        { configs: { [editingParam]: editValue } },
        { headers: { 'X-Kafka-Bootstrap': currentCluster.brokers } }
      );
      toast.success(`Параметр ${editingParam} обновлён`);
      setDetailTopic((prev) => ({
        ...prev,
        configs: { ...prev.configs, [editingParam]: editValue },
      }));
      setEditingParam(null);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка сохранения: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingParam(null);
    setEditValue('');
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!currentCluster) return;
    if (!newTopic.topic.trim()) {
      toast.error('Введите имя топика');
      return;
    }
    try {
      await axios.post('/api/topics', newTopic, {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers },
      });
      toast.success(`Топик "${newTopic.topic}" создан!`);
      setNewTopic({ topic: '', partitions: '1', replication: '1', configs: '' });
      setShowCreateModal(false);
      fetchTopics();
    } catch (error) {
      console.error(error);
      toast.error('Ошибка создания топика');
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic) {
      toast.error('Выберите топик для удаления');
      return;
    }
    if (!window.confirm(`Удалить топик "${selectedTopic.name}"?`)) return;
    try {
      await axios.delete(`/api/topics/${encodeURIComponent(selectedTopic.name)}`, {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers },
      });
      toast.success(`Топик "${selectedTopic.name}" удалён`);
      closePanel();
      fetchTopics();
    } catch (error) {
      console.error(error);
      toast.error('Ошибка удаления топика');
    }
  };

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="topics-container">
      <Toaster position="top-right" />
      <h1>Управление топиками</h1>
      <div className="topics-toolbar">
        <input
          type="text"
          placeholder="Поиск по названию топика..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
        <div className="action-buttons">
          <button
            className="action-btn"
            onClick={() => setShowCreateModal(true)}
            title="Создать новый топик"
          >
            Create
          </button>
          <button
            className="action-btn delete"
            onClick={handleDeleteTopic}
            disabled={!selectedTopic}
            title="Удалить выбранный топик"
          >
            Delete
          </button>
        </div>
      </div>
      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <table className="topics-table">
          <thead>
            <tr>
              <th>Название топика</th>
              <th>Партиции</th>
              <th>Репликация</th>
            </tr>
          </thead>
          <tbody>
            {filteredTopics.map((topic) => (
              <tr
                key={topic.name}
                onClick={() => handleRowClick(topic)}
                onDoubleClick={() => handleRowDoubleClick(topic)}
                className={selectedTopic?.name === topic.name ? 'selected' : ''}
                title="Двойной клик – показать детали"
              >
                <td>{topic.name}</td>
                <td>{topic.partitions}</td>
                <td>{topic.replicationFactor}</td>
              </tr>
            ))}
            {filteredTopics.length === 0 && (
              <tr>
                <td colSpan="3">Нет топиков</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {selectedTopic && detailTopic && (
        <div className="floating-details-panel" ref={panelRef}>
          <div className="panel-header">
            <h2>Детали топика</h2>
            <button className="close-panel" onClick={closePanel}>
              Скрыть
            </button>
          </div>
          {detailLoading && <div className="loading">Загрузка деталей...</div>}
          {!detailLoading && detailTopic && (
            <>
              <p>
                <strong>Название топика:</strong> {selectedTopic.name}
              </p>
              <p>
                <strong title="Количество копий каждой партиции">Фактор репликации:</strong>{' '}
                {detailTopic.replicationFactor}
              </p>
              <h3>Партиции</h3>
              <div className="partitions-scroll">
                <table className="partitions-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Лидер</th>
                      <th>Реплики</th>
                      <th>ISR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailTopic.partitions?.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.leader}</td>
                        <td>{p.replicas?.join(', ')}</td>
                        <td>{p.isr?.join(', ')}</td>
                       </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="config-hint">Двойной клик по значению параметра – редактирование</div>
              <h3>Конфигурация</h3>
              <div className="config-table-wrapper">
                <table className="configs-table">
                  <thead>
                    <tr>
                      <th>Параметр</th>
                      <th>Значение</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(detailTopic.configs || {}).map(([key, value]) => (
                      <tr
                        key={key}
                        className={editingParam === key ? 'editing-row' : ''}
                      >
                        <td className="config-key">{key}</td>
                        <td
                          className="config-value"
                          onDoubleClick={() => handleConfigDoubleClick(key, value)}
                          title="Двойной клик – редактировать параметр"
                        >
                          {value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Блок редактирования внизу панели */}
              {editingParam && (
                <div className="edit-panel">
                  <h4>Редактирование параметра: {editingParam}</h4>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="edit-input"
                    autoFocus
                  />
                  <div className="edit-buttons">
                    <button className="save-edit-btn" onClick={handleSaveEdit}>
                      Сохранить
                    </button>
                    <button className="cancel-edit-btn" onClick={handleCancelEdit}>
                      Отмена
                    </button>
                  </div>
                </div>
              )}

            </>
          )}
          {!detailLoading && !detailTopic && (
            <div className="placeholder">Не удалось загрузить детали</div>
          )}
        </div>
      )}
      {!detailTopic && selectedTopic && detailLoading && (
        <div className="floating-details-panel" ref={panelRef}>
          <div className="panel-header">
            <h2>Детали топика</h2>
            <button className="close-panel" onClick={closePanel}>Скрыть</button>
          </div>
          <div className="loading">Загрузка деталей...</div>
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Создать топик</h2>
            <form onSubmit={handleCreateTopic}>
              <input
                type="text"
                name="topic"
                placeholder="Имя топика *"
                value={newTopic.topic}
                onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })}
                required
              />
              <input
                type="text"
                name="partitions"
                placeholder="Партиции (по умолч. 1)"
                value={newTopic.partitions}
                onChange={(e) => setNewTopic({ ...newTopic, partitions: e.target.value })}
              />
              <input
                type="text"
                name="replication"
                placeholder="Репликация (по умолч. 1)"
                value={newTopic.replication}
                onChange={(e) => setNewTopic({ ...newTopic, replication: e.target.value })}
              />
              <input
                type="text"
                name="configs"
                placeholder="Конфиги (key=value, через запятую)"
                value={newTopic.configs}
                onChange={(e) => setNewTopic({ ...newTopic, configs: e.target.value })}
              />
              <div className="modal-buttons">
                <button type="submit">Создать</button>
                <button type="button" onClick={() => setShowCreateModal(false)}>
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