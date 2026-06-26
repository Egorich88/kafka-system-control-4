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
 * @fileoverview Описания параметров конфигурации топика
 * Используются в таблице конфигурации панели деталей для отображения подсказок
 */

export const CONFIG_DESCRIPTIONS = {
  'cleanup.policy': 'Политика очистки топика (delete, compact, compact,delete)',
  'retention.ms': 'Время хранения сообщений в миллисекундах',
  'min.insync.replicas': 'Минимальное количество синхронных реплик для записи',
  'segment.bytes': 'Максимальный размер сегмента лога в байтах',
  'segment.ms': 'Время жизни сегмента лога в миллисекундах',
  'compression.type': 'Тип сжатия сообщений (gzip, snappy, lz4, zstd)',
  'max.message.bytes': 'Максимальный размер сообщения в байтах',
  'message.timestamp.type': 'Тип временной метки (CreateTime, LogAppendTime)',
  'unclean.leader.election.enable': 'Разрешить выбор лидера из несинхронных реплик',
  'delete.retention.ms': 'Время хранения удалённых записей',
  'file.delete.delay.ms': 'Задержка удаления файлов сегментов',
  'flush.messages': 'Количество сообщений для принудительной записи на диск',
  'flush.ms': 'Интервал принудительной записи на диск',
  'segment.index.bytes': 'Размер индексного файла сегмента',
  'segment.jitter.ms': 'Случайное отклонение времени ротации сегмента',
  'retention.bytes': 'Максимальный размер данных топика',
  'message.max.bytes': 'Максимальный размер сообщения',
};