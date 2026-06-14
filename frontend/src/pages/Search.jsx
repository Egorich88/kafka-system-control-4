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
 * @fileoverview Страница поиска сообщений в Kafka.
 * Позволяет выбрать топик, партицию, диапазон оффсетов,
 * просматривать сообщения, экспортировать их в JSON/CSV/TXT.
 */

import SearchToolbar from '../pages/search/SearchToolbar'
import MessagesTable from '../pages/search/MessagesTable'
import Pagination from '../pages/search/Pagination'
import ExportDropdown from '../pages/search/ExportDropdown'
import MessageViewer from '../pages/search/MessageViewer'
import '../styles/search.css';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useCluster } from '../contexts/ClusterContext';

export default function Search() {
  const { currentCluster } = useCluster();
  const [searchParams, setSearchParams] = useSearchParams();

  // Состояния формы поиска
  const [startOffset, setStartOffset] = useState('')
  const [endOffset, setEndOffset] = useState('')
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [partition, setPartition] = useState(searchParams.get('partition') || 'all');
  const [messages, setMessages] = useState([])
  const [maxMessages, setMaxMessages] = useState(100)
  const [partitions, setPartitions] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])        // хранит уникальные ключи сообщений: "topic-partition-offset"
  const [viewFormat, setViewFormat] = useState("json")
  const [exportMenu, setExportMenu] = useState(null)          // какой тип экспорта открыт: 'selected' или 'all'
  const [searching, setSearching] = useState(false);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [isPartitionDropdownOpen, setIsPartitionDropdownOpen] = useState(false)
  const [topicSearch, setTopicSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMessages, setTotalMessages] = useState(0)

  const pageSize = 25
  const totalPages = Math.max(1, Math.ceil(totalMessages / pageSize))

  // --- Работа с выделением строк (чекбоксами) ---
  // Уникальный ключ для сообщения: `${selectedTopic}-${partition}-${offset}`
  const getRowKey = (msg) => `${selectedTopic}-${msg.partition}-${msg.offset}`

  // Переключение состояния одного чекбокса
  const toggleRowSelection = (rowKey) => {
    setSelectedRows((prev) => {
      if (prev.includes(rowKey)) {
        return prev.filter((v) => v !== rowKey)
      }
      return [...prev, rowKey]
    })
  }

  // Выбрать / отменить выбор всех сообщений на текущей странице
  const toggleAllRows = () => {
    const currentPageKeys = messages.map(getRowKey)
    const allSelected = currentPageKeys.every(key => selectedRows.includes(key))
    if (allSelected) {
      // убираем только те, которые на текущей странице
      setSelectedRows(prev => prev.filter(key => !currentPageKeys.includes(key)))
    } else {
      // добавляем все с текущей страницы
      const newKeys = currentPageKeys.filter(key => !selectedRows.includes(key))
      setSelectedRows(prev => [...prev, ...newKeys])
    }
  }

  // Проверка: выбраны ли все сообщения на текущей странице
  const allCurrentSelected = messages.length > 0 && messages.every(msg => selectedRows.includes(getRowKey(msg)))

  // Ссылки для закрытия выпадающих списков при клике вне
  const topicDropdownRef = useRef(null);
  const partitionDropdownRef = useRef(null);

  // --- Загрузка списка топиков при смене кластера ---
  useEffect(() => {
    if (!currentCluster) return;
    const loadTopics = async () => {
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
        toast.error('Ошибка загрузки топиков');
      }
    };
    loadTopics();
  }, [currentCluster]);

  // --- Загрузка списка партиций при выборе топика ---
  useEffect(() => {
    if (!selectedTopic || !currentCluster) return;
    axios.get(`/api/topics/${selectedTopic}/partitions`, {
      headers: { 'X-Kafka-Bootstrap': currentCluster.brokers }
    }).then((res) => {
      console.log("PARTITIONS RESPONSE:", res.data)
      setPartitions(res.data.partitions || [])
    }).catch(() => setPartitions([]))
  }, [selectedTopic, currentCluster])

  // --- Синхронизация URL параметров с состоянием ---
  useEffect(() => {
    if (selectedTopic) {
      setSearchParams({ topic: selectedTopic, partition });
    } else {
      setSearchParams({});
    }
  }, [selectedTopic, partition, setSearchParams]);

  // Сброс страницы при смене топика или партиции
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopic, partition]);

  // Сброс состояния при смене топика (очистка сообщений, выделения, просмотр)
  useEffect(() => {
    if (!selectedTopic) return;
    setPartition("all");
    setMessages([]);
    setSelectedRows([]);
    setSelectedMessage(null);
    setCurrentPage(1);
  }, [selectedTopic]);

  // --- Поиск сообщений ---
  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("SEARCH:", { topic: selectedTopic, partition, currentPage })
    if (!selectedTopic || !topics.includes(selectedTopic)) {
      toast.error('Выберите топик');
      return;
    }
    if (!currentCluster) {
      toast.error('Нет активного кластера');
      return;
    }
    setSearching(true);
    try {
      const baseOffset = startOffset !== '' ? Number(startOffset) : 0
      const calculatedOffset = baseOffset + ((currentPage - 1) * pageSize)
      const partitionParam = partition === "all" ? "" : partition;

      const url = `/api/topics/${encodeURIComponent(selectedTopic)}/messages?partition=${partitionParam}&offset=${calculatedOffset}&limit=${maxMessages}&endOffset=${endOffset || ''}`;
      const response = await axios.get(url, {
        headers: { 'X-Kafka-Bootstrap': currentCluster.brokers }
      });
      console.log("FIRST MSG:", response.data.messages?.[0]);
      setMessages(response.data.messages || [])
      console.log("API RESPONSE:", response.data)
      setTotalMessages(response.data.total || response.data.count || response.data.totalMessages || response.data.messages?.length || 0)
      toast.success(`Получено ${response.data.messages?.length || 0} сообщений`);
    } catch (err) {
      toast.error('Ошибка чтения сообщений: ' + (err.response?.data?.error || err.message));
      setMessages([]);
    } finally {
      setSearching(false);
    }
  };

  // --- Закрытие выпадающих меню при клике вне ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (topicDropdownRef.current && !topicDropdownRef.current.contains(event.target)) {
        setIsTopicDropdownOpen(false);
        setTopicSearch('');
      }
      if (partitionDropdownRef.current && !partitionDropdownRef.current.contains(event.target)) {
        setIsPartitionDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Экспорт сообщений в JSON / CSV / TXT ---
  const exportMessages = (format, onlySelected = false) => {
    // Фильтруем сообщения: если onlySelected, оставляем только те, чей ключ есть в selectedRows
    const rows = onlySelected
      ? messages.filter((m) => selectedRows.includes(getRowKey(m)))
      : messages
    if (rows.length === 0) {
      toast.error("Нет сообщений для выгрузки")
      return
    }
    if (format === "json") {
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" })
      downloadBlob(blob, "messages.json")
    }
    if (format === "csv") {
      const csv = [
        ["offset", "key", "timestamp", "value"].join(","),
        ...rows.map((m) => [
          m.offset,
          `"${m.key || ""}"`,
          `"${m.timestamp}"`,
          `"${(m.value || "").replace(/"/g, '""')}"`
        ].join(","))
      ].join("\n")
      const blob = new Blob([csv], { type: "text/csv" })
      downloadBlob(blob, "messages.csv")
    }
    if (format === "txt") {
      const text = rows.map((m) => [
        `Offset: ${m.offset}`,
        `Key: ${m.key || "-"}`,
        `Timestamp: ${m.timestamp}`,
        `Value:`,
        m.value,
        "--------------------------------"
      ].join("\n")).join("\n")
      const blob = new Blob([text], { type: "text/plain" })
      downloadBlob(blob, "messages.txt")
    }
    setExportMenu(null)
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const filteredTopics = topics.filter(topic => topic.toLowerCase().includes(topicSearch.toLowerCase()));

  return (
    <div className="search-page">
      <Toaster position="top-right" />

      <div className="search-header">
        <div>
          <h1>Поиск сообщений</h1>
        </div>
      </div>

      <div className="search-toolbar-card">
        <SearchToolbar
          handleSearch={handleSearch}
          topicDropdownRef={topicDropdownRef}
          partitionDropdownRef={partitionDropdownRef}
          isTopicDropdownOpen={isTopicDropdownOpen}
          setIsTopicDropdownOpen={setIsTopicDropdownOpen}
          topicSearch={topicSearch}
          setTopicSearch={setTopicSearch}
          selectedTopic={selectedTopic}
          setSelectedTopic={setSelectedTopic}
          filteredTopics={filteredTopics}
          partition={partition}
          setPartition={setPartition}
          partitions={partitions}
          isPartitionDropdownOpen={isPartitionDropdownOpen}
          setIsPartitionDropdownOpen={setIsPartitionDropdownOpen}
          startOffset={startOffset}
          setStartOffset={setStartOffset}
          endOffset={endOffset}
          setEndOffset={setEndOffset}
          maxMessages={maxMessages}
          setMaxMessages={setMaxMessages}
          setCurrentPage={setCurrentPage}
          searching={searching}
          currentCluster={currentCluster}
        />
      </div>

      {messages.length > 0 && (
        <div className="search-results-card">
          <div className="search-results-header">
            <div className="search-results-title-row">
              <h2>Результаты поиска</h2>
              <div className="search-results-badge">Найдено: {totalMessages} сообщений</div>
            </div>
            <div className="search-actions">
              <ExportDropdown
                type="selected"
                exportMenu={exportMenu}
                setExportMenu={setExportMenu}
                exportMessages={exportMessages}
                count={selectedRows.length}
              />
              <ExportDropdown
                type="all"
                exportMenu={exportMenu}
                setExportMenu={setExportMenu}
                exportMessages={exportMessages}
                count={messages.length}
              />
            </div>
          </div>

          <div className="messages-table-wrapper">
            <MessagesTable
              messages={messages}
              selectedRows={selectedRows}
              toggleAllRows={toggleAllRows}
              toggleRowSelection={toggleRowSelection}
              selectedMessage={selectedMessage}
              setSelectedMessage={setSelectedMessage}
              selectedTopic={selectedTopic}
              allCurrentSelected={allCurrentSelected}        // <-- передаём признак, что все на странице выбраны
              getRowKey={getRowKey}
            />
          </div>

          <div className="table-footer">
            <div className="table-footer-left">
              <span className="selected-count">Выбрано: {selectedRows.length} сообщений</span>
              <button className="clear-selection-btn" onClick={() => setSelectedRows([])}>Очистить выбор</button>
            </div>
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>

          <MessageViewer
            selectedMessage={selectedMessage}
            viewFormat={viewFormat}
            setViewFormat={setViewFormat}
          />
        </div>
      )}
    </div>
  );
}