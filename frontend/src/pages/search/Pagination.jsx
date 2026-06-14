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
 * @fileoverview Компонент пагинации для таблицы сообщений.
 * Отображает номера страниц с пропусками, если их много.
 */

export default function Pagination({ currentPage, setCurrentPage, totalPages }) {
  if (totalPages <= 1) return null;  // если одна страница – не показываем

  // Формирует массив отображаемых страниц (с учётом компактности)
  const getVisiblePages = () => {
    const delta = 2;               // сколько страниц слева и справа от текущей
    const range = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);

    for (let i = left; i <= right; i++) range.push(i);

    if (left > 2) range.unshift('...');
    if (left > 1) range.unshift(1);
    if (right < totalPages - 1) range.push('...');
    if (right < totalPages) range.push(totalPages);

    return range;
  };

  const pages = getVisiblePages();

  return (
    <div className="table-footer-right">
      {currentPage > 1 && (
        <button className="pagination-btn" onClick={() => setCurrentPage(currentPage - 1)}>
          &lt;
        </button>
      )}
      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`dots-${idx}`} className="pagination-dots">...</span>
        ) : (
          <button
            key={page}
            className={`pagination-page ${currentPage === page ? 'active' : ''}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        )
      )}
      {currentPage < totalPages && (
        <button className="pagination-btn" onClick={() => setCurrentPage(currentPage + 1)}>
          &gt;
        </button>
      )}
    </div>
  )
}