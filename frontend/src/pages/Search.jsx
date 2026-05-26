/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import {
  FiChevronDown,
  FiChevronUp,
  FiSearch
} from 'react-icons/fi';

import '../styles/Search.css';

import {
  useEffect,
  useState,
  useRef
} from 'react';

import {
  useSearchParams
} from 'react-router-dom';

import axios from 'axios';

import toast, {
  Toaster
} from 'react-hot-toast';

import {
  useCluster
} from '../contexts/ClusterContext';

export default function Search() {

  const { currentCluster } = useCluster();

  const [searchParams, setSearchParams] =
    useSearchParams();

  const [topics, setTopics] = useState([]);

  const [loadingTopics, setLoadingTopics] =
    useState(false);

  const [selectedTopic, setSelectedTopic] =
    useState(
      searchParams.get('topic') || ''
    );

  const [partition, setPartition] =
    useState(
      searchParams.get('partition') || '0'
    );

  const [offset, setOffset] =
    useState('0');

  const [limit, setLimit] =
    useState('10');

  const [messages, setMessages] =
    useState([]);

  const [searching, setSearching] =
    useState(false);

  const [
    isTopicDropdownOpen,
    setIsTopicDropdownOpen
  ] = useState(false);

  const [topicSearch, setTopicSearch] =
    useState('');

  const dropdownRef = useRef(null);

  /* ========================= LOAD TOPICS ========================= */

  useEffect(() => {

    if (!currentCluster) return;

    const loadTopics = async () => {

      setLoadingTopics(true);

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
          'Ошибка загрузки топиков: ' +
          err.message
        );

      } finally {

        setLoadingTopics(false);
      }
    };

    loadTopics();

  }, [currentCluster]);

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

  /* ========================= SEARCH ========================= */

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

      const url =
        `/api/topics/${
          encodeURIComponent(selectedTopic)
        }/messages?partition=${
          partition
        }&offset=${
          offset
        }&limit=${
          limit
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

      setMessages(
        response.data.messages || []
      );

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

    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target)
    ) {

      setIsTopicDropdownOpen(false);
      setTopicSearch('');
    }
  };

  document.addEventListener(
    'mousedown',
    handleClickOutside
  );

  return () => {

    document.removeEventListener(
      'mousedown',
      handleClickOutside
    );
  };

}, []);

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

        <form
          className="search-toolbar"
          onSubmit={handleSearch}
        >

          {/* ========================= TOPIC ========================= */}

          <div className="search-field">

            <label>
              Топик
            </label>

            <div
              ref={dropdownRef}
              className={`topic-dropdown-wrapper ${
                isTopicDropdownOpen
                  ? 'open'
                  : ''
              }`}
            >

              <div
                className={`topic-dropdown-trigger ${
                  isTopicDropdownOpen
                    ? 'open'
                    : ''
                }`}
                onClick={() =>
                  setIsTopicDropdownOpen(true)
                }
              >
                <FiSearch className="topic-dropdown-search-icon" />

                <input
                  type="text"
                  className="topic-dropdown-input"
                  placeholder={
                    isTopicDropdownOpen
                      ? 'Поиск топика...'
                      : 'Выберите топик'
                  }
                  value={
                    isTopicDropdownOpen
                      ? topicSearch
                      : selectedTopic
                  }
                  onChange={(e) => {
                    setTopicSearch(e.target.value);
                    setIsTopicDropdownOpen(true);
                  }}
                  onFocus={() =>
                    setIsTopicDropdownOpen(true)
                  }
                />

                <div className="topic-dropdown-chevron">

                  {isTopicDropdownOpen ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}

                </div>

              </div>

              {isTopicDropdownOpen && (

                <div className="topic-dropdown-menu">

                  {/* SEARCH INPUT */}



                  {/* TOPICS */}

                  <div className="topic-dropdown-list">

                    {filteredTopics.length > 0 ? (

                      filteredTopics.map(topic => (

                        <div
                          key={topic}
                          className={`topic-dropdown-item ${
                            selectedTopic === topic
                              ? 'active'
                              : ''
                          }`}
                          onClick={() => {

                            setSelectedTopic(
                              topic
                            );

                            setIsTopicDropdownOpen(
                              false
                            );

                            setTopicSearch('');
                          }}
                        >

                          {topic}

                        </div>

                      ))

                    ) : (

                      <div className="topic-dropdown-item">

                        Ничего не найдено

                      </div>

                    )}

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* ========================= PARTITION ========================= */}

          <div className="search-field">

            <label>
              Партиция
            </label>

            <input
              type="number"
              value={partition}
              onChange={(e) =>
                setPartition(e.target.value)
              }
              min="0"
            />

          </div>

          {/* ========================= OFFSET ========================= */}

          <div className="search-field">

            <label>
              Offset
            </label>

            <input
              type="number"
              value={offset}
              onChange={(e) =>
                setOffset(e.target.value)
              }
              min="0"
            />

          </div>

          {/* ========================= LIMIT ========================= */}

          <div className="search-field">

            <label>
              Limit
            </label>

            <input
              type="number"
              value={limit}
              onChange={(e) =>
                setLimit(e.target.value)
              }
              min="1"
              max="1000"
            />

          </div>

          {/* ========================= BUTTON ========================= */}

          <button
            type="submit"
            className="search-submit-btn"
            disabled={
              searching ||
              !selectedTopic ||
              !currentCluster
            }
          >

            {searching
              ? 'Поиск...'
              : 'Найти сообщения'}

          </button>

        </form>

      </div>

      {/* ========================= RESULTS ========================= */}

      {messages.length > 0 && (

        <div className="search-results-card">

          <div className="search-results-header">

            <h2>
              Результаты поиска
            </h2>

            <div className="search-results-count">

              {messages.length} сообщений

            </div>

          </div>

          <div className="messages-grid">

            {messages.map((msg, idx) => (

              <div
                key={idx}
                className="message-card"
              >

                <div className="message-meta">

                  <span>
                    Offset: {msg.offset}
                  </span>

                  <span>
                    {msg.timestamp}
                  </span>

                </div>

                <div className="message-key">

                  <strong>
                    Key:
                  </strong>

                  <code>
                    {msg.key || '—'}
                  </code>

                </div>

                <div className="message-value">

                  <strong>
                    Value:
                  </strong>

                  <pre>
                    {msg.value}
                  </pre>

                </div>

              </div>

            ))}

          </div>

        </div>

      )}

    </div>
  );
}