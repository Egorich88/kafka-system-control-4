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
/** TypeScript-модели Schema Registry. */
export type SchemaType = 'AVRO' | 'JSON' | 'PROTOBUF';
export type CompatibilityLevel = 'BACKWARD' | 'BACKWARD_TRANSITIVE' | 'FORWARD' | 'FORWARD_TRANSITIVE' | 'FULL' | 'FULL_TRANSITIVE' | 'NONE';

export interface SchemaVersion {
  version: number;
  id: number;
  schemaType: SchemaType;
  schema: string;
  createdAt: string;
}
export interface SchemaSubject {
  subject: string;
  schemaId: number;
  type: SchemaType;
  compatibility: CompatibilityLevel;
  description: string;
  versions: SchemaVersion[];
}
