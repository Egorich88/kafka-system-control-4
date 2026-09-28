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
/** REST-слой Schema Registry с demo fallback для разработки UI. */
import type { CompatibilityLevel, SchemaSubject, SchemaType } from '../types/schema-registry.types';

export type SchemaApiMode = 'live' | 'demo';

const demo: SchemaSubject[] = [
  {
    subject: 'orders-value', schemaId: 101, type: 'AVRO', compatibility: 'BACKWARD',
    description: 'Контракт событий заказа.',
    versions: [
      { version: 1, id: 101, schemaType: 'AVRO', schema: '{ "type": "record", "name": "Order", "fields": [{"name":"id","type":"string"}] }', createdAt: '2026-09-12 10:14' },
      { version: 2, id: 117, schemaType: 'AVRO', schema: '{ "type": "record", "name": "Order", "fields": [{"name":"id","type":"string"},{"name":"status","type":"string","default":"NEW"}] }', createdAt: '2026-09-21 08:42' },
    ],
  },
  {
    subject: 'payments-value', schemaId: 204, type: 'JSON', compatibility: 'FULL',
    description: 'JSON Schema для платежей.',
    versions: [
      { version: 1, id: 204, schemaType: 'JSON', schema: '{ "$schema": "https://json-schema.org/draft/2020-12/schema", "type": "object", "required": ["id"] }', createdAt: '2026-09-18 14:05' },
    ],
  },
  {
    subject: 'customer-value', schemaId: 305, type: 'PROTOBUF', compatibility: 'BACKWARD_TRANSITIVE',
    description: 'Protobuf-контракт клиента.',
    versions: [
      { version: 1, id: 305, schemaType: 'PROTOBUF', schema: 'message Customer { string id = 1; string name = 2; }', createdAt: '2026-09-10 17:33' },
    ],
  },
];

async function request<T>(bootstrap: string, path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', 'X-Kafka-Bootstrap': bootstrap, ...(init?.headers || {}) },
  });
  if (!r.ok) throw new Error(`Schema Registry: ${r.status}`);
  return r.json();
}
export async function fetchSchemaSubjects(bootstrap: string): Promise<{ items: SchemaSubject[]; mode: SchemaApiMode }> {
  try { return { items: await request<SchemaSubject[]>(bootstrap, '/api/schema-registry/subjects'), mode: 'live' }; }
  catch { return { items: structuredClone(demo), mode: 'demo' }; }
}
export async function registerSchema(bootstrap: string, subject: string, schemaType: SchemaType, schema: string) {
  return request(bootstrap, `/api/schema-registry/subjects/${encodeURIComponent(subject)}/versions`, { method: 'POST', body: JSON.stringify({ schemaType, schema }) });
}
export async function deleteSchemaSubject(bootstrap: string, subject: string) {
  return request(bootstrap, `/api/schema-registry/subjects/${encodeURIComponent(subject)}`, { method: 'DELETE' });
}
export async function deleteSchemaVersion(bootstrap: string, subject: string, version: number) {
  return request(bootstrap, `/api/schema-registry/subjects/${encodeURIComponent(subject)}/versions/${version}`, { method: 'DELETE' });
}
export async function updateCompatibility(bootstrap: string, subject: string, compatibilityLevel: CompatibilityLevel) {
  return request(bootstrap, `/api/schema-registry/subjects/${encodeURIComponent(subject)}/compatibility`, { method: 'PUT', body: JSON.stringify({ compatibilityLevel }) });
}
