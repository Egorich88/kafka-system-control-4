import {
    FiDownload,
    FiChevronDown
} from 'react-icons/fi'

export default function ExportDropdown({

    type,
    exportMenu,
    setExportMenu,
    exportMessages,
    count

}) {

    return (

        <div className="export-dropdown">

            <button
                type="button"
                className={`export-btn ${
                    type === "all"
                        ? "secondary"
                        : ""
                }`}
                onClick={() =>
                    setExportMenu(
                        exportMenu === type
                            ? null
                            : type
                    )
                }
            >

                <FiDownload className="export-icon" />

                {
                    type === "selected"
                        ? `Экспорт выбранных (${count})`
                        : `Экспорт всех (${count})`
                }

                <FiChevronDown className="export-chevron" />

            </button>

            {exportMenu === type && (

                <>



                    <div className="export-menu">

                        <button
                            onClick={() =>
                                exportMessages(
                                    "json",
                                    type === "selected"
                                )
                            }
                        >
                            JSON
                        </button>

                        <button
                            onClick={() =>
                                exportMessages(
                                    "csv",
                                    type === "selected"
                                )
                            }
                        >
                            CSV
                        </button>

                        <button
                            onClick={() =>
                                exportMessages(
                                    "txt",
                                    type === "selected"
                                )
                            }
                        >
                            TXT
                        </button>

                    </div>

                </>

            )}

        </div>
    )
}