/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

/**
 * @file PanelFullscreenButton.tsx
 * Кнопка увеличения панели Overview.
 *
 * Панель не занимает весь монитор: она открывается по центру страницы,
 * а остальной интерфейс закрывается затемнённым и размытым слоем.
 */

import { useEffect, useState } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export default function PanelFullscreenButton(): JSX.Element {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      closeFullscreen();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeFullscreen = () => {
    document.querySelectorAll<HTMLElement>('.is-panel-fullscreen').forEach((panel) => {
      panel.classList.remove('is-panel-fullscreen');
    });
    document.body.classList.remove('panel-modal-open');
    setFullscreen(false);
  };

  const toggle = () => {
    const button = document.activeElement as HTMLElement | null;
    const panel = button?.closest<HTMLElement>('.dashboard-panel, .events-panel');
    if (!panel) return;

    const next = !panel.classList.contains('is-panel-fullscreen');
    closeFullscreen();

    if (next) {
      panel.classList.add('is-panel-fullscreen');
      document.body.classList.add('panel-modal-open');
      setFullscreen(true);
    }
  };

  return (
    <button
      type="button"
      className="panel-fullscreen-button"
      title={fullscreen ? 'Свернуть панель' : 'Увеличить панель'}
      aria-label={fullscreen ? 'Свернуть панель' : 'Увеличить панель'}
      onClick={toggle}
    >
      {fullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
    </button>
  );
}
