import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, Snackbar, Menu, Divider } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

// Currency options
const CURRENCIES = [
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'JPY', label: 'Japanese Yen (¥)' },
  { code: 'INR', label: 'Indian Rupee (₹)' },
  { code: 'CAD', label: 'Canadian Dollar (C$)' },
  { code: 'AUD', label: 'Australian Dollar (A$)' },
];

const SignupScreen = ({ navigation }) => {
  const { register, loading, error, user } = useAuth();
  const { theme, darkMode } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showPassword, setShowPassword] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in, navigating to Dashboard');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [user, navigation]);

  const validateForm = () => {
    const errors = {};
    if (!name) errors.name = 'Name is required';
    if (!email) errors.email = 'Email is required';
    if (email && !/\S+@\S+\.\S+/.test(email)) errors.email = 'Email is invalid';
    if (!password) errors.password = 'Password is required';
    if (password && password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    
    console.log('Attempting registration with:', { name, email, currency });
    const result = await register(name, email, password, currency);
    
    if (result.success) {
      console.log('Registration successful, navigating to Dashboard');
      // Reset navigation stack to prevent going back to signup
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    } else {
      console.log('Registration failed:', result.message);
      setSnackbarMessage(result.message || 'Registration failed. Please try again.');
      setSnackbarVisible(true);
    }
  };

  // Get currency label from code
  const getCurrencyLabel = (code) => {
    const currency = CURRENCIES.find(c => c.code === code);
    return currency ? currency.label : code;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={[styles.surface, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: theme.colors.text }]}>Sign up to start tracking your expenses</Text>
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}
          
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            error={!!formErrors.name}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          {formErrors.name && <HelperText type="error">{formErrors.name}</HelperText>}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            error={!!formErrors.email}
            theme={{ colors: { primary: theme.colors.primary } }}
          />
          {formErrors.email && <HelperText type="error">{formErrors.email}</HelperText>}
          
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            right={
              <TextInput.Icon
                icon={showPassword ? "eye-off" : "eye"}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            theme={{ colors: { primary: theme.colors.primary } }}
            error={!!formErrors.password}
          />
          {formErrors.password && <HelperText type="error">{formErrors.password}</HelperText>}
          
          <TextInput
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: theme.colors.primary } }}
            error={!!formErrors.confirmPassword}
          />
          {formErrors.confirmPassword && <HelperText type="error">{formErrors.confirmPassword}</HelperText>}
          
          {/* Currency Selector with Menu */}
          <View style={styles.currencyContainer}>
            <Text style={[styles.currencyLabel, { color: theme.colors.text }]}>Select Currency</Text>
            <Menu
              visible={currencyMenuVisible}
              onDismiss={() => setCurrencyMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setCurrencyMenuVisible(true)}
                  style={styles.currencyButton}
                  icon={() => <Ionicons name="chevron-down" size={16} color={theme.colors.primary} />}
                  contentStyle={styles.currencyButtonContent}
                >
                  {getCurrencyLabel(currency)}
                </Button>
              }
            >
              {CURRENCIES.map((item) => (
                <Menu.Item
                  key={item.code}
                  onPress={() => {
                    setCurrency(item.code);
                    setCurrencyMenuVisible(false);
                  }}
                  title={item.label}
                  titleStyle={{ 
                    color: currency === item.code ? theme.colors.primary : theme.colors.text
                  }}
                  style={currency === item.code ? { backgroundColor: 'rgba(106, 17, 203, 0.1)' } : {}}
                />
              ))}
            </Menu>
          </View>
          
          <Button
            mode="contained"
            onPress={handleSignup}
            style={styles.button}
            labelStyle={styles.buttonLabel}
            disabled={loading}
            loading={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
          
          <View style={styles.footer}>
            <Text style={{ color: theme.colors.text }}>Already have an account? </Text>
            <Button
              mode="text"
              onPress={() => navigation.navigate('Login')}
              compact
            >
              Sign In
            </Button>
          </View>
        </Surface>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
  },
  input: {
    marginBottom: 8,
  },
  currencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 8,
  },
  currencyLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  currencyButton: {
    flex: 1,
    borderRadius: 4,
  },
  currencyButtonContent: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  button: {
    marginTop: 16,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  errorText: {
    color: '#CF6679',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default SignupScreen;
