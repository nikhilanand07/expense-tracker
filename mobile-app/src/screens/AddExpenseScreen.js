import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, Menu, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrencySymbol } from '../utils/currencyUtils';
import apiClient from '../api/client';
import moment from 'moment';

const AddExpenseScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, darkMode } = useTheme();
  const currencySymbol = getCurrencySymbol(user?.currency);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Menu state
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [paymentMethodMenuVisible, setPaymentMethodMenuVisible] = useState(false);
  
  // Category options
  const categories = [
    'Food',
    'Transportation',
    'Housing',
    'Entertainment',
    'Shopping',
    'Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Other'
  ];

  // Payment mode options
  const paymentModes = [
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Mobile Wallet',
    'Other'
  ];
  
  // Reset form function
  const resetForm = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setPaymentMethod('');
    setExpenseDate(new Date());
    setErrors({});
  };
  
  // Reset form when screen is focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      resetForm();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (!category) {
      newErrors.category = 'Category is required';
    }
    
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle date change
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || expenseDate;
    setShowDatePicker(Platform.OS === 'ios');
    setExpenseDate(currentDate);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      const expenseData = {
        amount: parseFloat(amount),
        category,
        description,
        mode_of_payment: paymentMethod,
        expense_date: expenseDate.toISOString()
      };
      
      console.log('Adding new expense:', expenseData);
      await apiClient.post('/api/expenses', expenseData);
      
      setLoading(false);
      Alert.alert(
        'Success',
        'Expense added successfully',
        [{ 
          text: 'OK', 
          onPress: () => {
            resetForm();
            navigation.goBack();
          }
        }]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error adding expense:', error);
      Alert.alert(
        'Error',
        'Failed to add expense. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Add New Expense</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Amount ({currencySymbol})</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              mode="outlined"
              placeholder="Enter amount"
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.amount}
              theme={{ colors: { primary: theme.colors.primary } }}
              left={<TextInput.Affix text={currencySymbol} />}
            />
            {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Category</Text>
            <Button
              mode="outlined"
              onPress={() => setCategoryMenuVisible(true)}
              style={[styles.selectButton, { 
                borderColor: errors.category ? theme.colors.error : darkMode ? '#444' : '#e0e0e0',
              }]}
            >
              {category || 'Select Category'}
            </Button>
            <Menu
              visible={categoryMenuVisible}
              onDismiss={() => setCategoryMenuVisible(false)}
              anchor={{ x: 0, y: 0 }}
              style={styles.menu}
            >
              {categories.map(item => (
                <Menu.Item
                  key={item}
                  title={item}
                  onPress={() => {
                    setCategory(item);
                    setCategoryMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            {errors.category && <HelperText type="error">{errors.category}</HelperText>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Date</Text>
            <Button
              mode="outlined"
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              {moment(expenseDate).format('MMMM D, YYYY')}
            </Button>
            {showDatePicker && (
              <DateTimePicker
                value={expenseDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Payment Method</Text>
            <Button
              mode="outlined"
              onPress={() => setPaymentMethodMenuVisible(true)}
              style={[styles.selectButton, { 
                borderColor: errors.paymentMethod ? theme.colors.error : darkMode ? '#444' : '#e0e0e0',
              }]}
            >
              {paymentMethod || 'Select Payment Method'}
            </Button>
            <Menu
              visible={paymentMethodMenuVisible}
              onDismiss={() => setPaymentMethodMenuVisible(false)}
              anchor={{ x: 0, y: 0 }}
              style={styles.menu}
            >
              {paymentModes.map(item => (
                <Menu.Item
                  key={item}
                  title={item}
                  onPress={() => {
                    setPaymentMethod(item);
                    setPaymentMethodMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
            {errors.paymentMethod && <HelperText type="error">{errors.paymentMethod}</HelperText>}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description (Optional)</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              placeholder="Enter description"
              multiline
              numberOfLines={3}
              style={styles.input}
              theme={{ colors: { primary: theme.colors.primary } }}
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button 
              mode="outlined" 
              onPress={handleCancel}
              style={[styles.cancelButton, { borderColor: darkMode ? '#e0e0e0' : '#757575' }]}
              labelStyle={{ color: darkMode ? '#e0e0e0' : '#757575' }}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={loading}
              disabled={loading}
            >
              Save Expense
            </Button>
          </View>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 4,
  },
  selectButton: {
    justifyContent: 'flex-start',
    height: 50,
  },
  menu: {
    width: '80%',
    marginTop: 60,
  },
  dateButton: {
    marginBottom: 4,
    justifyContent: 'flex-start',
    height: 50,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
  },
});

export default AddExpenseScreen;
