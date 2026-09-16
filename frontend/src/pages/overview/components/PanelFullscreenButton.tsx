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

/**
 * @file PanelFullscreenButton.tsx
 * Кнопка полноэкранного просмотра панели Overview.
 * Комментарии и интерфейс предназначены для единого поведения всех панелей.
 */

import { useEffect, useState } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';

export default function PanelFullscreenButton(): JSX.Element {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        document.querySelector<HTMLElement>('.is-panel-fullscreen')?.classList.remove('is-panel-fullscreen');
        setFullscreen(false);
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, []);

  const toggle = () => {
    const source = document.activeElement as HTMLElement | null;
    const panel = source?.closest<HTMLElement>(
      '.dashboard-panel, .events-panel, .certificate-panel'
    );

    if (!panel) return;
    const next = !panel.classList.contains('is-panel-fullscreen');
    document.querySelectorAll<HTMLElement>('.is-panel-fullscreen').forEach((item) => {
      if (item !== panel) item.classList.remove('is-panel-fullscreen');
    });
    panel.classList.toggle('is-panel-fullscreen', next);
    setFullscreen(next);
  };

  return (
    <button
      type="button"
      className="panel-fullscreen-button"
      title={fullscreen ? 'Свернуть панель' : 'Открыть на весь экран'}
      aria-label={fullscreen ? 'Свернуть панель' : 'Открыть панель на весь экран'}
      onClick={toggle}
    >
      {fullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
    </button>
  );
}
