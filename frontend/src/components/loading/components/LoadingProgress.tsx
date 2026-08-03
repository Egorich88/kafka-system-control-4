/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import "../styles/loading-screen.css";

interface LoadingProgressProps {

    /**
     * Процент выполнения загрузки.
     */
    progress: number;

}

export default function LoadingProgress({

    progress

}: LoadingProgressProps) {

    return (

        <div className="loading-progress">

            <div className="loading-progress-track">

                <div
                    className="loading-progress-fill"
                    style={{
                        width: `${progress}%`
                    }}
                />

            </div>

            <div className="loading-progress-value">

                {progress}%

            </div>

        </div>

    );

}