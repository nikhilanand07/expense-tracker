import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { Text, Surface, FAB, Chip, Divider, ActivityIndicator, Badge, Button, IconButton, Menu, Searchbar } from 'react-native-paper';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatAmount } from '../utils/currencyUtils';
import apiClient from '../api/client';
import moment from 'moment';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, darkMode } = useTheme();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    startDate: moment().startOf('month').toDate(),
    endDate: moment().endOf('day').toDate(),
    category: '',
    mode_of_payment: '',
    timePeriod: 'currentMonth'
  });
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false);
  const [paymentMethodMenuVisible, setPaymentMethodMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Time period options
  const timePeriods = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'currentYear', label: 'Current Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'all', label: 'All Time' },
    { value: 'custom', label: 'Custom Date Range' }
  ];

  // Category options
  const categories = [
    'All',
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
    'All',
    'Cash',
    'Credit Card',
    'Debit Card',
    'UPI',
    'Net Banking',
    'Mobile Wallet',
    'Other'
  ];

  // Fetch expenses based on filters
  const fetchExpenses = async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (shouldRefresh) {
        setLoading(true);
        setError(null);
      }
      
      const params = {
        page: pageNum,
        limit: 10
      };
      
      if (filters.startDate) {
        params.startDate = filters.startDate.toISOString();
      }
      
      if (filters.endDate) {
        params.endDate = filters.endDate.toISOString();
      }
      
      if (filters.category && filters.category !== 'All') {
        params.category = filters.category;
      }
      
      if (filters.mode_of_payment && filters.mode_of_payment !== 'All') {
        params.mode_of_payment = filters.mode_of_payment;
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      console.log('Making GET request to expenses with params:', params);
      const response = await apiClient.get('/api/expenses', { params });
      console.log('Response data structure:', JSON.stringify(response.data));
      
      // Handle different response structures
      let fetchedExpenses = [];
      let total = 0;
      let moreAvailable = false;
      
      if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.data)) {
          fetchedExpenses = response.data.data;
          
          // Check if there are more pages
          if (response.data.pagination) {
            moreAvailable = response.data.pagination.hasMore;
          } else {
            moreAvailable = fetchedExpenses.length === params.limit;
          }
        } else if (Array.isArray(response.data)) {
          fetchedExpenses = response.data;
          moreAvailable = fetchedExpenses.length === params.limit;
        }
      }
      
      // Update state based on pagination
      if (pageNum === 1 || shouldRefresh) {
        setExpenses(fetchedExpenses);
      } else {
        setExpenses(prevExpenses => [...prevExpenses, ...fetchedExpenses]);
      }
      
      // Calculate total expense amount from all fetched expenses
      // We need to fetch the total sum separately to get accurate total regardless of pagination
      try {
        // Get total expenses without pagination to calculate the sum
        const totalParams = { ...params };
        delete totalParams.page;
        delete totalParams.limit;
        
        const totalResponse = await apiClient.get('/api/expenses', { params: totalParams });
        let allExpenses = [];
        
        if (totalResponse.data && typeof totalResponse.data === 'object') {
          if (Array.isArray(totalResponse.data.data)) {
            allExpenses = totalResponse.data.data;
          } else if (Array.isArray(totalResponse.data)) {
            allExpenses = totalResponse.data;
          }
        }
        
        // Calculate the sum of all expenses
        const totalAmount = allExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        setTotalExpenses(totalAmount);
      } catch (error) {
        console.error('Error calculating total expenses:', error);
        // Fallback to calculating from current page if total fetch fails
        const totalAmount = fetchedExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
        setTotalExpenses(totalAmount);
      }
      
      setHasMore(moreAvailable);
      setLoading(false);
      setRefreshing(false);
      
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Failed to load expenses. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    // Clean up search timeout on unmount
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, []);
  
  useEffect(() => {
    setPage(1);
    fetchExpenses(1, true);
  }, [filters.startDate, filters.endDate, filters.category, filters.mode_of_payment]);
  
  // Add a separate effect for search to ensure it triggers properly
  useEffect(() => {
    // Don't trigger on initial render
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
  }, [searchQuery]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchExpenses(1, true);
  };

  // Load more expenses
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchExpenses(page + 1);
    }
  };

  // Handle time period selection
  const handleTimePeriodChange = (timePeriod) => {
    let newStartDate = null;
    let newEndDate = null;
    const now = new Date();
    
    switch (timePeriod) {
      case 'currentMonth':
        newStartDate = moment().startOf('month').toDate();
        newEndDate = moment().endOf('day').toDate();
        break;
      case 'lastMonth':
        newStartDate = moment().subtract(1, 'months').startOf('month').toDate();
        newEndDate = moment().subtract(1, 'months').endOf('month').toDate();
        break;
      case 'last3Months':
        newStartDate = moment().subtract(3, 'months').startOf('day').toDate();
        newEndDate = moment().endOf('day').toDate();
        break;
      case 'last6Months':
        newStartDate = moment().subtract(6, 'months').startOf('day').toDate();
        newEndDate = moment().endOf('day').toDate();
        break;
      case 'currentYear':
        newStartDate = moment().startOf('year').toDate();
        newEndDate = moment().endOf('day').toDate();
        break;
      case 'lastYear':
        newStartDate = moment().subtract(1, 'years').startOf('year').toDate();
        newEndDate = moment().subtract(1, 'years').endOf('year').toDate();
        break;
      case 'all':
        newStartDate = null;
        newEndDate = null;
        break;
      case 'custom':
        // Keep existing dates for custom
        newStartDate = filters.startDate;
        newEndDate = filters.endDate;
        break;
      default:
        newStartDate = moment().startOf('month').toDate();
        newEndDate = moment().endOf('day').toDate();
    }
    
    setFilters({
      ...filters,
      startDate: newStartDate,
      endDate: newEndDate,
      timePeriod
    });
  };

  // Handle category selection
  const handleCategoryChange = (category) => {
    setCategoryMenuVisible(false);
    setFilters({
      ...filters,
      category: category === 'All' ? '' : category
    });
  };

  // Handle payment method selection
  const handlePaymentMethodChange = (method) => {
    setPaymentMethodMenuVisible(false);
    setFilters({
      ...filters,
      mode_of_payment: method === 'All' ? '' : method
    });
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set a new timeout to debounce the search
    const timeout = setTimeout(() => {
      console.log('Searching for:', query.trim());
      // Reset pagination and fetch with the new search query
      setPage(1);
      fetchExpenses(1, true);
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
  };

  // Get badge color based on category
  const getBadgeColor = (category) => {
    switch (category) {
      case 'Food': return '#FF5722';
      case 'Transportation': return '#2196F3';
      case 'Housing': return '#4CAF50';
      case 'Entertainment': return '#9C27B0';
      case 'Shopping': return '#E91E63';
      case 'Utilities': return '#607D8B';
      case 'Healthcare': return '#00BCD4';
      case 'Education': return '#3F51B5';
      case 'Travel': return '#FFC107';
      default: return '#757575';
    }
  };

  // Get chip color based on payment method
  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'Cash': return '#4CAF50';
      case 'Credit Card': return '#F44336';
      case 'Debit Card': return '#2196F3';
      case 'UPI': return '#9C27B0';
      case 'Net Banking': return '#FF9800';
      case 'Mobile Wallet': return '#00BCD4';
      default: return '#757575';
    }
  };

  // Render expense item
  const renderExpenseItem = ({ item }) => {
    if (!item) return null; // Skip rendering if item is undefined
    
    return (
      <Surface style={[styles.expenseCard, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.expenseHeader}>
          <View style={styles.categoryContainer}>
            <Badge 
              style={[styles.categoryBadge, { backgroundColor: getBadgeColor(item.category) }]} 
              size={8} 
            />
            <Text style={{ color: theme.colors.text }}>{item.category || 'Uncategorized'}</Text>
          </View>
          <Text style={[styles.amount, { color: theme.colors.text }]}>
            {formatAmount(item.amount || 0, user?.currency)}
          </Text>
        </View>
        
        <Text style={[styles.description, { color: theme.colors.text }]}>
          {item.description || 'No description'}
        </Text>
        
        <Divider />
        
        <View style={styles.expenseFooter}>
          <View style={styles.expenseFooterLeft}>
            <Text style={[styles.date, { color: theme.colors.text }]}>
              {item.expense_date ? moment(item.expense_date).format('MMM DD, YYYY') : 'No date'}
            </Text>
            <Chip 
              style={[styles.paymentChip, { backgroundColor: getPaymentMethodColor(item.mode_of_payment) }]} 
              textStyle={styles.paymentChipText}
            >
              {item.mode_of_payment || 'Unknown'}
            </Chip>
          </View>
          
          <View style={styles.actionButtons}>
            <IconButton 
              icon="pencil" 
              size={20} 
              onPress={() => navigation.navigate('EditExpense', { id: item._id })} 
              iconColor={theme.colors.primary}
            />
            <IconButton 
              icon="delete" 
              size={20} 
              onPress={() => handleDeleteExpense(item._id)} 
              iconColor="#F44336"
            />
          </View>
        </View>
      </Surface>
    );
  };

  // Handle delete expense
  const handleDeleteExpense = async (id) => {
    try {
      await apiClient.delete(`/api/expenses/${id}`);
      setExpenses(expenses.filter(expense => expense._id !== id));
      // Recalculate total
      const deletedExpense = expenses.find(expense => expense._id === id);
      if (deletedExpense) {
        setTotalExpenses(totalExpenses - (deletedExpense.amount || 0));
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Search bar */}
      <Searchbar
        placeholder="Search expenses by description..."
        onChangeText={handleSearch}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.primary}
        inputStyle={{ color: theme.colors.text }}
        placeholderTextColor={darkMode ? '#aaaaaa' : '#888888'}
        onSubmitEditing={() => {
          // Force search on submit/enter
          console.log('Search submitted:', searchQuery.trim());
          setPage(1);
          fetchExpenses(1, true);
        }}
      />
      
      {/* Show search results message if searching */}
      {searchQuery.trim() && (
        <View style={styles.searchResultsContainer}>
          <Text style={[styles.searchResultsText, { color: theme.colors.text }]}>
            {expenses.length > 0 
              ? `Found ${expenses.length} results for "${searchQuery.trim()}"`
              : `No results found for "${searchQuery.trim()}"`}
          </Text>
          {expenses.length > 0 && (
            <Button 
              mode="text" 
              onPress={() => {
                setSearchQuery('');
                fetchExpenses(1, true);
              }}
              style={styles.clearSearchButton}
            >
              Clear Search
            </Button>
          )}
        </View>
      )}
      
      {/* Filter chips */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          {timePeriods.map(period => (
            <Chip
              key={period.value}
              selected={filters.timePeriod === period.value}
              onPress={() => handleTimePeriodChange(period.value)}
              style={styles.chip}
              mode={filters.timePeriod === period.value ? 'flat' : 'outlined'}
              selectedColor={theme.colors.primary}
            >
              {period.label}
            </Chip>
          ))}
        </ScrollView>
      </View>
      
      {/* Category and payment mode filters */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContainer}
        >
          <Button
            mode="outlined"
            onPress={() => setCategoryMenuVisible(true)}
            style={styles.filterButton}
            icon="shape"
          >
            {filters.category || 'Category'}
          </Button>
          
          <Menu
            visible={categoryMenuVisible}
            onDismiss={() => setCategoryMenuVisible(false)}
            anchor={{ x: 0, y: 0 }}
            style={styles.menu}
          >
            {categories.map(category => (
              <Menu.Item
                key={category}
                title={category}
                onPress={() => handleCategoryChange(category)}
                titleStyle={
                  (filters.category === category || (category === 'All' && !filters.category))
                    ? { color: theme.colors.primary, fontWeight: 'bold' }
                    : {}
                }
              />
            ))}
          </Menu>
          
          <Button
            mode="outlined"
            onPress={() => setPaymentMethodMenuVisible(true)}
            style={styles.filterButton}
            icon="credit-card"
          >
            {filters.mode_of_payment || 'Payment Method'}
          </Button>
          
          <Menu
            visible={paymentMethodMenuVisible}
            onDismiss={() => setPaymentMethodMenuVisible(false)}
            anchor={{ x: 0, y: 0 }}
            style={styles.menu}
          >
            {paymentModes.map(method => (
              <Menu.Item
                key={method}
                title={method}
                onPress={() => handlePaymentMethodChange(method)}
                titleStyle={
                  (filters.mode_of_payment === method || (method === 'All' && !filters.mode_of_payment))
                    ? { color: theme.colors.primary, fontWeight: 'bold' }
                    : {}
                }
              />
            ))}
          </Menu>
        </ScrollView>
      </View>
      
      {/* Total expenses summary */}
      <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Total Expenses</Text>
        <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
          {formatAmount(totalExpenses, user?.currency)}
        </Text>
      </Surface>
      
      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={() => fetchExpenses(1, true)}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      )}
      
      {/* Expenses list */}
      {loading && page === 1 ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : expenses && expenses.length === 0 && !error ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No expenses found for the selected filters
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Add')}
            style={styles.addButton}
          >
            Add Your First Expense
          </Button>
        </View>
      ) : (
        <FlatList
          data={expenses || []}
          renderItem={renderExpenseItem}
          keyExtractor={(item, index) => (item && item._id) ? item._id : `expense-${index}`}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            hasMore && !error && (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
              </View>
            )
          }
        />
      )}
      
      {/* Add expense FAB */}
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('Add')}
        color="#fff"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  searchResultsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  searchResultsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  clearSearchButton: {
    marginLeft: 8,
  },
  filterSection: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  chipContainer: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  chip: {
    marginRight: 8,
  },
  filterButton: {
    marginRight: 8,
    height: 40,
  },
  menu: {
    width: 200,
    marginTop: 50,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 80,
  },
  expenseCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    marginRight: 8,
  },
  paymentChip: {
    height: 28,
    marginTop: 8,
  },
  paymentChipText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    marginBottom: 8,
  },
  expenseFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  expenseFooterLeft: {
    flex: 1,
  },
  date: {
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  errorContainer: {
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#D32F2F',
  },
  addButton: {
    paddingHorizontal: 16,
  },
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default DashboardScreen;
