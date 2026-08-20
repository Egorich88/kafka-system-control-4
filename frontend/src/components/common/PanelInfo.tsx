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

import { FiInfo } from 'react-icons/fi';

interface PanelInfoProps {
  title: string;
  description: string;
}

export default function PanelInfo({
  title,
  description
}: PanelInfoProps) {
  return (
    <div className="panel-info">
      <button
        type="button"
        className="panel-info-trigger"
        aria-label={`Информация о панели: ${title}`}
      >
        <FiInfo />
      </button>

      <div className="panel-info-tooltip" role="tooltip">
        <div className="panel-info-tooltip-title">
          {title}
        </div>

        <div className="panel-info-tooltip-description">
          {description}
        </div>
      </div>
    </div>
  );
}