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
 * Центральный Hook стартовой инициализации Kafka System Control.
 *
 * В отличие от предыдущей демонстрационной версии данный Hook больше
 * не использует искусственный таймер и не увеличивает процент загрузки.
 *
 * Теперь состояние загрузки определяется реальными этапами запуска
 * приложения.
 *
 * Последовательность:
 *
 * 1. Инициализация приложения.
 * 2. Проверка сохранённой конфигурации.
 * 3. Проверка доступности Backend.
 * 4. Проверка Kafka-кластера.
 * 5. Завершение инициализации.
 *
 * LoadingScreen остаётся исключительно визуальным компонентом.
 *
 * =============================================================================
 */

import { useEffect, useState } from 'react';
import axios from 'axios';

import {
    LoadingStage,
    LoadingState
} from '../types/loading';


/* =============================================================================
   Начальное состояние
============================================================================= */

/**
 * Начальное состояние Splash Screen.
 */
const INITIAL_STATE: LoadingState = {

    progress: 0,

    currentStage: LoadingStage.INITIALIZATION,

    message: 'Инициализация...',

    completed: false

};


/* =============================================================================
   Hook
============================================================================= */

/**
 * Управляет реальным процессом первоначальной инициализации приложения.
 */
export function useLoading() {

    const [state, setState] = useState<LoadingState>(INITIAL_STATE);


    useEffect(() => {

        /*
         * Флаг предотвращает обновление состояния после размонтирования
         * компонента.
         */
        let cancelled = false;


        /**
         * Безопасно обновляет состояние.
         */
        const updateState = (
            currentStage: LoadingStage,
            message: string,
            progress: number
        ) => {

            if (cancelled) {
                return;
            }

            setState({

                progress,

                currentStage,

                message,

                completed: false

            });

        };


        /**
         * Выполняет последовательность первоначальной инициализации.
         */
        const initializeApplication = async () => {

            try {

                /* =============================================================
                   Этап 1 — инициализация
                ============================================================= */

                updateState(
                    LoadingStage.INITIALIZATION,
                    'Инициализация...',
                    10
                );


                /*
                 * Даём React возможность отрисовать первый экран.
                 *
                 * Здесь НЕТ искусственной задержки загрузки.
                 *
                 * requestAnimationFrame нужен только для того,
                 * чтобы первый визуальный кадр Splash Screen успел
                 * появиться до начала сетевых проверок.
                 */
                await new Promise<void>(resolve => {

                    requestAnimationFrame(() => resolve());

                });


                /* =============================================================
                   Этап 2 — конфигурация
                ============================================================= */

                updateState(
                    LoadingStage.CONFIGURATION,
                    'Загрузка конфигурации...',
                    30
                );


                /*
                 * Получаем сохранённые Kafka-кластеры.
                 *
                 * ClusterContext использует тот же ключ localStorage.
                 */
                const storedClusters =
                    localStorage.getItem('kafka_clusters');


                let clusters: Array<{
                    id: string;
                    brokers?: string;
                }> = [];


                if (storedClusters) {

                    try {

                        const parsed = JSON.parse(storedClusters);

                        if (Array.isArray(parsed)) {

                            clusters = parsed;

                        }

                    } catch (error) {

                        console.error(
                            'Kafka System Control: не удалось обработать сохранённые кластеры.',
                            error
                        );

                    }

                }


                /* =============================================================
                   Этап 3 — Backend
                ============================================================= */

                updateState(
                    LoadingStage.SERVER,
                    'Подключение к серверу...',
                    50
                );


                /*
                 * Проверяем, отвечает ли Backend приложения.
                 *
                 * Используем существующий API endpoint.
                 *
                 * Важно:
                 * этот запрос не проверяет Kafka.
                 * Он только подтверждает доступность Backend.
                 */
                await axios.get('/api/overview', {

                    timeout: 5000

                });


                /* =============================================================
                   Этап 4 — Kafka
                ============================================================= */

                updateState(
                    LoadingStage.CLUSTER,
                    'Подключение к Kafka...',
                    75
                );


                /*
                 * Если сохранён хотя бы один кластер,
                 * проверяем первый кластер.
                 *
                 * На данном этапе используем ту же модель,
                 * которая уже используется ClusterContext.
                 */
                const firstCluster = clusters[0];


                if (firstCluster?.brokers) {

                    await axios.get('/api/clusters/health', {

                        headers: {

                            'X-Kafka-Bootstrap':
                                firstCluster.brokers

                        },

                        timeout: 5000

                    });

                }


                /* =============================================================
                   Этап 5 — завершение
                ============================================================= */

                updateState(
                    LoadingStage.DATA,
                    'Загрузка данных...',
                    90
                );


                /*
                 * Здесь пока не загружаем данные конкретных страниц.
                 *
                 * На этом этапе достаточно завершить инфраструктурную
                 * инициализацию.
                 *
                 * Реальные данные Overview / Topics / Brokers и т.д.
                 * будут загружаться уже самими страницами.
                 */

                updateState(
                    LoadingStage.COMPLETE,
                    'Готово',
                    100
                );


                if (!cancelled) {

                    setState({

                        progress: 100,

                        currentStage: LoadingStage.COMPLETE,

                        message: 'Готово',

                        completed: true

                    });

                }


            } catch (error) {

                /*
                 * На этом этапе не скрываем ошибку и не делаем вид,
                 * что приложение успешно загрузилось.
                 *
                 * Временно оставляем состояние на текущем этапе.
                 */

                console.error(
                    'Kafka System Control: Ошибка инициализации приложения.',
                    error
                );


                if (!cancelled) {

                    setState(previous => ({

                        ...previous,

                        message: 'Ошибка инициализации',

                        completed: false

                    }));

                }

            }

        };


        initializeApplication();


        /*
         * Очистка при размонтировании.
         */
        return () => {

            cancelled = true;

        };

    }, []);


    return state;

}