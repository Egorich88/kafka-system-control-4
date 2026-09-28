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
/** TypeScript-модели Kafka Connect. */
export type ConnectorState = 'RUNNING' | 'PAUSED' | 'FAILED' | 'UNASSIGNED' | 'UNKNOWN';
export type ConnectorType = 'source' | 'sink';

export interface ConnectorTask {
  id: number;
  state: ConnectorState;
  worker: string;
  trace?: string;
}
export interface Connector {
  name: string;
  type: ConnectorType;
  state: ConnectorState;
  connectorClass: string;
  worker: string;
  description: string;
  tasks: ConnectorTask[];
  config: Record<string, string>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}
