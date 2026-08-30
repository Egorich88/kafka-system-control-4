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

        const start = async () => {
            setState({
                progress: 35,
                currentStage: LoadingStage.INITIALIZATION,
                message: 'Инициализация...',
                completed: false
            });

            await new Promise<void>(resolve => {
                requestAnimationFrame(() => resolve());
            });

            if (cancelled) return;

            // Configuration is read synchronously by ClusterContext.
            setState({
                progress: 100,
                currentStage: LoadingStage.COMPLETE,
                message: 'Готово',
                completed: true
            });
        };

        void start();

        return () => {
            cancelled = true;
        };
    }, []);

    return state;
}
