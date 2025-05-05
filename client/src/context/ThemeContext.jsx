import React, { createContext, useState, useEffect, useContext } from 'react';

// Crear el contexto
const ThemeContext = createContext();

// Hook personalizado para acceder al contexto del tema
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Verificar si hay una preferencia guardada o usar la preferencia del sistema
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Verificar si el sistema prefiere el modo oscuro
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Función para cambiar el tema
  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      // Guardar en localStorage
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  // Aplicar el tema al documento
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Limpiar clases anteriores
    root.classList.remove('light-theme', 'dark-theme');
    
    // Agregar la clase del tema actual
    root.classList.add(`${theme}-theme`);
    
    // Actualizar el atributo data-theme para CSS
    root.setAttribute('data-theme', theme);
    
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};