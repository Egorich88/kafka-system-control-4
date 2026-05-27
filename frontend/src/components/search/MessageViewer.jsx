export default function MessageViewer({

    selectedMessage,
    viewFormat,
    setViewFormat

}) {

    if (!selectedMessage) {
        return null
    }

    return (

        <div className="message-detail-panel">

            <div className="message-detail-header">

                <h3>
                    Детали сообщения
                </h3>

                <select
                    value={viewFormat}
                    onChange={(e) =>
                        setViewFormat(e.target.value)
                    }
                >

                    <option value="json">
                        JSON
                    </option>

                    <option value="raw">
                        RAW
                    </option>

                </select>

            </div>

            <div className="message-detail-meta">

                <span>
                    Offset: {selectedMessage.offset}
                </span>

                <span>
                    Key: {selectedMessage.key || "-"}
                </span>

            </div>

            <pre className="message-detail-content">

                {
                    (() => {

                        if (viewFormat === "raw") {
                            return selectedMessage.value
                        }

                        try {

                            return JSON.stringify(
                                JSON.parse(selectedMessage.value),
                                null,
                                2
                            )

                        } catch {

                            return selectedMessage.value
                        }

                    })()
                }

            </pre>

        </div>
    )
}