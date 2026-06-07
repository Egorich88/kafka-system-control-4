/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */
import SearchToolbar from '../components/search/SearchToolbar'
import MessagesTable from '../components/search/MessagesTable'
import Pagination from '../components/search/Pagination'
import ExportDropdown from '../components/search/ExportDropdown'
import MessageViewer from '../components/search/MessageViewer'
import '../styles/search.css';
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { useCluster } from '../contexts/ClusterContext';

export default function Search() {
  const { currentCluster } = useCluster();
  const [searchParams, setSearchParams] = useSearchParams();
  const [startOffset, setStartOffset] = useState('')
  const [endOffset, setEndOffset] = useState('')
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || '');
  const [partition, setPartition] = useState(searchParams.get('partition') || 'all');
  const [messages, setMessages] = useState([])
  const [maxMessages, setMaxMessages] = useState(100)
  const [partitions, setPartitions] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [selectedRows, setSelectedRows] = useState([])
  const [viewFormat, setViewFormat] = useState("json")
  const [exportMenu, setExportMenu] = useState(null)
  const [searching, setSearching] = useState(false);
  const [isTopicDropdownOpen, setIsTopicDropdownOpen] = useState(false);
  const [isPartitionDropdownOpen, setIsPartitionDropdownOpen] = useState(false)
  const [topicSearch, setTopicSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1)
  const [totalMessages, setTotalMessages] = useState(0)
  const pageSize = 25
  const totalPages = Math.max( 1, Math.ceil(totalMessages / pageSize) )

  const toggleRowSelection = (offset) => {
      setSelectedRows((prev) => {
          if (prev.includes(offset)) {
              return prev.filter((v) => v !== offset)
          }
          return [...prev, offset]
      })
  }
  const toggleAllRows = () => {
      if (selectedRows.length === messages.length) {
          setSelectedRows([])
          return
      }
      setSelectedRows(messages.map((m) => String(m.offset)))
  }

  const topicDropdownRef = useRef(null);
  const partitionDropdownRef = useRef(null);
  useEffect(() => {
    if (!currentCluster) return;

    const loadTopics = async () => {
      try {
        const response = await axios.get(
          '/api/topics',
          {
            headers: {
              'X-Kafka-Bootstrap':
                currentCluster.brokers
            }
          }
        );

        let topicsList =
          response.data.topics || [];

        if (
          topicsList.length > 0 &&
          typeof topicsList[0] === 'object'
        ) {
          topicsList =
            topicsList.map(t => t.name);
        }

        setTopics(topicsList);

      } catch (err) {

        toast.error(
          'Ошибка загрузки топиков'
        );
      }
    };

    loadTopics();

  }, [currentCluster]);

  /* ========================= LOAD TOPICS ========================= */

  useEffect(() => {

      if (!selectedTopic || !currentCluster)
          return

      axios.get(

          `/api/topics/${selectedTopic}/partitions`,

          {
              headers: {
                  'X-Kafka-Bootstrap':
                      currentCluster.brokers
              }
          }

      ).then((res) => {

           console.log(
               "PARTITIONS RESPONSE:",
               res.data
           )

           setPartitions(
               res.data.partitions || []
           )

      }).catch(() => {

          setPartitions([])

      })

  }, [selectedTopic, currentCluster])


  /* ========================= URL PARAMS ========================= */

  useEffect(() => {

    if (selectedTopic) {

      setSearchParams({
        topic: selectedTopic,
        partition
      });

    } else {

      setSearchParams({});
    }

  }, [
    selectedTopic,
    partition,
    setSearchParams
  ]);
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTopic, partition]);

  /* ========================= SEARCH ========================= */

  const handleSearch = async (e) => {
    console.log(
        "SEARCH:",
        {
            topic: selectedTopic,
            partition,
            currentPage
        }
    )
    e.preventDefault();
    if (
      !selectedTopic ||
      !topics.includes(selectedTopic)
    ) {
      toast.error('Выберите топик');
      return;
    }
    if (!currentCluster) {
      toast.error('Нет активного кластера');
      return;
    }
    setSearching(true);
    try {
      const baseOffset =
          startOffset !== ''
              ? Number(startOffset)
              : 0

      const calculatedOffset =
          baseOffset + ((currentPage - 1) * pageSize)
      const partitionParam = partition === "all" ? "" : partition;

      const url =
        `/api/topics/${
          encodeURIComponent(selectedTopic)
        }/messages?partition=${
          partitionParam
        }&offset=${
          calculatedOffset
        }&limit=${
          maxMessages
        }&endOffset=${
          endOffset || ''
        }`;
      const response = await axios.get(
        url,
        {
          headers: {
            'X-Kafka-Bootstrap':
              currentCluster.brokers
          }
        }
      );
      setMessages(response.data.messages || [])

      console.log("API RESPONSE:", response.data)

      setTotalMessages(
          response.data.total ||
          response.data.count ||
          response.data.totalMessages ||
          response.data.messages?.length ||
          0
      )
      toast.success(
        `Получено ${
          response.data.messages?.length || 0
        } сообщений`
      );
    } catch (err) {
      toast.error(
        'Ошибка чтения сообщений: ' +
        (
          err.response?.data?.error ||
          err.message
        )
      );
      setMessages([]);
    } finally {
      setSearching(false);
    }
  };
