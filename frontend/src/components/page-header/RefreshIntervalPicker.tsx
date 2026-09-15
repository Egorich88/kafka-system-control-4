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
 * Выбор интервала автоматического обновления.
 * =============================================================================
 */

import { FiRefreshCw } from 'react-icons/fi';
import { REFRESH_INTERVALS } from './constants';
import type { RefreshInterval } from './types';

interface Props {
  value: number;
  onChange: (seconds: number) => void;
  isRefreshing: boolean;
}

export default function RefreshIntervalPicker({ value, onChange, isRefreshing }: Props) {
  const selected = REFRESH_INTERVALS.find((item) => item.value === value) ?? REFRESH_INTERVALS[0];

  return (
    <label className="page-header-refresh-control">
      <FiRefreshCw className={`page-header-refresh-small-icon ${isRefreshing ? 'is-spinning' : ''}`} />
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
    </label>
  );
}
