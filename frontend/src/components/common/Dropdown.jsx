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

import { useState, useEffect, useRef } from 'react';
import { FiChevronDown, FiChevronUp, FiSearch } from 'react-icons/fi';
import '../../styles/dropdown.css';

/**
 * Универсальный выпадающий список.
 * @param {Object} props
 * @param {Object} props.selectedItem - выбранный элемент (должен иметь поля id и name)
 * @param {Array} props.items - массив элементов для отображения
 * @param {Function} props.onSelect - колбэк при выборе
 * @param {string} props.addLabel - текст кнопки «Добавить»
 * @param {Function} props.onAdd - колбэк для добавления
 * @param {Function} props.statusResolver - функция для получения статуса (цвет точки)
 * @param {boolean} props.searchable - включить поиск по элементам
 */
export default function Dropdown({
  selectedItem,
  items,
  onSelect,
  addLabel,
  onAdd,
  statusResolver,
  searchable = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Фильтрация элементов по поисковому запросу
  const filteredItems = searchable && searchTerm
    ? items.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : items;

  // Закрытие при клике вне
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Очистка поиска при закрытии
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (item) => {
    onSelect(item);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        className={`dropdown-selected ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="dropdown-selected-left">
          {statusResolver && (
            <div className={`dropdown-status-dot ${statusResolver(selectedItem)}`} />
          )}
          <span className="dropdown-selected-name">{selectedItem.name}</span>
        </div>
        <div className="dropdown-chevron">
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </div>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {/* Поле поиска (если включено) */}
          {searchable && (
            <div className="dropdown-search">
              <FiSearch className="dropdown-search-icon" />
              <input
                type="text"
                className="dropdown-search-input"
                placeholder="Поиск..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="dropdown-list">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="dropdown-item"
                onClick={() => handleSelect(item)}
              >
                {statusResolver && (
                  <div className={`dropdown-status-dot ${statusResolver(item)}`} />
                )}
                <span>{item.name}</span>
              </div>
            ))}
            {filteredItems.length === 0 && (
              <div className="dropdown-item disabled">Ничего не найдено</div>
            )}
          </div>

          {onAdd && (
            <div className="dropdown-add" onClick={() => { setIsOpen(false); onAdd(); }}>
              {addLabel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}