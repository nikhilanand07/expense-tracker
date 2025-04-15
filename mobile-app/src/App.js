import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppNavigator from './navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Main app component with navigation and providers
const MainApp = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

// Separate component to use the theme context
const AppContent = () => {
  const { theme, darkMode } = useTheme();
  
  // Create paper theme based on our custom theme
  const paperTheme = {
    ...(darkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(darkMode ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: theme.colors.primary,
      accent: theme.colors.accent,
      background: theme.colors.background,
      surface: theme.colors.surface,
      text: theme.colors.text,
      error: theme.colors.error,
    }
  };
  
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={{
        dark: darkMode,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.notification,
        }
      }}>
        <StatusBar style={darkMode ? "light" : "dark"} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default MainApp;
