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
 * Контейнер стартовой загрузки Kafka System Control.
 *
 * Исторически компонент использовался как демонстрационный экран.
 *
 * На текущем этапе демонстрационный таймер полностью удалён.
 * Состояние загрузки поступает из useLoading().
 *
 * =============================================================================
 */

import LoadingScreen from './components/LoadingScreen';

import { useLoading } from './hooks/useLoading';


/**
 * =============================================================================
 * LoadingDemo
 * =============================================================================
 *
 * Отображает стартовый экран на основании реального состояния
 * первоначальной инициализации приложения.
 * =============================================================================
 */
export default function LoadingDemo() {

    /*
     * Получаем состояние реальной инициализации приложения.
     */
    const loading = useLoading();


    return (

        <LoadingScreen

            /*
             * Передаём только текст текущего этапа.
             *
             * LoadingProgress является полностью декоративным
             * и больше не зависит от процента.
             */
            status={loading.message}

        />

    );

}