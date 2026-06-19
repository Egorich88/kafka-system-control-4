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
 * @fileoverview Панель инструментов поиска: выбор топика, партиции,
 * диапазоны оффсетов, поиск по ключу/значению, кнопка поиска.
 */

import { FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi'
import { useState } from 'react';

export default function SearchToolbar({
  handleSearch,
  topicDropdownRef,
  partitionDropdownRef,
  isTopicDropdownOpen,
  setIsTopicDropdownOpen,
  topicSearch,
  setTopicSearch,
  selectedTopic,
  setSelectedTopic,
  filteredTopics,
  partition,
  setPartition,
  partitions,
  isPartitionDropdownOpen,
  setIsPartitionDropdownOpen,
  startOffset,
  setStartOffset,
  endOffset,
  setEndOffset,
  maxMessages,
  setMaxMessages,
  setCurrentPage,
  searching,
  currentCluster,
  searchKeyword,
  setSearchKeyword
}) {
  const [focusedField, setFocusedField] = useState(null);

  // Флаг: выбран ли топик
  const hasTopic = Boolean(selectedTopic);

  return (
    <form className="search-toolbar" onSubmit={handleSearch}>
      {/* Топик – уменьшенная ширина через CSS-класс */}
      <div className="search-field topic-field">
        <label>Топик</label>
        <div ref={topicDropdownRef} className="topic-dropdown-wrapper">
          <div
            className={`topic-dropdown-trigger ${isTopicDropdownOpen ? 'open' : ''}`}
            onClick={() => setIsTopicDropdownOpen(true)}
          >
            <FiSearch className="topic-dropdown-search-icon" />
            <input
              type="text"
              className="topic-dropdown-input"
              placeholder={isTopicDropdownOpen ? 'Поиск топика...' : 'Выберите топик'}
              value={isTopicDropdownOpen ? topicSearch : (selectedTopic || '')}
              onChange={(e) => {
                setTopicSearch(e.target.value)
                setIsTopicDropdownOpen(true)
              }}
              onFocus={() => setIsTopicDropdownOpen(true)}
            />
            <div className="topic-dropdown-chevron">
              {isTopicDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </div>
          {isTopicDropdownOpen && (
            <div className="topic-dropdown-menu">
              <div className="topic-dropdown-list">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map(topic => (
                    <div
                      key={topic}
                      className={`topic-dropdown-item ${selectedTopic === topic ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedTopic(topic)
                        setTopicSearch('')
                        setIsTopicDropdownOpen(false)
                      }}
                    >
                      {topic}
                    </div>
                  ))
                ) : (
                  <div className="topic-dropdown-item">Ничего не найдено</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Партиция – если топик не выбран, дропдаун заблокирован */}
      <div className="search-field">
        <label>Партиция</label>
        <div ref={partitionDropdownRef} className="topic-dropdown-wrapper">
          <div
            className={`topic-dropdown-trigger ${isPartitionDropdownOpen ? 'open' : ''} ${!hasTopic ? 'disabled' : ''}`}
            onClick={() => {
              if (!hasTopic) return; // Не открываем, если нет топика
              setIsPartitionDropdownOpen(!isPartitionDropdownOpen)
            }}
            style={{ opacity: hasTopic ? 1 : 0.5, cursor: hasTopic ? 'pointer' : 'not-allowed' }}
          >
            <span className="topic-dropdown-value">
              {partition === "all" ? "Все партиции" : `Партиция ${partition}`}
            </span>
            <div className="topic-dropdown-chevron">
              {isPartitionDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
            </div>
          </div>
          {hasTopic && isPartitionDropdownOpen && (
            <div className="topic-dropdown-menu">
              <div className="topic-dropdown-list">
                <div
                  className={`topic-dropdown-item ${partition === "all" ? "active" : ""}`}
                  onClick={() => { setPartition("all"); setIsPartitionDropdownOpen(false) }}
                >
                  Все партиции
                </div>
                {partitions.map((p) => (
                  <div
                    key={p}
                    className={`topic-dropdown-item ${partition === String(p) ? "active" : ""}`}
                    onClick={() => { setPartition(String(p)); setCurrentPage(1); setIsPartitionDropdownOpen(false) }}
                  >
                    Партиция {p}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Поиск по ключу или значению */}
      <div className={`search-field ${focusedField === 'searchKeyword' ? 'focused' : ''}`}>
        <label>Поиск в сообщениях</label>
        <input
          type="text"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder="Ключ или текст в значении..."
          onFocus={() => setFocusedField('searchKeyword')}
          onBlur={() => setFocusedField(null)}
        />
      </div>

      {/* Остальные поля */}
      <div className={`search-field ${focusedField === 'startOffset' ? 'focused' : ''}`}>
        <label>Начальный offset</label>
        <input
          type="number"
          value={startOffset}
          onChange={(e) => setStartOffset(e.target.value)}
          onFocus={() => setFocusedField('startOffset')}
          onBlur={() => setFocusedField(null)}
        />
      </div>

      <div className={`search-field ${focusedField === 'endOffset' ? 'focused' : ''}`}>
        <label>Конечный offset</label>
        <input
          type="number"
          value={endOffset}
          onChange={(e) => setEndOffset(e.target.value)}
          onFocus={() => setFocusedField('endOffset')}
          onBlur={() => setFocusedField(null)}
        />
      </div>

      <div className={`search-field ${focusedField === 'maxMessages' ? 'focused' : ''}`}>
        <label>Макс. сообщений</label>
        <input
          type="number"
          value={maxMessages}
          onChange={(e) => setMaxMessages(Number(e.target.value))}
          min="1"
          onFocus={() => setFocusedField('maxMessages')}
          onBlur={() => setFocusedField(null)}
        />
      </div>

      <button
        type="submit"
        className="search-submit-btn"
        disabled={searching || !selectedTopic || !currentCluster}
      >
        {searching ? 'Поиск...' : <><FiSearch /> Найти</>}
      </button>
    </form>
  )
}