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
 * @fileoverview Панель детального просмотра выбранного сообщения.
 * Позволяет переключать формат отображения (JSON / RAW).
 */

export default function MessageViewer({ selectedMessage, viewFormat, setViewFormat }) {
  if (!selectedMessage) return null;

  return (
    <div className="message-detail-panel">
      <div className="message-detail-header">
        <h3>Детали сообщения</h3>
        <select value={viewFormat} onChange={(e) => setViewFormat(e.target.value)}>
          <option value="json">JSON</option>
          <option value="raw">RAW</option>
        </select>
      </div>

      <div className="message-detail-meta">
        <span>Offset: {selectedMessage.offset}</span>
        <span>Партиция: {selectedMessage.partition ?? "—"}</span>
        <span>Ключ: {selectedMessage.key || "-"}</span>
      </div>

      {/* Заголовок со значением формата и отступом */}
      <div className="message-detail-value-title">
        Значение ({viewFormat.toUpperCase()})
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