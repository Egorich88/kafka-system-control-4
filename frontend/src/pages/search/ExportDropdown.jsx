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
                } ${
                    exportMenu === type
                        ? "open"
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