useEffect(() => {
  const handleClickOutside = (event) => {

    // TOPIC dropdown
    if (
      topicDropdownRef.current &&
      !topicDropdownRef.current.contains(event.target)
    ) {
      setIsTopicDropdownOpen(false);
      setTopicSearch('');
    }

    // PARTITION dropdown
    if (
      partitionDropdownRef.current &&
      !partitionDropdownRef.current.contains(event.target)
    ) {
      setIsPartitionDropdownOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);
  const exportMessages = (format, onlySelected = false) => {
      const rows = onlySelected
          ? messages.filter((m) =>
              selectedRows.includes(String(m.offset))
          )
          : messages
      if (rows.length === 0) {
          toast.error("Нет сообщений для выгрузки")
          return
      }
      if (format === "json") {
          const blob = new Blob(
              [JSON.stringify(rows, null, 2)],
              {
                  type: "application/json"
              }
          )

          downloadBlob(blob, "messages.json")
      }

      if (format === "csv") {

          const csv = [
              [
                  "offset",
                  "key",
                  "timestamp",
                  "value"
              ].join(","),

              ...rows.map((m) => [
                  m.offset,
                  `"${m.key || ""}"`,
                  `"${m.timestamp}"`,
                  `"${(m.value || "")
                      .replace(/"/g, '""')}"`
              ].join(","))
          ].join("\n")
          const blob = new Blob(
              [csv],
              {
                  type: "text/csv"
              }
          )

          downloadBlob(blob, "messages.csv")
      }

      if (format === "txt") {
          const text = rows.map((m) => {
              return [
                  `Offset: ${m.offset}`,
                  `Key: ${m.key || "-"}`,
                  `Timestamp: ${m.timestamp}`,
                  `Value:`,
                  m.value,
                  "--------------------------------"
              ].join("\n")

          }).join("\n")
          const blob = new Blob(
              [text],
              {
                  type: "text/plain"
              }
          )
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

/* ========================= FILTERED TOPICS ========================= */

  const filteredTopics = topics.filter(
    topic =>
      topic
        .toLowerCase()
        .includes(
          topicSearch.toLowerCase()
        )
  );

  return (
    <div className="search-page">
      <Toaster position="top-right" />

      {/* ========================= HEADER ========================= */}

      <div className="search-header">
        <div>
          <h1>
            Поиск сообщений
          </h1>
        </div>
      </div>

      {/* ========================= TOOLBAR ========================= */}

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

      {/* ========================= RESULTS ========================= */}

      {messages.length > 0 && (
        <div className="search-results-card">
          <div className="search-results-header">
              <div className="search-results-title-row">
                  <h2>
                      Результаты поиска
                  </h2>
                  <div className="search-results-badge">
                      Найдено: {totalMessages} сообщений
                  </div>
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
                  partition={partition}
                  selectedTopic={selectedTopic}
              />

          </div>

          <div className="table-footer">
              <div className="table-footer-left">
                  <span className="selected-count">
                      Выбрано: {selectedRows.length} сообщений
                  </span>
                  <button
                      className="clear-selection-btn"
                      onClick={() => setSelectedRows([])}
                  >
                      Очистить выбор
                  </button>
              </div>
              <Pagination
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  totalPages={totalPages}
                  total={totalMessages}
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