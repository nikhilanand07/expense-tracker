import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
const lightColors = {
  primary: '#6a11cb',
  accent: '#2575fc',
  background: '#f5f5f5',
  surface: '#ffffff',
  text: '#121212',
  error: '#CF6679',
  notification: '#f50057',
  border: '#e0e0e0',
};

const darkColors = {
  primary: '#a66eff',
  accent: '#4a00e0',
  background: '#121212',
  surface: '#1e1e1e',
  text: '#e0e0e0',
  error: '#CF6679',
  notification: '#f50057',
  border: '#333333',
};

// Create theme objects
const lightTheme = {
  dark: false,
  colors: lightColors,
};

const darkTheme = {
  dark: true,
  colors: darkColors,
};

// Create context with default values
const ThemeContext = createContext({
  darkMode: false,
  theme: lightTheme,
  toggleTheme: () => {},
});

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Get system color scheme
  const colorScheme = useColorScheme();
  
  // State for dark mode
  const [darkMode, setDarkMode] = useState(colorScheme === 'dark');
  
  // Current theme object
  const theme = darkMode ? darkTheme : lightTheme;

  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedThemePreference = await AsyncStorage.getItem('themePreference');
        if (storedThemePreference !== null) {
          setDarkMode(storedThemePreference === 'dark');
        } else {
          // Use system preference if no stored preference
          setDarkMode(colorScheme === 'dark');
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
        // Default to system preference if there's an error
        setDarkMode(colorScheme === 'dark');
      }
    };
    
    loadThemePreference();
  }, [colorScheme]);

  // Toggle between light and dark mode
  const toggleTheme = async () => {
    try {
      const newMode = !darkMode;
      setDarkMode(newMode);
      await AsyncStorage.setItem('themePreference', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
