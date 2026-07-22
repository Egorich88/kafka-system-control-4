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
 * ============================================================================
 * ConsumerMembers.tsx
 * ============================================================================
 *
 * Список участников выбранной Consumer Group.
 *
 * Пока отображаются временные данные.
 *
 * После реализации backend компонент будет получать
 * участников выбранной группы через API.
 * ============================================================================
 */

import '../styles/consumer-members.css';

import type {

    ConsumerGroup,

    ConsumerMember

} from '../types/consumer-groups.types';

interface Props {

    group: ConsumerGroup | null;

}

/*
 * Временные участники.
 */

const mockMembers: ConsumerMember[] = [

    {

        id: 'consumer-1',

        clientId: 'payment-01',

        host: '10.0.0.15',

        partitions: ['payments-0', 'payments-1']

    },

    {

        id: 'consumer-2',

        clientId: 'payment-02',

        host: '10.0.0.16',

        partitions: ['payments-2']

    }

];

export default function ConsumerMembers({

    group

}: Props) {

    if (!group) {

        return null;

    }

    return (

        <div className="consumer-members">

            <div className="consumer-members-title">

                Участники группы

            </div>

            {mockMembers.map(member => (

                <div
                    key={member.id}
                    className="consumer-member-card"
                >

                    <div className="consumer-member-name">

                        {member.id}

                    </div>

                    <div>

                        Client ID: {member.clientId}

                    </div>

                    <div>

                        Host: {member.host}

                    </div>

                    <div>

                        Partition:

                        {' '}

                        {member.partitions.join(', ')}

                    </div>

                </div>

            ))}

        </div>

    );

}