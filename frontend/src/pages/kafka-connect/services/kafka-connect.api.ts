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
 * HTTP-слой Kafka Connect.
 * При отсутствии backend endpoint списка возвращает demo-данные.
 */
import type { Connector } from '../types/kafka-connect.types';

export type ApiMode = 'live' | 'demo';
export interface ConnectorResult { items: Connector[]; mode: ApiMode; }

const demo: Connector[] = [
  {
    name: 'orders-source', type: 'source', state: 'RUNNING',
    connectorClass: 'io.debezium.connector.postgresql.PostgresConnector',
    worker: 'connect-worker-01', description: 'Загрузка заказов из PostgreSQL в Kafka.',
    tasks: [{ id: 0, state: 'RUNNING', worker: 'connect-worker-01' }, { id: 1, state: 'RUNNING', worker: 'connect-worker-02' }],
    config: { 'connector.class': 'io.debezium.connector.postgresql.PostgresConnector', 'tasks.max': '2', 'topic.prefix': 'orders' },
    createdAt: '2026-09-18 12:40', updatedAt: '2026-09-27 01:12',
  },
  {
    name: 'analytics-sink', type: 'sink', state: 'PAUSED',
    connectorClass: 'io.confluent.connect.jdbc.JdbcSinkConnector',
    worker: 'connect-worker-02', description: 'Запись аналитических событий в PostgreSQL.',
    tasks: [{ id: 0, state: 'PAUSED', worker: 'connect-worker-02' }],
    config: { 'connector.class': 'io.confluent.connect.jdbc.JdbcSinkConnector', 'tasks.max': '1', 'topics': 'analytics.events' },
    createdAt: '2026-09-12 08:15', updatedAt: '2026-09-26 22:48',
  },
  {
    name: 'billing-sink', type: 'sink', state: 'FAILED',
    connectorClass: 'io.confluent.connect.s3.S3SinkConnector',
    worker: 'connect-worker-03', description: 'Архивирование billing-событий в object storage.',
    tasks: [{ id: 0, state: 'FAILED', worker: 'connect-worker-03', trace: 'Timeout while writing object' }],
    config: { 'connector.class': 'io.confluent.connect.s3.S3SinkConnector', 'tasks.max': '1', 'topics': 'billing' },
    error: 'Timeout while writing object: storage endpoint did not respond within 30s.',
    createdAt: '2026-09-03 17:31', updatedAt: '2026-09-27 00:57',
  },
];

async function request<T>(bootstrap: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Kafka-Bootstrap': bootstrap, ...(init?.headers || {}) },
  });
  if (!response.ok) throw new Error(`Kafka Connect: ${response.status}`);
  return response.json();
}

export async function fetchConnectors(bootstrap: string): Promise<ConnectorResult> {
  try {
    const data = await request<Connector[] | { items: Connector[] }>(bootstrap, '/api/kafka-connect/connectors');
    return { items: Array.isArray(data) ? data : data.items, mode: 'live' };
  } catch {
    return { items: structuredClone(demo), mode: 'demo' };
  }
}

export async function createConnector(bootstrap: string, payload: unknown) {
  return request(bootstrap, '/api/kafka-connect/connectors', { method: 'POST', body: JSON.stringify(payload) });
}
export async function action(bootstrap: string, name: string, operation: string) {
  return request(bootstrap, `/api/kafka-connect/connectors/${encodeURIComponent(name)}/${operation}`, { method: 'POST' });
}
export const restartConnector = (b: string, n: string) => action(b, n, 'restart');
export const resumeConnector = (b: string, n: string) => action(b, n, 'resume');
export const pauseConnector = (b: string, n: string) => action(b, n, 'pause');
export async function deleteConnector(bootstrap: string, name: string) {
  return request(bootstrap, `/api/kafka-connect/connectors/${encodeURIComponent(name)}`, { method: 'DELETE' });
}
