/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 */

/**
 * @fileoverview Компактный глобальный переключатель Light / Dark.
 *
 * В Sidebar отображается как одна минималистичная иконка:
 * - в тёмной теме — солнце;
 * - в светлой теме — луна;
 * - при наведении показывается иконка противоположной темы;
 * - клик сразу переключает тему.
 */

import { FiMoon, FiSun } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import '../../styles/theme-toggle.css';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  const isLight = theme === 'light';
  const nextTheme = isLight ? 'dark' : 'light';

  const handleToggle = () => {
    setTheme(nextTheme);
  };

  const label = isLight
    ? t('sidebar.switchToDark')
    : t('sidebar.switchToLight');

  return (
    <button
      type="button"
      className={`theme-toggle ${isLight ? 'light' : 'dark'}`}
      onClick={handleToggle}
      aria-label={label}
      aria-pressed={isLight}
      data-tooltip-id="sidebar-tooltip"
      data-tooltip-content={label}
    >
      <span className="theme-toggle-icon theme-toggle-icon-current" aria-hidden="true">
        {isLight ? <FiSun /> : <FiMoon />}
      </span>
      <span className="theme-toggle-icon theme-toggle-icon-hover" aria-hidden="true">
        {isLight ? <FiMoon /> : <FiSun />}
      </span>
    </button>
  );
}
