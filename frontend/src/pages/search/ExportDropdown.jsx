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
 * @fileoverview Выпадающее меню экспорта сообщений (JSON, CSV, TXT).
 * Закрывается при клике вне области меню.
 */

import { FiDownload, FiChevronDown } from 'react-icons/fi';
import { useRef, useEffect } from 'react';

export default function ExportDropdown({
  type,
  exportMenu,
  setExportMenu,
  exportMessages,
  count
}) {
  const dropdownRef = useRef(null);

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Если открыто меню именно этого типа — закрываем
        if (exportMenu === type) {
          setExportMenu(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [exportMenu, type, setExportMenu]);

  return (
    <div className="export-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className={`export-btn ${
          type === 'all' ? 'secondary' : ''
        } ${exportMenu === type ? 'open' : ''}`}
        onClick={() => setExportMenu(exportMenu === type ? null : type)}
      >
        <FiDownload className="export-icon" />
        {type === 'selected'
          ? `Экспорт выбранных (${count})`
          : `Экспорт всех (${count})`}
        <FiChevronDown className="export-chevron" />
      </button>

      {exportMenu === type && (
        <div className="export-menu">
          <button onClick={() => exportMessages('json', type === 'selected')}>
            JSON
          </button>
          <button onClick={() => exportMessages('csv', type === 'selected')}>
            CSV
          </button>
          <button onClick={() => exportMessages('txt', type === 'selected')}>
            TXT
          </button>
        </div>
      )}
    </div>
  );
}