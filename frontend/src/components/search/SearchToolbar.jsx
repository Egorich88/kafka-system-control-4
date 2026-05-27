/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import {
    FiChevronDown,
    FiChevronUp,
    FiSearch
} from 'react-icons/fi'

export default function SearchToolbar({

    handleSearch,

    dropdownRef,

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

    startOffset,
    setStartOffset,

    endOffset,
    setEndOffset,

    maxMessages,
    setMaxMessages,

    setCurrentPage,

    searching,
    currentCluster

}) {

    return (

        <form
            className="search-toolbar"
            onSubmit={handleSearch}
        >

            {/* TOPIC */}

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
                                    : (selectedTopic || '')
                            }
                            onChange={(e) => {

                                setTopicSearch(e.target.value)
                                setIsTopicDropdownOpen(true)

                            }}
                            onFocus={() =>
                                setIsTopicDropdownOpen(true)
                            }
                        />

                        <div className="topic-dropdown-chevron">

                            {isTopicDropdownOpen
                                ? <FiChevronUp />
                                : <FiChevronDown />
                            }

                        </div>

                    </div>

                    {isTopicDropdownOpen && (

                        <div className="topic-dropdown-menu">

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

                                                setSelectedTopic(topic)

                                                setTopicSearch('')

                                                setIsTopicDropdownOpen(false)

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

            {/* PARTITION */}

            <div className="search-field">

                <label>
                    Партиция
                </label>

                <select
                    value={partition}
                    onChange={(e) =>
                        setPartition(e.target.value)
                    }
                >

                    {partitions.map((p) => (

                        <option
                            key={p}
                            value={p}
                        >
                            {p}
                        </option>

                    ))}

                </select>

            </div>

            {/* OFFSET */}

            <div className="search-field">

                <label>
                    Начальный offset
                </label>

                <input
                    type="number"
                    value={startOffset}
                    onChange={(e) =>
                        setStartOffset(e.target.value)
                    }
                />

            </div>

            <div className="search-field">

                <label>
                    Конечный offset
                </label>

                <input
                    type="number"
                    value={endOffset}
                    onChange={(e) =>
                        setEndOffset(e.target.value)
                    }
                />

            </div>

            {/* MAX MESSAGES */}

            <div className="search-field">

                <label>
                    Макс. сообщений
                </label>

                <input
                    type="number"
                    value={maxMessages}
                    onChange={(e) =>
                        setMaxMessages(Number(e.target.value))
                    }
                    min="1"
                />

            </div>

            {/* BUTTON */}

            <button
                type="submit"
                className="search-submit-btn"
                disabled={
                    searching ||
                    !selectedTopic ||
                    !currentCluster
                }
            >

                {searching ? (
                    'Поиск...'
                ) : (
                    <>
                        <FiSearch />
                        Найти
                    </>
                )}

            </button>

        </form>

    )
}