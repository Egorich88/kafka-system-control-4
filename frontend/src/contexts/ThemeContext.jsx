/*
 * Copyright 2026 Egor Khomenko (Egorich88)
 *
 * Licensed under the Apache License, Version 2.0
 */

import {
  createContext,
  useContext,
  useEffect,
  useState
} from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({
  children
}) {

  const [theme, setTheme] =
    useState(
      localStorage.getItem('ksc_theme')
      || 'dark'
    );

  useEffect(() => {

    document.documentElement.setAttribute(
      'data-theme',
      theme
    );

    localStorage.setItem(
      'ksc_theme',
      theme
    );

  }, [theme]);

  return (

    <ThemeContext.Provider
      value={{
        theme,
        setTheme
      }}
    >

      {children}

    </ThemeContext.Provider>
  );
}

export function useTheme() {

  return useContext(ThemeContext);
}

