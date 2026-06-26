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
 * @fileoverview Страница управления топиками Kafka.
 * Отображает список топиков с возможностью фильтрации, создания, удаления,
 * просмотра деталей, редактирования конфигурации и экспорта.
 *
 * Структура панели деталей топика:
 *   1. Заголовок с именем топика и кнопкой закрытия
 *   2. Основная информация (имя, фактор репликации)
 *   3. Подсказка "Двойной клик по значению параметра - редактирование"
 *   4. Таблица конфигурации (все параметры с описаниями)
 *   5. Редактирование параметра по двойному клику с сохранением/отменой
 */

import '../styles/topics.css';
import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useCluster } from '../contexts/ClusterContext';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function Topics() {
  // ===========================================================================
  // Хуки контекста и состояния
  // ===========================================================================

  const [selectedConfigParam, setSelectedConfigParam] = useState(null);
  const { currentCluster } = useCluster();

  // Состояние списка топиков
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  // Фильтрация и поиск
  const [filter, setFilter] = useState('');

  // Экспорт
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Выбранный топик для деталей
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Множественный выбор топиков
  const [selectedTopics, setSelectedTopics] = useState([]);

  // Детали топика
  const [detailTopic, setDetailTopic] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Модальное окно создания топика
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Форма создания нового топика
  const [newTopic, setNewTopic] = useState({
    topic: '',
    partitions: '1',
    replication: '1',
    cleanupPolicy: 'delete',
    retentionMs: '604800000',
    minInSyncReplicas: '1',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Редактирование конфигурации
  const [editingParam, setEditingParam] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');

  // Реф для панели деталей (закрытие по клику вне)
  const panelRef = useRef(null);

  // Реф для меню экспорта (закрытие по клику вне)
  const exportMenuRef = useRef(null);

  // ===========================================================================
  // Вспомогательные функции
  // ===========================================================================

  /**
   * Форматирует значение retention.ms в человекочитаемый вид
   * @param {string} value - Значение в миллисекундах
   * @returns {string} - Отформатированная строка (например, "7d", "24h", "infinite")
   */
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

  /**
   * Описания параметров конфигурации топика для отображения подсказок
   * Используются в таблице конфигурации панели деталей
   */
  const CONFIG_DESCRIPTIONS = {
    'cleanup.policy': 'Политика очистки топика (delete, compact, compact,delete)',
    'retention.ms': 'Время хранения сообщений в миллисекундах',
    'min.insync.replicas': 'Минимальное количество синхронных реплик для записи',
    'segment.bytes': 'Максимальный размер сегмента лога в байтах',
    'segment.ms': 'Время жизни сегмента лога в миллисекундах',
    'compression.type': 'Тип сжатия сообщений (gzip, snappy, lz4, zstd)',
    'max.message.bytes': 'Максимальный размер сообщения в байтах',
    'message.timestamp.type': 'Тип временной метки (CreateTime, LogAppendTime)',
    'unclean.leader.election.enable': 'Разрешить выбор лидера из несинхронных реплик',
    'delete.retention.ms': 'Время хранения удалённых записей',
    'file.delete.delay.ms': 'Задержка удаления файлов сегментов',
    'flush.messages': 'Количество сообщений для принудительной записи на диск',
    'flush.ms': 'Интервал принудительной записи на диск',
    'segment.index.bytes': 'Размер индексного файла сегмента',
    'segment.jitter.ms': 'Случайное отклонение времени ротации сегмента',
    'retention.bytes': 'Максимальный размер данных топика',
    'message.max.bytes': 'Максимальный размер сообщения',
  };

  // ===========================================================================
  // Эффекты
  // ===========================================================================

  /**
   * Блокировка прокрутки страницы при открытой панели деталей топика
   */
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

  /**
   * Сброс всех состояний при смене кластера
   */
  useEffect(() => {
    setTopics([]);
    setSelectedTopic(null);
    setDetailTopic(null);
    setEditingParam(null);
    setFilter('');
    setSelectedTopics([]);
    setSelectedConfigParam(null);
  }, [currentCluster?.brokers]);

  // ===========================================================================
  // Загрузка данных
  // ===========================================================================

  /**
   * Загружает список топиков из API
   */
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
        cleanupPolicy: t.cleanupPolicy || t['cleanup.policy'] || '-',
        retentionMs: t.retentionMs || t['retention.ms'] || '-',
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

  /**
   * Загружает детальную информацию о выбранном топике
   * @param {string} topicName - Имя топика
   */
  const loadTopicDetails = async (topicName) => {
    if (!currentCluster) return;

    setDetailLoading(true);
    setDetailTopic(null);
    setEditingParam(null);
    setSelectedConfigParam(null);

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

  // ===========================================================================
  // Обработчики событий таблицы
  // ===========================================================================

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

  // ===========================================================================
  // Управление панелью деталей
  // ===========================================================================

  const closePanel = () => {
    setDetailTopic(null);
    setEditingParam(null);
    setSelectedConfigParam(null);
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

  // ===========================================================================
  // Редактирование конфигурации
  // ===========================================================================

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
      setSelectedConfigParam(null);
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
    setSelectedConfigParam(null);
  };

  // ===========================================================================
  // Управление топиками (создание, удаление)
  // ===========================================================================

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
          'min.insync.replicas': newTopic.minInSyncReplicas,
        };
      }

      await axios.post('/api/topics', payload, {
        headers: {
          'X-Kafka-Bootstrap': currentCluster.brokers,
        },
      });

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
      const backendError = error.response?.data?.error || '';

      if (
        backendError.includes('Topic name is invalid') ||
        backendError.includes('contains one or more characters')
      ) {
        toast.error(
          'Ошибка создания топика. Используйте только латинские символы, цифры, ".", "_" или "-"'
        );
      } else {
        toast.error(backendError || 'Ошибка создания топика');
      }
    }
  };

  const handleDeleteTopic = async () => {
    if (!selectedTopic) {
      toast.error('Выберите топик');
      return;
    }

    if (!window.confirm(`Удалить топик "${selectedTopic.name}"?`)) {
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

  // ===========================================================================
  // Экспорт данных
  // ===========================================================================

  const exportTopicsList = () => {
    const selected =
      selectedTopics.length > 0
        ? topics.filter((t) => selectedTopics.includes(t.name))
        : topics;

    const content = selected.map((t) => t.name).join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'topics-list.txt';
    link.click();
    window.URL.revokeObjectURL(url);

    setShowExportMenu(false);
    toast.success(`Экспортировано ${selected.length} топиков`);
  };

  const exportTopicsConfig = async () => {
    if (!currentCluster) {
      return;
    }

    try {
      const selected =
        selectedTopics.length > 0
          ? topics.filter((t) => selectedTopics.includes(t.name))
          : topics;

      const result = [];

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

      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: 'application/json;charset=utf-8',
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `topics-config-${selected.length}.json`;
      link.click();
      window.URL.revokeObjectURL(url);

      setShowExportMenu(false);
      toast.success(`Экспортировано ${selected.length} топиков`);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка экспорта конфигурации');
    }
  };

  // Закрытие меню экспорта при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  // ===========================================================================
  // Фильтрация данных
  // ===========================================================================

  const filteredTopics = topics.filter((topic) =>
    topic.name.toLowerCase().includes(filter.toLowerCase())
  );

  // ===========================================================================
  // Рендер компонента
  // ===========================================================================

  return (
    <div className="topics-container">
      <Toaster position="top-right" />

      {/* Заголовок страницы */}
      <div className="topics-header">
        <div>
          <h1 className="topics-title">Управление топиками</h1>
        </div>
      </div>

      {/* Панель инструментов */}
      <div className="topics-toolbar">
        <div className="toolbar-left">
          {/* Поле поиска */}
          <input
            type="text"
            placeholder="Поиск топика..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-input"
          />

          {/* Экспорт с выпадающим меню */}
          <div className="export-dropdown-wrapper" ref={exportMenuRef}>
            <button
              className="action-btn export-btn"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              Экспорт ({selectedTopics.length || topics.length})
              {showExportMenu ? <FiChevronUp /> : <FiChevronDown />}
            </button>

            {showExportMenu && (
              <div className="export-menu">
                <button className="export-item" onClick={exportTopicsList}>
                  <div className="export-item-title">📄 Список топиков</div>
                  <div className="export-item-desc">Экспортировать выбранные топики без конфигурации</div>
                </button>
                <button className="export-item" onClick={exportTopicsConfig}>
                  <div className="export-item-title">📄 Конфигурация топиков</div>
                  <div className="export-item-desc">Экспортировать выбранные топики со всей конфигурацией</div>
                </button>
              </div>
            )}
          </div>

          {/* Кнопка создания топика */}
          <button className="action-btn" onClick={() => setShowCreateModal(true)}>
            Создать
          </button>

          {/* Кнопка удаления топика */}
          <button
            className="action-btn delete"
            onClick={handleDeleteTopic}
            disabled={!selectedTopic}
          >
            Удалить
          </button>
        </div>
      </div>

      {/* Основное содержимое страницы */}
      <div className={`topics-content ${detailTopic ? 'with-details' : ''}`}>
        {/* Таблица топиков */}
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
                  <td colSpan="6" className="topics-loading">
                    Загрузка топиков...
                  </td>
                </tr>
              ) : filteredTopics.length === 0 ? (
                <tr>
                  <td colSpan="6" className="topics-empty-cell">
                    <div className="topics-empty">
                      <h3>Топики отсутствуют</h3>
                      <p>
                        В выбранном кластере нет топиков либо кластер недоступен.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTopics.map((topic) => (
                  <tr
                    key={topic.name}
                    className={
                      selectedTopic?.name === topic.name ? 'selected' : ''
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
                    <td className="topic-name">{topic.name}</td>
                    <td>{topic.partitions}</td>
                    <td>{topic.replicationFactor}</td>
                    <td>{topic.cleanupPolicy}</td>
                    <td>{formatRetention(topic.retentionMs)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Панель деталей топика */}
        {detailTopic && (
          <div className="topic-details-panel" ref={panelRef}>
            {/* Заголовок панели */}
            <div className="topic-details-header">
              <h2>Детали топика</h2>
              <button className="topic-hide-btn" onClick={closePanel}>
                Скрыть
              </button>
            </div>

            <div className="topic-details-body">
              {/* Основная информация */}
              <div className="topic-summary">
                <div>
                  <strong>Имя топика:</strong> {detailTopic.name}
                </div>
                <div>
                  <strong>Сообщений:</strong> {detailTopic.messageCount ?? '-'}
                </div>
                <div>
                  <strong>Фактор репликации:</strong> {detailTopic.replicationFactor}
                </div>
                <div>
                  <strong>Партиций:</strong> {detailTopic.partitions?.length ?? 0}
                </div>
              </div>

              {/* Подсказка о редактировании */}
              <div className="topic-hint">
                Двойной клик по значению параметра — редактирование
              </div>

              {/* Блок конфигурации топика */}
              <div className="topic-section topic-config-section">
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
                          <tr
                            key={key}
                            className={
                              selectedConfigParam === key ? 'active-config' : ''
                            }
                            onClick={() => setSelectedConfigParam(key)}
                          >
                            <td className="config-key-cell">
                              <div className="config-key-name">{key}</div>
                              {CONFIG_DESCRIPTIONS[key] && (
                                <div className="config-key-desc">
                                  {CONFIG_DESCRIPTIONS[key]}
                                </div>
                              )}
                            </td>
                            <td>
                              <span
                                className={`config-value ${
                                  editingParam === key ? 'editing' : ''
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

              {/* Редактирование параметра */}
              {editingParam && (
                <div className="config-edit-box">
                  <h4>Редактирование: {editingParam}</h4>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                  />
                  <div className="config-edit-actions">
                    <button className="save-btn" onClick={handleSaveEdit}>
                      Сохранить
                    </button>
                    <button className="cancel-btn" onClick={handleCancelEdit}>
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Модальное окно создания топика */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
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
                      <option value="delete">delete</option>
                      <option value="compact">compact</option>
                      <option value="compact,delete">compact,delete</option>
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