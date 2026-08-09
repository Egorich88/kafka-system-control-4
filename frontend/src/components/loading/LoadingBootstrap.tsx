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
 * @file LoadingBootstrap.tsx
 * =============================================================================
 *
 * Контроллер первоначального запуска Kafka System Control.
 *
 * Назначение:
 *
 * • запускает реальную инициализацию приложения;
 * • отображает LoadingScreen во время запуска;
 * • после успешного завершения передаёт управление App;
 * • не содержит бизнес-логики Kafka или страниц приложения.
 *
 * Архитектура:
 *
 * LoadingBootstrap
 *       │
 *       ├── useLoading()
 *       │
 *       ├── LoadingScreen
 *       │
 *       └── App
 *
 * =============================================================================
 */

import { useLoading } from './hooks/useLoading';

import LoadingScreen from './components/LoadingScreen';

import App from '../../App';


/**
 * =============================================================================
 * LoadingBootstrap
 * =============================================================================
 *
 * Основная точка перехода от стартового экрана к приложению.
 * =============================================================================
 */
export default function LoadingBootstrap() {

    /*
     * Получаем реальное состояние первоначальной инициализации.
     */
    const loading = useLoading();


    /*
     * Пока приложение не завершило первоначальную инициализацию,
     * отображаем Splash Screen.
     */
    if (!loading.completed) {

        return (

            <LoadingScreen

                status={loading.message}

            />

        );

    }


    /*
     * Все обязательные первоначальные проверки завершены.
     *
     * Теперь Splash больше не нужен.
     *
     * Передаём управление полноценному приложению.
     */
    return <App />;

}