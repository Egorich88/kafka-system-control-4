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
 * @fileoverview Таблица со списком топиков
 */

import { formatRetention } from '../hooks/useTopics';

export default function TopicTable({
  loading,
  filteredTopics,
  selectedTopics,
  toggleSelectAll,
  selectedTopic,
  handleRowClick,
  toggleTopicSelection,
}) {
  return (
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
  );
}