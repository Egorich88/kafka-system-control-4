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
 * @file PageHeader.tsx
 * =============================================================================
 * Единая горизонтальная шапка страниц KSC.
 * =============================================================================
 */

import { FiRefreshCw } from 'react-icons/fi';
import { useCluster } from '../../contexts/ClusterContext';
import { useDashboardControls } from '../../contexts/DashboardControlsContext';
import TimeRangePicker from './TimeRangePicker';
import RefreshIntervalPicker from './RefreshIntervalPicker';
import type { PageHeaderMode } from './types';
import './page-header.css';

interface Props {
  title: string;
  mode: PageHeaderMode;
}

export default function PageHeader({ title, mode }: Props) {
  const { currentCluster } = useCluster();
  const {
    timeRange,
    refreshInterval,
    isRefreshing,
    setTimeRange,
    setRefreshInterval,
    refreshNow,
  } = useDashboardControls();

  return (
    <header className={`page-header-bar page-header-${mode}`}>
      <div className="page-header-title-group">
        <h1>{title}</h1>
        {mode === 'monitoring' && currentCluster?.name && (
          <span className="page-header-cluster">кластер: {currentCluster.name}</span>
        )}
      </div>

      {mode === 'monitoring' && currentCluster && (
        <div className="page-header-controls">
          <TimeRangePicker value={timeRange} onChange={setTimeRange} />
          <RefreshIntervalPicker
            value={refreshInterval}
            onChange={setRefreshInterval}
            isRefreshing={isRefreshing}
          />
          <button
            type="button"
            className="page-header-refresh-button"
            onClick={() => void refreshNow()}
            disabled={isRefreshing}
            title="Обновить"
            aria-label="Обновить"
          >
            <FiRefreshCw className={isRefreshing ? 'is-spinning' : ''} />
          </button>
        </div>
      )}
    </header>
  );
}
