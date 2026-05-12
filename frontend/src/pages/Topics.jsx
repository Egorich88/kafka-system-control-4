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

export default function Topics() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTopic, setNewTopic] = useState({
    topic: '',
    partitions: '1',
    replication: '1',
    configs: '',
  });

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/topics');
      setTopics(response.data.topics || []);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка загрузки топиков');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopic.topic.trim()) {
      toast.error('Введите имя топика');
      return;
    }

    try {
      const response = await axios.post('/api/topics', newTopic);
      if (response.data.success) {
        toast.success(`Топик "${newTopic.topic}" создан!`);
        setNewTopic({ topic: '', partitions: '1', replication: '1', configs: '' });
        fetchTopics();
      } else {
        toast.error(response.data.error || 'Ошибка создания топика');
      }
    } catch (error) {
      console.error(error);
      toast.error('Ошибка соединения с сервером');
    }
  };

  const handleChange = (e) => {
    setNewTopic({ ...newTopic, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <Toaster position="top-right" />
      <h1>Управление топиками</h1>
      <div className="card">
        <h2>Создать топик</h2>
        <form onSubmit={handleCreateTopic}>
          <input
            type="text"
            name="topic"
            placeholder="Имя топика *"
            value={newTopic.topic}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="partitions"
            placeholder="Партиции (по умолч. 1)"
            value={newTopic.partitions}
            onChange={handleChange}
          />
          <input
            type="text"
            name="replication"
            placeholder="Репликация (по умолч. 1)"
            value={newTopic.replication}
            onChange={handleChange}
          />
          <input
            type="text"
            name="configs"
            placeholder="Конфиги (key=value, через запятую)"
            value={newTopic.configs}
            onChange={handleChange}
          />
          <button type="submit">Создать</button>
        </form>
      </div>
      <div className="card">
        <h2>Список топиков</h2>
        {loading ? (
          <p>Загрузка...</p>
        ) : topics.length === 0 ? (
          <p>Нет топиков</p>
        ) : (
          <ul>
            {topics.map((topic) => (
              <li key={topic}>{topic}</li>
            ))}
          </ul>
        )}
        <button onClick={fetchTopics} className="secondary">Обновить список</button>
      </div>
    </div>
  );
}