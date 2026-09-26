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
 * Non-blocking startup hook.
 *
 * The splash screen is responsible only for bootstrapping the frontend.
 * Kafka/backend availability must never prevent the main UI from opening.
 * ClusterContext performs health checks asynchronously after App is mounted.
 */

import { useEffect, useState } from 'react';
import { LoadingStage, LoadingState } from '../types/loading';

const INITIAL_STATE: LoadingState = {
    progress: 0,
    currentStage: LoadingStage.INITIALIZATION,
    message: 'Инициализация...',
    completed: false
};

export function useLoading(): LoadingState {
    const [state, setState] = useState<LoadingState>(INITIAL_STATE);

    useEffect(() => {
        let cancelled = false;
        const timers: number[] = [];

        const stages: LoadingState[] = [
            { progress: 20, currentStage: LoadingStage.INITIALIZATION, message: 'Инициализация...', completed: false },
            { progress: 45, currentStage: LoadingStage.INITIALIZATION, message: 'Загрузка конфигурации...', completed: false },
            { progress: 70, currentStage: LoadingStage.INITIALIZATION, message: 'Проверка подключения...', completed: false },
            { progress: 90, currentStage: LoadingStage.INITIALIZATION, message: 'Запуск интерфейса...', completed: false },
        ];

        stages.forEach((stage, index) => {
            timers.push(window.setTimeout(() => {
                if (!cancelled) setState(stage);
            }, index * 420));
        });

        timers.push(window.setTimeout(() => {
            if (cancelled) return;
            setState({
                progress: 100,
                currentStage: LoadingStage.COMPLETE,
                message: 'Готово',
                completed: true
            });
        }, 1800));

        return () => {
            cancelled = true;
            timers.forEach(window.clearTimeout);
        };
    }, []);

    return state;
}
