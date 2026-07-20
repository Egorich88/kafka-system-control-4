/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 */

 /**
  * =============================================================================
  * ConsumerStateBadge.tsx
  * =============================================================================
  *
  * Универсальный компонент отображения состояния Consumer Group.
  *
  * Используется:
  *
  * • таблицей
  * • правой панелью
  * • Offset Reset Wizard
  * • Members
  *
  * Все состояния отображаются одинаково.
  *
  * =============================================================================
  */

interface Props {

    state: string;

}

export default function ConsumerStateBadge({

    state

}: Props) {

    return (

        <span
            className={`consumer-state-badge ${state.toLowerCase()}`}
        >

            {state}

        </span>

    );

}