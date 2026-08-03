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
 * @file LoadingDemo.tsx
 * =============================================================================
 *
 * Демонстрационный экран загрузки Kafka System Control.
 *
 * Назначение:
 * • локальная проверка интерфейса;
 * • тестирование анимаций;
 * • проверка адаптивности;
 * • разработка Splash Screen без подключения App.jsx.
 *
 * После завершения разработки данный файл будет удален.
 * =============================================================================
 */

import { useEffect, useState } from "react";

import LoadingScreen from "./components/LoadingScreen";

export default function LoadingDemo() {

    const [progress, setProgress] = useState(0);

    const [status, setStatus] = useState("Initializing...");

    useEffect(() => {

        const timer = setInterval(() => {

            setProgress(previous => {

                const next = previous + 1;

                if (next === 20)
                    setStatus("Loading configuration...");

                if (next === 45)
                    setStatus("Connecting to Kafka...");

                if (next === 70)
                    setStatus("Starting services...");

                if (next === 95)
                    setStatus("Ready");

                if (next >= 100) {

                    clearInterval(timer);

                    return 100;

                }

                return next;

            });

        }, 40);

        return () => clearInterval(timer);

    }, []);

    return (

        <LoadingScreen
            progress={progress}
            status={status}
        />

    );

}