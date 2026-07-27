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
 * LoadingProgress.tsx
 * =============================================================================
 *
 * Компонент полосы загрузки приложения.
 *
 * Отображает:
 *
 * • прогресс;
 * • процент;
 * • плавную анимацию.
 *
 * Данный компонент не знает,
 * ЧТО именно сейчас загружается.
 *
 * Он только отображает состояние,
 * которое получает извне.
 *
 * =============================================================================
 */

interface LoadingProgressProps {

    /**
     * Процент загрузки.
     */
    progress: number;

}

export default function LoadingProgress({
    progress
}: LoadingProgressProps) {

    return (

        <div className="loading-progress">

            {/* Контейнер полосы */}
            <div className="loading-progress-track">

                {/* Заполненная часть */}
                <div
                    className="loading-progress-fill"
                    style={{
                        width: `${progress}%`
                    }}
                />

            </div>

            {/* Процент */}
            <div className="loading-progress-percent">

                {progress}%

            </div>

        </div>

    );

}