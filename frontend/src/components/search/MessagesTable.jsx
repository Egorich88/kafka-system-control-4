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