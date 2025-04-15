import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Surface, Button, Switch, Divider, List, Avatar, Menu } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { currencies } from '../utils/currencyUtils';

const ProfileScreen = () => {
  const { user, updateCurrency, logout } = useAuth();
  const { theme, darkMode, toggleTheme, isThemeManuallySet, resetToSystemTheme } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState(user?.currency || 'USD');
  const [loading, setLoading] = useState(false);
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [currencyButtonLayout, setCurrencyButtonLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Handle currency change
  const handleCurrencyChange = async (currency) => {
    setSelectedCurrency(currency);
    setCurrencyMenuVisible(false);
    
    try {
      setLoading(true);
      const result = await updateCurrency(currency);
      
      if (!result.success) {
        Alert.alert('Error', result.message || 'Failed to update currency');
        setSelectedCurrency(user.currency); // Reset to previous value
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      Alert.alert('Error', 'Failed to update currency');
      setSelectedCurrency(user.currency); // Reset to previous value
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  // Get currency display text
  const getCurrencyDisplayText = (code) => {
    const currency = currencies.find(c => c.code === code);
    return currency ? `${currency.code} (${currency.symbol}) - ${currency.name}` : code;
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Surface style={[styles.profileHeader, { backgroundColor: theme.colors.primary }]}>
        <Avatar.Text 
          size={80} 
          label={user?.name?.charAt(0) || 'U'} 
          backgroundColor={darkMode ? '#4a00e0' : '#8e2de2'}
          color="#fff"
        />
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </Surface>
      
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Appearance</Text>
        
        <List.Item
          title="Dark Mode"
          description="Toggle between light and dark theme"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={props => (
            <Switch
              value={darkMode}
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
        />
        
        {isThemeManuallySet && (
          <Button 
            mode="text" 
            onPress={resetToSystemTheme}
            style={styles.resetButton}
          >
            Reset to System Default
          </Button>
        )}
      </Surface>
      
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Currency</Text>
        
        <Text style={[styles.label, { color: theme.colors.text }]}>Select Currency</Text>
        <Button
          mode="outlined"
          onPress={() => setCurrencyMenuVisible(true)}
          style={[styles.currencyButton, { 
            borderColor: darkMode ? '#444' : '#e0e0e0',
            backgroundColor: darkMode ? '#2d2d2d' : '#f5f5f5',
          }]}
          labelStyle={{ color: theme.colors.text }}
          disabled={loading}
          onLayout={(event) => {
            const { x, y, width, height } = event.nativeEvent.layout;
            setCurrencyButtonLayout({ x, y, width, height });
          }}
        >
          {getCurrencyDisplayText(selectedCurrency)}
        </Button>
        
        <Menu
          visible={currencyMenuVisible}
          onDismiss={() => setCurrencyMenuVisible(false)}
          anchor={currencyButtonLayout}
          style={styles.menu}
          contentStyle={{ maxHeight: 300 }}
        >
          <ScrollView style={styles.menuScrollView}>
            {currencies.map(curr => (
              <Menu.Item
                key={curr.code}
                title={`${curr.code} (${curr.symbol}) - ${curr.name}`}
                onPress={() => handleCurrencyChange(curr.code)}
                titleStyle={selectedCurrency === curr.code ? { color: theme.colors.primary, fontWeight: 'bold' } : {}}
              />
            ))}
          </ScrollView>
        </Menu>
      </Surface>
      
      <Surface style={[styles.section, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Account</Text>
        
        <List.Item
          title="Logout"
          description="Sign out from your account"
          left={props => <List.Icon {...props} icon="logout" color={theme.colors.error} />}
          onPress={handleLogout}
          titleStyle={{ color: theme.colors.error }}
        />
      </Surface>
      
      <View style={styles.versionContainer}>
        <Text style={[styles.versionText, { color: darkMode ? '#aaa' : '#777' }]}>
          Version 1.0.0
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  currencyButton: {
    justifyContent: 'flex-start',
    height: 50,
    marginBottom: 8,
  },
  menu: {
    width: '90%',
  },
  menuScrollView: {
    maxHeight: 300,
  },
  resetButton: {
    marginTop: 8,
  },
  versionContainer: {
    padding: 16,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
  },
});

export default ProfileScreen;
