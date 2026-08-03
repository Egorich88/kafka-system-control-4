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
 * @file LoadingScreen.tsx
 * =============================================================================
 *
 * Главный контейнер стартового экрана Kafka System Control.
 *
 * Назначение:
 *
 * • объединяет все компоненты экрана загрузки;
 * • не содержит бизнес-логики;
 * • не содержит useEffect;
 * • не содержит запросов к API;
 * • не управляет временем.
 *
 * Все данные поступают извне через props.
 *
 * Архитектура:
 *
 * LoadingScreen
 * ├── LoadingLogo
 * ├── LoadingStatus
 * └── LoadingProgress
 *
 * =============================================================================
 */

import "../styles/loading-screen.css";

import LoadingLogo from "./LoadingLogo";
import LoadingStatus from "./LoadingStatus";
import LoadingProgress from "./LoadingProgress";

/**
 * =============================================================================
 * Свойства LoadingScreen.
 * =============================================================================
 */
interface LoadingScreenProps {

    /**
     * Процент выполнения.
     */
    progress: number;

    /**
     * Текущее состояние.
     */
    status: string;

}

/**
 * =============================================================================
 * LoadingScreen
 * =============================================================================
 */
export default function LoadingScreen({

    progress,
    status

}: LoadingScreenProps) {

    return (

        <div className="loading-screen">

            <div className="loading-container">

                <LoadingLogo />

                <LoadingStatus
                    text={status}
                />

                <LoadingProgress
                    progress={progress}
                />

            </div>

        </div>

    );

}