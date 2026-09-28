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
/** HTTP-слой ksqlDB с demo fallback для независимой разработки UI. */
import type { KsqlResult, KsqlState } from '../types/ksqldb.types';

const demo: KsqlState = {
  mode: 'demo',
  streams: [
    { id: 'stream-orders', name: 'ORDERS', kind: 'STREAM', state: 'RUNNING', topic: 'orders', format: 'JSON', query: "CREATE STREAM ORDERS (...) WITH (KAFKA_TOPIC='orders', VALUE_FORMAT='JSON');", createdAt: '2026-09-20 11:24' },
    { id: 'stream-payments', name: 'PAYMENTS', kind: 'STREAM', state: 'RUNNING', topic: 'payments', format: 'AVRO', query: "CREATE STREAM PAYMENTS (...) WITH (KAFKA_TOPIC='payments', VALUE_FORMAT='AVRO');", createdAt: '2026-09-19 15:08' },
  ],
  tables: [
    { id: 'table-customer', name: 'CUSTOMER_STATE', kind: 'TABLE', state: 'RUNNING', topic: 'customer_state', format: 'JSON', query: 'CREATE TABLE CUSTOMER_STATE AS SELECT customer_id, count(*) FROM ORDERS GROUP BY customer_id;', createdAt: '2026-09-21 09:42' },
  ],
  queries: [
    { id: 'query-1', queryId: 'CTAS_CUSTOMER_STATE_1', name: 'CTAS_CUSTOMER_STATE_1', kind: 'QUERY', state: 'RUNNING', query: 'CREATE TABLE CUSTOMER_STATE AS SELECT customer_id, count(*) FROM ORDERS GROUP BY customer_id;', createdAt: '2026-09-21 09:42' },
    { id: 'query-2', queryId: 'PUSH_ORDERS_2', name: 'PUSH_ORDERS_2', kind: 'QUERY', state: 'RUNNING', query: 'SELECT * FROM ORDERS EMIT CHANGES LIMIT 50;', createdAt: '2026-09-27 01:02' },
  ],
};

async function request<T>(bootstrap: string, path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Kafka-Bootstrap': bootstrap, ...(init?.headers || {}) },
  });
  if (!r.ok) throw new Error(`ksqlDB: ${r.status}`);
  return r.json();
}
export async function fetchKsqlState(bootstrap: string): Promise<KsqlState> {
  try { return { ...(await request<KsqlState>(bootstrap, '/api/ksqldb/state')), mode: 'live' }; }
  catch { return structuredClone(demo); }
}
export async function executeStatement(bootstrap: string, statement: string): Promise<KsqlResult> {
  try {
    return await request<KsqlResult>(bootstrap, '/api/ksqldb/execute', { method: 'POST', body: JSON.stringify({ statement }) });
  } catch {
    return { columns: ['STATUS'], rows: [{ STATUS: 'Statement принят в demo-режиме' }] };
  }
}
export async function terminateQuery(bootstrap: string, queryId: string) {
  return request(bootstrap, `/api/ksqldb/queries/${encodeURIComponent(queryId)}/terminate`, { method: 'POST' });
}
