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
 * ConsumerGroupsToolbar.tsx
 * =============================================================================
 *
 * Верхняя панель управления страницы Consumer Groups.
 *
 * На текущем этапе реализуется только визуальный каркас.
 *
 * Позже компонент будет использоваться для:
 *
 * • поиска Consumer Group;
 * • фильтрации по состоянию;
 * • отображения пустых групп;
 * • обновления списка;
 * • запуска Offset Reset Wizard;
 * • отображения количества найденных групп.
 *
 * =============================================================================
 */

import '../styles/consumer-toolbar.css';

export default function ConsumerGroupsToolbar() {

    return (

        <div className="consumer-toolbar">

            <div className="consumer-toolbar-left">

                <input
                    className="consumer-toolbar-search"
                    placeholder="Поиск группы..."
                />

                <select className="consumer-toolbar-select">

                    <option>Все состояния</option>

                    <option>Stable</option>

                    <option>Rebalancing</option>

                    <option>Empty</option>

                    <option>Dead</option>

                </select>

            </div>

            <div className="consumer-toolbar-right">

                <button className="consumer-toolbar-button">

                    Обновить

                </button>

                <div className="consumer-toolbar-counter">

                    Всего групп: 3

                </div>

            </div>

        </div>

    );

}