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

/* =====================================================
           ПОСЛЕДНИЕ СОБЫТИЯ KAFKA-КЛАСТЕРА.

    В будущем здесь будут отображаться:
      - создание топиков
      - удаление топиков
      - подключение брокеров
      - смена контроллера
      - ошибки кластера
======================================================== */
import { useEffect, useState } from 'react';
import axios from 'axios';
import '../../styles/overview/events-panel.css';

export default function EventsPanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/overview/events');
      setEvents(res.data.events || []);
    } catch (e) {
      console.error('Failed to load events', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();

    const interval = setInterval(() => {
      loadEvents();
    }, 10000); // автообновление 10 сек

    return () => clearInterval(interval);
  }, []);

  const getLevelClass = (level) => {
    switch (level) {
      case 'INFO':
        return 'event-level-info';
      case 'WARN':
        return 'event-level-warn';
      case 'ERROR':
        return 'event-level-error';
      default:
        return '';
    }
  };

  return (
    <div className="events-panel">
      <div className="events-panel-header">
        <div className="events-title">Последние события</div>
      </div>

      <div className="events-table">
        <div className="events-table-header">
          <div>Время</div>
          <div>Уровень</div>
          <div>Сообщение</div>
          <div>Источник</div>
        </div>

        {events.map((e, idx) => (
          <div className="events-row" key={idx}>
            <div className="events-cell">{e.time}</div>

            <div className={`events-cell level ${getLevelClass(e.level)}`}>
              {e.level}
            </div>

            <div className="events-cell">{e.message}</div>

            <div className="events-cell source">{e.source}</div>
          </div>
        ))}

        {loading && (
          <div className="events-loading">Загрузка...</div>
        )}
      </div>
    </div>
  );
}