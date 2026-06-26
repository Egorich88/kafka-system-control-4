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
 * @fileoverview Панель инструментов управления топиками
 * Содержит поле поиска, кнопки экспорта, создания и удаления
 */

import { FiDownload, FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function TopicToolbar({
  filter,
  setFilter,
  showExportMenu,
  setShowExportMenu,
  selectedTopics,
  exportMenuRef,
  exportTopicsList,
  exportTopicsConfig,
  setShowCreateModal,
  selectedTopic,
  handleDeleteTopic,
}) {
  return (
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
            <FiDownload className="export-icon" />
            Экспорт ({selectedTopics.length})
            {showExportMenu ? <FiChevronUp className="export-chevron" /> : <FiChevronDown className="export-chevron" />}
          </button>

          {showExportMenu && (
            <div className="export-menu">
              <button className="export-item" onClick={exportTopicsList}>
                📄 Список топиков
              </button>
              <button className="export-item" onClick={exportTopicsConfig}>
                📄 Конфигурация топиков
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
  );
}