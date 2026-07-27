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
 * useLoading.ts
 * =============================================================================
 *
 * Центральный Hook системы стартовой загрузки Kafka System Control.
 *
 * Сейчас используется демонстрационная (симулированная) загрузка.
 *
 * Позже этот Hook будет получать реальные события приложения:
 *
 * • загрузка настроек;
 * • проверка Backend;
 * • проверка Kafka;
 * • получение информации о кластере;
 * • открытие первой страницы.
 *
 * Благодаря этому Loading Screen никогда не придется переписывать.
 * Будет меняться только источник данных.
 *
 * =============================================================================
 */

import { useEffect, useState } from 'react';

import {
    LoadingStage,
    LoadingState
} from '../types/loading';

/**
 * Интервал обновления прогресса.
 */
const UPDATE_INTERVAL = 35;

/**
 * Максимальный процент.
 */
const MAX_PROGRESS = 100;

/**
 * Hook управления загрузкой приложения.
 */
export function useLoading() {

    /**
     * Состояние загрузки.
     */
    const [state, setState] = useState<LoadingState>({
        progress: 0,
        currentStage: LoadingStage.INITIALIZATION,
        message: 'Запуск приложения...',
        completed: false
    });

    useEffect(() => {

        /**
         * Таймер.
         */
        const timer = setInterval(() => {

            setState(previous => {

                const nextProgress = previous.progress + 1;

                /**
                 * Если дошли до конца —
                 * завершаем загрузку.
                 */
                if (nextProgress >= MAX_PROGRESS) {

                    clearInterval(timer);

                    return {
                        progress: 100,
                        currentStage: LoadingStage.COMPLETE,
                        message: 'Готово',
                        completed: true
                    };
                }

                /**
                 * Определяем этап.
                 */
                let stage = LoadingStage.INITIALIZATION;
                let message = 'Запуск приложения...';

                if (nextProgress >= 15) {
                    stage = LoadingStage.SERVER;
                    message = 'Подключение к серверу...';
                }

                if (nextProgress >= 35) {
                    stage = LoadingStage.CONFIGURATION;
                    message = 'Проверка конфигурации...';
                }

                if (nextProgress >= 60) {
                    stage = LoadingStage.CLUSTER;
                    message = 'Подключение к кластеру Kafka...';
                }

                if (nextProgress >= 85) {
                    stage = LoadingStage.DATA;
                    message = 'Загрузка данных...';
                }

                return {

                    progress: nextProgress,

                    currentStage: stage,

                    message,

                    completed: false
                };

            });

        }, UPDATE_INTERVAL);

        return () => clearInterval(timer);

    }, []);

    return state;

}