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
 * =============================================================================
 * @file RefreshIntervalPicker.tsx
 * =============================================================================
 * Компактный выбор интервала автоматического обновления.
 * Иконка обновления намеренно находится только в общей кнопке справа.
 * =============================================================================
 */

import { FiChevronDown } from 'react-icons/fi';
import { REFRESH_INTERVALS } from './constants';
import type { RefreshInterval } from './types';

interface Props {
  value: number;
  onChange: (seconds: number) => void;
}

export default function RefreshIntervalPicker({ value, onChange }: Props) {
  const selected = REFRESH_INTERVALS.find((item) => item.value === value) ?? REFRESH_INTERVALS[0];

  return (
    <label className="page-header-refresh-control">
      <span className="page-header-refresh-label">Обновление</span>
      <select
        value={selected.value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Интервал автоматического обновления"
      >
        {REFRESH_INTERVALS.map((item: RefreshInterval) => (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <FiChevronDown className="page-header-select-chevron" aria-hidden="true" />
    </label>
  );
}
