import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Surface, HelperText, Menu, Divider } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getCurrencySymbol } from '../utils/currencyUtils';
import apiClient from '../api/client';
import moment from 'moment';

const EditExpenseScreen = ({ navigation, route }) => {
  const { id } = route.params;
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
  const [fetchLoading, setFetchLoading] = useState(true);
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
  
  // Fetch expense data
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setFetchLoading(true);
        console.log('Fetching expense with ID:', id);
        const response = await apiClient.get(`/api/expenses/${id}`);
        console.log('Response from /api/expenses/:id:', response.data);
        
        // Handle different response structures
        let expense = null;
        if (response.data && response.data.data) {
          expense = response.data.data;
        } else if (response.data && !response.data.data) {
          expense = response.data;
        }
        
        if (!expense) {
          throw new Error('Invalid expense data received');
        }
        
        setAmount(expense.amount.toString());
        setCategory(expense.category || '');
        setDescription(expense.description || '');
        setPaymentMethod(expense.mode_of_payment || '');
        setExpenseDate(new Date(expense.expense_date));
      } catch (error) {
        console.error('Error fetching expense:', error);
        Alert.alert(
          'Error',
          'Failed to load expense data. Please try again.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } finally {
        setFetchLoading(false);
      }
    };
    
    if (id) {
      fetchExpense();
    } else {
      setFetchLoading(false);
      Alert.alert(
        'Error',
        'No expense ID provided',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }
  }, [id]);
  
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
      
      console.log('Updating expense with ID:', id);
      console.log('Update data:', expenseData);
      
      await apiClient.put(`/api/expenses/${id}`, expenseData);
      
      setLoading(false);
      Alert.alert(
        'Success',
        'Expense updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      setLoading(false);
      console.error('Error updating expense:', error);
      Alert.alert(
        'Error',
        'Failed to update expense. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this expense? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              await apiClient.delete(`/api/expenses/${id}`);
              
              setLoading(false);
              Alert.alert(
                'Success',
                'Expense deleted successfully',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              setLoading(false);
              console.error('Error deleting expense:', error);
              Alert.alert(
                'Error',
                'Failed to delete expense. Please try again.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigation.goBack();
  };

  if (fetchLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>Loading expense data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={[styles.formContainer, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Edit Expense</Text>
          
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
              Update Expense
            </Button>
          </View>
          
          <Button 
            mode="outlined" 
            onPress={handleDelete}
            style={[styles.deleteButton, { borderColor: theme.colors.error, marginTop: 24 }]}
            labelStyle={{ color: theme.colors.error }}
            icon="delete"
          >
            Delete Expense
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  deleteButton: {
    width: '100%',
  },
});

export default EditExpenseScreen;
