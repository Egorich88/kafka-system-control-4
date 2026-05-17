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
import { useEffect, useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useCluster } from '../contexts/ClusterContext';

export default function Topics() {
  const { currentCluster } = useCluster();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newTopic, setNewTopic] = useState({
    topic: '',
    partitions: '1',
    replication: '1',
    configs: '',
  });

  const fetchTopics = async () => {
    if (!currentCluster) return;
    setLoading(true);
    try {
      const response = await axios.get('/api/topics', {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers }
      });
      setTopics(response.data.topics || []);
    } catch (error) {
      toast.error('Ошибка загрузки топиков');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentCluster) fetchTopics();
  }, [currentCluster]);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!currentCluster) return;
    if (!newTopic.topic.trim()) {
      toast.error('Введите имя топика');
      return;
    }
    try {
      await axios.post('/api/topics', newTopic, {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers }
      });
      toast.success(`Топик "${newTopic.topic}" создан!`);
      setNewTopic({ topic: '', partitions: '1', replication: '1', configs: '' });
      setShowCreateModal(false);
      fetchTopics();
    } catch (error) {
      toast.error('Ошибка создания топика');
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic) {
      toast.error('Выберите топик для удаления');
      return;
    }
    const topicName = selectedTopic.name || selectedTopic;
    if (!window.confirm(`Удалить топик "${topicName}"?`)) return;
    try {
      await axios.delete(`/api/topics/${encodeURIComponent(topicName)}`, {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers }
      });
      toast.success(`Топик "${topicName}" удалён`);
      setSelectedTopic(null);
      fetchTopics();
    } catch (error) {
      toast.error('Ошибка удаления топика');
    }
  };

  const handleRowClick = (topic) => {
    setSelectedTopic(topic);
  };

  const handleRowDoubleClick = (topic) => {
    setSelectedTopic(topic);
    setShowDetailModal(true);
  };

  const filteredTopics = topics.filter(t =>
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
          <button className="action-btn" onClick={() => setShowCreateModal(true)}>Create</button>
          <button className="action-btn delete" onClick={handleDeleteTopic} disabled={!selectedTopic}>Delete</button>
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
            {filteredTopics.map(topic => (
              <tr
                key={topic.name}
                onClick={() => handleRowClick(topic)}
                onDoubleClick={() => handleRowDoubleClick(topic)}
                className={selectedTopic?.name === topic.name ? 'selected' : ''}
              >
                <td>{topic.name}</td>
                <td>{topic.partitions}</td>
                <td>{topic.replicationFactor}</td>
              </tr>
            ))}
            {filteredTopics.length === 0 && (
              <tr><td colSpan="3">Нет топиков</td></tr>
            )}
          </tbody>
        </table>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Создать топик</h2>
            <form onSubmit={handleCreateTopic}>
              <input
                type="text"
                name="topic"
                placeholder="Имя топика *"
                value={newTopic.topic}
                onChange={e => setNewTopic({ ...newTopic, topic: e.target.value })}
                required
              />
              <input
                type="text"
                name="partitions"
                placeholder="Партиции (по умолч. 1)"
                value={newTopic.partitions}
                onChange={e => setNewTopic({ ...newTopic, partitions: e.target.value })}
              />
              <input
                type="text"
                name="replication"
                placeholder="Репликация (по умолч. 1)"
                value={newTopic.replication}
                onChange={e => setNewTopic({ ...newTopic, replication: e.target.value })}
              />
              <input
                type="text"
                name="configs"
                placeholder="Конфиги (key=value, через запятую)"
                value={newTopic.configs}
                onChange={e => setNewTopic({ ...newTopic, configs: e.target.value })}
              />
              <div className="modal-buttons">
                <button type="submit">Создать</button>
                <button type="button" onClick={() => setShowCreateModal(false)}>Отмена</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailModal && selectedTopic && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Детали топика: {selectedTopic.name}</h2>
            <p><strong>Партиции:</strong> {selectedTopic.partitions}</p>
            <p><strong>Фактор репликации:</strong> {selectedTopic.replicationFactor}</p>
            <p><em>Редактирование конфигурации будет добавлено позже.</em></p>
            <div className="modal-buttons">
              <button onClick={() => setShowDetailModal(false)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}