import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Obtener tema inicial
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Aplicar cambios de tema a nivel de documento
    const root = document.documentElement;
    
    // Remover todas las clases de tema
    root.classList.remove('dark', 'light');
    document.body.classList.remove('dark', 'light');
    
    // Añadir nuevas clases de tema
    root.classList.add(theme);
    document.body.classList.add(theme);
    
    // Guardar preferencia de tema
    localStorage.setItem('theme', theme);
    
    // Establecer atributo data-theme para selectores CSS
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);