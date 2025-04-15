import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// Main app component
const App = () => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
};

// Component that uses the theme
const ThemedApp = () => {
  const { theme, darkMode } = useTheme();
  
  // Create paper theme
  const paperTheme = {
    ...(darkMode ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(darkMode ? MD3DarkTheme.colors : MD3LightTheme.colors),
      primary: theme.colors.primary,
      accent: theme.colors.accent,
      background: theme.colors.background,
      surface: theme.colors.surface,
      text: theme.colors.text,
    }
  };
  
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer>
        <StatusBar style={darkMode ? "light" : "dark"} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
