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
/** TypeScript-модели ksqlDB. */
export type KsqlTab = 'editor' | 'streams' | 'tables' | 'queries';
export type KsqlObjectKind = 'STREAM' | 'TABLE' | 'QUERY';
export type KsqlObjectState = 'RUNNING' | 'PAUSED' | 'TERMINATED' | 'UNKNOWN';

export interface KsqlObject {
  id: string;
  name: string;
  kind: KsqlObjectKind;
  state: KsqlObjectState;
  query: string;
  topic?: string;
  format?: string;
  createdAt: string;
}
export interface KsqlQuery extends KsqlObject {
  kind: 'QUERY';
  queryId: string;
}
export interface KsqlState {
  mode: 'live' | 'demo';
  queries: KsqlQuery[];
  streams: KsqlObject[];
  tables: KsqlObject[];
}
export interface KsqlResult {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  error?: string;
}
