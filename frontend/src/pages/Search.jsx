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
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useCluster } from '../contexts/ClusterContext';

export default function Search() {
  const { currentCluster } = useCluster();
  const [searchParams, setSearchParams] = useSearchParams();
  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [partition, setPartition] = useState(searchParams.get('partition') || '0');
  const [offset, setOffset] = useState('0');
  const [limit, setLimit] = useState('10');
  const [messages, setMessages] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!currentCluster) return;
    const loadTopics = async () => {
      setLoadingTopics(true);
      try {
        const response = await axios.get('/api/topics', {
          headers: { 'X-Kafka-Bootstrap': currentCluster.brokers }
        });
        let topicsList = response.data.topics || [];
        if (topicsList.length > 0 && typeof topicsList[0] === 'object') {
          topicsList = topicsList.map(t => t.name);
        }
        setTopics(topicsList);
      } catch (err) {
        toast.error('Ошибка загрузки топиков: ' + err.message);
      } finally {
        setLoadingTopics(false);
      }
    };
    loadTopics();
  }, [currentCluster]);

  useEffect(() => {
    if (selectedTopic) {
      setSearchParams({ topic: selectedTopic, partition });
    } else {
      setSearchParams({});
    }
  }, [selectedTopic, partition, setSearchParams]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedTopic) {
      toast.error('Выберите топик');
      return;
    }
    if (!currentCluster) {
      toast.error('Нет активного кластера');
      return;
    }
    setSearching(true);
    try {
      const url = `/api/topics/${encodeURIComponent(selectedTopic)}/messages?partition=${partition}&offset=${offset}&limit=${limit}`;
      const response = await axios.get(url, {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers }
      });
      setMessages(response.data.messages || []);
      toast.success(`Получено ${response.data.messages?.length || 0} сообщений`);
    } catch (err) {
      toast.error('Ошибка чтения сообщений: ' + (err.response?.data?.error || err.message));
      setMessages([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="search-container">
      <Toaster position="top-right" />
      <h1>Поиск сообщений</h1>
      <div className="card">
        <form onSubmit={handleSearch}>
          <div className="form-row">
            <label>Топик:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              required
              disabled={loadingTopics}
            >
              <option value="">-- Выберите топик --</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>Партиция:</label>
            <input
              type="number"
              value={partition}
              onChange={(e) => setPartition(e.target.value)}
              min="0"
              required
            />
          </div>
          <div className="form-row">
            <label>Начальное смещение (offset):</label>
            <input
              type="number"
              value={offset}
              onChange={(e) => setOffset(e.target.value)}
              min="0"
            />
          </div>
          <div className="form-row">
            <label>Количество сообщений (limit):</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              min="1"
              max="1000"
            />
          </div>
          <button type="submit" disabled={searching || !selectedTopic || !currentCluster}>
            {searching ? 'Поиск...' : 'Найти сообщения'}
          </button>
        </form>
      </div>

      {messages.length > 0 && (
        <div className="card">
          <h2>Результаты поиска</h2>
          <div className="messages-list">
            {messages.map((msg, idx) => (
              <div key={idx} className="message-item">
                <div><strong>Offset:</strong> {msg.offset}</div>
                <div><strong>Key:</strong> {msg.key || '—'}</div>
                <div><strong>Value:</strong> {msg.value}</div>
                <div><strong>Timestamp:</strong> {msg.timestamp}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}