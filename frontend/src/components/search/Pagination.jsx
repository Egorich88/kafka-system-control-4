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

export default function Pagination({
    currentPage,
    setCurrentPage,
    totalPages,
    total
}) {

if (totalPages <= 7) {
    return null
}
    return (

        <div className="table-footer-right">

            {currentPage > 1 && (

                <button
                    className="pagination-btn"
                    onClick={() =>
                        setCurrentPage(currentPage - 1)
                    }
                >
                    &lt;
                </button>

            )}

            {Array.from(
                { length: totalPages },
                (_, i) => i + 1
            )
            .filter((page) => {

                return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                )

            })
            .map((page) => (

                <button
                    key={page}
                    className={`pagination-page ${
                        currentPage === page
                            ? "active"
                            : ""
                    }`}
                    onClick={() =>
                        setCurrentPage(page)
                    }
                >
                    {page}
                </button>

            ))}

            {currentPage < totalPages && (

                <button
                    className="pagination-btn"
                    onClick={() =>
                        setCurrentPage(currentPage + 1)
                    }
                >
                    &gt;
                </button>

            )}

        </div>
    )
}