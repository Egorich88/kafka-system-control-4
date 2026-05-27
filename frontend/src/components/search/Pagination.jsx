/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

export default function Pagination({
    currentPage,
    setCurrentPage,
    totalPages,
    total
}) {

if (totalPages <= 1) {
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
            ).map((page) => (

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