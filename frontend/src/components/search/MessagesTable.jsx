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
export default function MessagesTable({

    messages,
    selectedRows,
    toggleAllRows,
    toggleRowSelection,
    selectedMessage,
    setSelectedMessage,
    partition

}) {

    return (

        <table className="messages-table">

            <thead>

                <tr>

                    <th>

                        <input
                            type="checkbox"
                            checked={
                                messages.length > 0 &&
                                selectedRows.length === messages.length
                            }
                            onChange={toggleAllRows}
                        />

                    </th>

                    <th>Оффсет</th>
                    <th>Партиция</th>
                    <th>Ключ</th>
                    <th>Время</th>
                    <th>Размер</th>
                    <th>Предпросмотр</th>

                </tr>

            </thead>

            <tbody>

                {messages.map((msg) => {

                    const isSelected =
                        selectedMessage?.offset === msg.offset

                    return (

                        <tr
                            key={msg.offset}
                            className={isSelected ? "active-row" : ""}
                            onClick={() => setSelectedMessage(msg)}
                        >

                            <td>

                                <input
                                    type="checkbox"
                                    checked={selectedRows.includes(String(msg.offset))}
                                    onChange={(e) => {

                                        e.stopPropagation()

                                        toggleRowSelection(String(msg.offset))
                                    }}
                                />

                            </td>

                            <td>{msg.offset}</td>

                            <td>{partition}</td>

                            <td className="message-key-cell">
                                {msg.key || "-"}
                            </td>

                            <td>
                                {msg.timestamp}
                            </td>

                            <td>
                                {new Blob([msg.value]).size} B
                            </td>

                            <td className="preview-cell">

                                {msg.value?.slice(0, 90)}

                            </td>

                        </tr>
                    )
                })}

            </tbody>

        </table>
    )
}