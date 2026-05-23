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

  // =========================================================
  // TABLE EVENTS
  // =========================================================

  const handleRowClick = (topic) => {

    setSelectedTopic(topic);
  };

  const handleRowDoubleClick = (topic) => {

    setSelectedTopic(topic);

    loadTopicDetails(topic.name);
  };

  // =========================================================
  // CLOSE PANEL
  // =========================================================

  const closePanel = () => {

    setSelectedTopic(null);

    setDetailTopic(null);

    setEditingParam(null);
  };

  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        selectedTopic &&
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

  }, [selectedTopic]);

  // =========================================================
  // EDIT CONFIG
  // =========================================================

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

      await axios.post('/api/topics', newTopic, {
        headers: {
          'X-Kafka-Bootstrap': currentCluster.brokers,
        },
      });

      toast.success(`Топик "${newTopic.topic}" создан`);

      setNewTopic({
        topic: '',
        partitions: '1',
        replication: '1',
        configs: '',
      });

      setShowCreateModal(false);

      fetchTopics();

    } catch (error) {

      console.error(error);

      toast.error('Ошибка создания топика');
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

  // =========================================================
  // FILTER
  // =========================================================

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(filter.toLowerCase())
  );

  // =========================================================
  // RENDER
  // =========================================================

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

          <button
            className="action-btn"
            onClick={() => setShowCreateModal(true)}
          >
            Создать
          </button>

          <button
            className="action-btn delete"
            onClick={handleDeleteTopic}
            disabled={!selectedTopic}
          >
            Удалить
          </button>

        </div>

      </div>

      <div className="topics-table-wrapper">

        <table className="topics-table">

          <thead>

            <tr>

              <th>Название</th>

              <th>Партиции</th>

              <th>Репликация</th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>
                <td colSpan="3" className="topics-loading">
                  Загрузка топиков...
                </td>
              </tr>

            ) : filteredTopics.length === 0 ? (

              <tr>
                <td colSpan="3" className="topics-empty-cell">

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
                  onClick={() => handleRowClick(topic)}
                  onDoubleClick={() => handleRowDoubleClick(topic)}
                  className={
                    selectedTopic?.name === topic.name
                      ? 'selected'
                      : ''
                  }
                >

                  <td className="topic-name">
                    {topic.name}
                  </td>

                  <td>
                    {topic.partitions}
                  </td>

                  <td>
                    {topic.replicationFactor}
                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {selectedTopic && detailTopic && (

        <div
          className="floating-details-panel"
          ref={panelRef}
        >

          <div className="panel-header">

            <h2>Детали топика</h2>

            <button
              className="close-panel"
              onClick={closePanel}
            >
              Скрыть
            </button>

          </div>

          {detailLoading ? (

            <div className="loading">
              Загрузка деталей...
            </div>

          ) : (

            <>

              <p>
                <strong>Название:</strong>{' '}
                {selectedTopic.name}
              </p>

              <p>
                <strong>
                  Фактор репликации:
                </strong>{' '}
                {detailTopic.replicationFactor}
              </p>

            </>

          )}

        </div>

      )}

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

              <input
                type="text"
                placeholder="Имя топика"
                value={newTopic.topic}
                onChange={(e) =>
                  setNewTopic({
                    ...newTopic,
                    topic: e.target.value,
                  })
                }
                required
              />

              <input
                type="text"
                placeholder="Партиции"
                value={newTopic.partitions}
                onChange={(e) =>
                  setNewTopic({
                    ...newTopic,
                    partitions: e.target.value,
                  })
                }
              />

              <input
                type="text"
                placeholder="Репликация"
                value={newTopic.replication}
                onChange={(e) =>
                  setNewTopic({
                    ...newTopic,
                    replication: e.target.value,
                  })
                }
              />

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