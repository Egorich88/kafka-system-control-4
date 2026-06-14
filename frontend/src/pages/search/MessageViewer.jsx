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
 * @fileoverview Детальный просмотр выбранного сообщения.
 * Выбор формата (JSON/RAW) через кастомный дропдаун, кнопка скачивания сообщения.
 */

import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';

export default function MessageViewer({ selectedMessage, viewFormat, setViewFormat }) {
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsFormatOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!selectedMessage) return null;

  // Скачивание текущего сообщения в формате JSON
  const downloadMessage = () => {
    const data = {
      offset: selectedMessage.offset,
      partition: selectedMessage.partition,
      key: selectedMessage.key,
      timestamp: selectedMessage.timestamp,
      value: selectedMessage.value,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `message_${selectedMessage.offset}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="message-detail-panel">
      <div className="message-detail-header">
        <h3>Детали сообщения</h3>
        {/* Кастомный дропдаун выбора формата */}
        <div className="message-format-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className={`format-dropdown-trigger ${isFormatOpen ? 'open' : ''}`}
            onClick={() => setIsFormatOpen(!isFormatOpen)}
          >
            <span>{viewFormat.toUpperCase()}</span>
            {isFormatOpen ? <FiChevronUp /> : <FiChevronDown />}
          </button>
          {isFormatOpen && (
            <div className="format-dropdown-menu">
              <div
                className={`format-dropdown-item ${viewFormat === 'json' ? 'active' : ''}`}
                onClick={() => { setViewFormat('json'); setIsFormatOpen(false); }}
              >
                JSON
              </div>
              <div
                className={`format-dropdown-item ${viewFormat === 'raw' ? 'active' : ''}`}
                onClick={() => { setViewFormat('raw'); setIsFormatOpen(false); }}
              >
                RAW
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="message-detail-meta">
        <span>Offset: {selectedMessage.offset}</span>
        <span>Партиция: {selectedMessage.partition ?? "—"}</span>
        <span>Ключ: {selectedMessage.key || "-"}</span>
      </div>

      {/* Заголовок и кнопка скачивания */}
      <div className="message-value-header">
        <div className="message-detail-value-title">Значение ({viewFormat.toUpperCase()})</div>
        <button className="download-message-btn" onClick={downloadMessage}>
          <FiDownload /> Скачать сообщение
        </button>
      </div>
      <pre className="message-detail-content">
        {(() => {
          if (viewFormat === "raw") return selectedMessage.value;
          try {
            return JSON.stringify(JSON.parse(selectedMessage.value), null, 2);
          } catch {
            return selectedMessage.value;
          }
        })()}
      </pre>
    </div>
  );
}