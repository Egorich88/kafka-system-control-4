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
 * ConsumerGroupDetails.tsx
 * =============================================================================
 *
 * Правая информационная панель выбранной Consumer Group.
 *
 * Отображает:
 *
 * • основную информацию;
 * • состояние;
 * • Lag;
 * • участников;
 * • координатора.
 *
 * После подключения backend
 * здесь появятся:
 *
 * • список топиков;
 * • Offset Reset;
 * • Members;
 * • Offsets.
 *
 * =============================================================================
 */
import '../styles/consumer-details.css';
import type { ConsumerGroup } from '../types/consumer-groups.types';
import ConsumerMembers from './ConsumerMembers';
import ConsumerOffsets from './ConsumerOffsets';

interface Props {

    group: ConsumerGroup | null;

}

export default function ConsumerGroupDetails({

    group

}: Props) {

    if (!group) {

        return (

            <div className="consumer-details consumer-details-empty">

                Выберите группу потребителей

            </div>

        );

    }

    return (

        <div className="consumer-details">

            <div className="consumer-details-header">

                <div className="consumer-details-title">

                    Информация о группе

                </div>

                <div className="consumer-details-group">

                    {group.name}

                </div>

                <span

                    className={`state-badge ${group.state.toLowerCase()}`}

                >

                    {group.state}

                </span>

            </div>

            <div className="consumer-details-section">

                <div className="consumer-details-row">

                    <span className="consumer-details-label">

                        Отставание

                    </span>

                    <span className="consumer-details-value">

                        {group.lag}

                    </span>

                </div>

                <div className="consumer-details-row">

                    <span className="consumer-details-label">

                        Участники

                    </span>

                    <span className="consumer-details-value">

                        {group.members}

                    </span>

                </div>

                <div className="consumer-details-row">

                    <span className="consumer-details-label">

                        Координатор

                    </span>

                    <span className="consumer-details-value">

                        {group.coordinator}

                    </span>

                </div>

                <div className="consumer-details-row">

                    <span className="consumer-details-label">

                        Топики

                    </span>

                    <span className="consumer-details-value">

                        —

                    </span>

                </div>

                <div className="consumer-details-row">

                    <span className="consumer-details-label">

                        Партиции

                    </span>

                    <span className="consumer-details-value">

                        —

                    </span>

                </div>

                

            </div>

            <div className="consumer-details-section">

                <div className="consumer-details-section-title">

                    Действия

                </div>

                <ConsumerMembers

                    group={group}

                />

                <button className="offset-reset-button">

                    Сбросить offset



                </button>


            </div>
            <ConsumerOffsets

                group={group}

            />

        </div>

    );

}