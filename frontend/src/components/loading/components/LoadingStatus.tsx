/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

import "../styles/loading-screen.css";

interface LoadingStatusProps {

    /**
     * Текст текущего состояния загрузки.
     */
    text: string;

}

export default function LoadingStatus({

    text

}: LoadingStatusProps) {

    return (

        <div className="loading-status">

            {text}

        </div>

    );

}