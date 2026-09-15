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
 * @file page-config.ts
 * =============================================================================
 * Конфигурация названий и режима верхней панели для маршрутов KSC.
 * =============================================================================
 */

import type { PageHeaderMode } from './types';

export interface PageConfig {
  title: string;
  mode: PageHeaderMode;
}

export const PAGE_CONFIG: Record<string, PageConfig> = {
  '/': { title: 'Обзор', mode: 'monitoring' },
  '/overview': { title: 'Обзор', mode: 'monitoring' },
  '/brokers': { title: 'Брокеры', mode: 'monitoring' },
  '/topics': { title: 'Топики', mode: 'monitoring' },
  '/groups': { title: 'Группы потребителей', mode: 'monitoring' },
  '/alerts': { title: 'Оповещения', mode: 'monitoring' },

  '/search': { title: 'Поиск сообщений', mode: 'default' },
  '/acls': { title: 'ACL', mode: 'default' },
  '/audit': { title: 'Аудит', mode: 'default' },
  '/console': { title: 'Консоль', mode: 'default' },
  '/settings': { title: 'Настройки', mode: 'default' },
  '/user': { title: 'Пользователь', mode: 'default' },
  '/delete': { title: 'Удаление', mode: 'default' },

  '/connect': { title: 'Kafka Connect', mode: 'default' },
  '/ksqldb': { title: 'ksqlDB', mode: 'default' },
  '/schema-registry': { title: 'Schema Registry', mode: 'default' },
};
