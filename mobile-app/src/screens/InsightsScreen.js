import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, ActivityIndicator } from 'react-native';
import { Text, Surface, Button, Menu, Divider, List } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatAmount, formatAmountShort } from '../utils/currencyUtils';
import apiClient from '../api/client';
import moment from 'moment';

const screenWidth = Dimensions.get('window').width;

const InsightsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { theme, darkMode } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timePeriod, setTimePeriod] = useState('currentMonth');
  const [timePeriodMenuVisible, setTimePeriodMenuVisible] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [paymentMethodData, setPaymentMethodData] = useState([]);
  const [totalExpense, setTotalExpense] = useState(0);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Time period options
  const timePeriods = [
    { value: 'currentMonth', label: 'Current Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'last6Months', label: 'Last 6 Months' },
    { value: 'currentYear', label: 'Current Year' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'all', label: 'All Time' }
  ];

  // Colors for charts
  const chartColors = [
    '#FF6384', // red
    '#36A2EB', // blue
    '#FFCE56', // yellow
    '#4BC0C0', // teal
    '#9966FF', // purple
    '#FF9F40', // orange
    '#8AC54B', // green
    '#EA526F', // pink
    '#23395B', // navy
    '#406E8E', // slate blue
  ];

  // Set date range based on time period
  useEffect(() => {
    const now = new Date();
    let newStartDate = null;
    let newEndDate = null;

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
      default:
        newStartDate = moment().startOf('month').toDate();
        newEndDate = moment().endOf('day').toDate();
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
  }, [timePeriod]);

  // Fetch data for insights
  useEffect(() => {
    fetchInsights();
  }, [startDate, endDate]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      
      if (startDate) {
        params.startDate = startDate.toISOString();
      }
      
      if (endDate) {
        params.endDate = endDate.toISOString();
      }
      
      console.log('Making GET request to expenses with params:', params);
      
      // First, fetch all expenses for the selected period
      const response = await apiClient.get('/api/expenses', { params });
      console.log('Response from /api/expenses:', response.data);
      
      let expenses = [];
      
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        expenses = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.expenses)) {
          expenses = response.data.expenses;
        } else if (Array.isArray(response.data.data)) {
          expenses = response.data.data;
        }
      }
      
      // If no expenses, set empty data
      if (!expenses || expenses.length === 0) {
        setCategoryData([]);
        setPaymentMethodData([]);
        setTotalExpense(0);
        setLoading(false);
        return;
      }
      
      // Calculate total amount
      const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      
      // Process category data
      const categoryMap = {};
      expenses.forEach(expense => {
        const category = expense.category || 'Other';
        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }
        categoryMap[category] += expense.amount || 0;
      });
      
      // Process payment method data
      const paymentMethodMap = {};
      expenses.forEach(expense => {
        const method = expense.mode_of_payment || 'Other';
        if (!paymentMethodMap[method]) {
          paymentMethodMap[method] = 0;
        }
        paymentMethodMap[method] += expense.amount || 0;
      });
      
      // Process category data for charts
      const categoryChartData = Object.entries(categoryMap).map(([category, amount], index) => ({
        name: category,
        amount,
        percentage: (amount / totalAmount) * 100,
        color: chartColors[index % chartColors.length],
        legendFontColor: darkMode ? '#FFFFFF' : '#000000',
        legendFontSize: 12,
      }));
      
      // Process payment method data for charts
      const paymentMethodChartData = Object.entries(paymentMethodMap).map(([method, amount], index) => ({
        name: method,
        amount,
        percentage: (amount / totalAmount) * 100,
        color: chartColors[(index + 5) % chartColors.length],
        legendFontColor: darkMode ? '#FFFFFF' : '#000000',
        legendFontSize: 12,
      }));
      
      setCategoryData(categoryChartData);
      setPaymentMethodData(paymentMethodChartData);
      setTotalExpense(totalAmount);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Get time period label
  const getTimePeriodLabel = () => {
    const period = timePeriods.find(p => p.value === timePeriod);
    return period ? period.label : '';
  };

  // Format percentage
  const formatPercentage = (value) => {
    return value.toFixed(1) + '%';
  };

  // Prepare bar chart data
  const getBarChartData = () => {
    // Sort categories by amount (descending) and filter out any items with undefined amounts
    const validData = [...categoryData].filter(item => item && typeof item.amount === 'number');
    const sortedData = validData.sort((a, b) => b.amount - a.amount);
    
    // If no valid data, return empty chart data
    if (sortedData.length === 0) {
      return {
        labels: [],
        datasets: [{ data: [] }]
      };
    }
    
    return {
      labels: sortedData.slice(0, 5).map(item => item.name || 'Unknown'),
      datasets: [
        {
          data: sortedData.slice(0, 5).map(item => item.amount || 0),
        }
      ]
    };
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: theme.colors.surface,
    backgroundGradientTo: theme.colors.surface,
    color: (opacity = 1) => darkMode 
      ? `rgba(255, 255, 255, ${opacity})` 
      : `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => darkMode 
      ? `rgba(255, 255, 255, ${opacity})` 
      : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.6,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 10,
      fontWeight: 'bold',
      fill: darkMode ? '#FFFFFF' : '#000000',
    },
    propsForVerticalLabels: {
      fontSize: 10,
      fontWeight: 'bold',
      fill: darkMode ? '#FFFFFF' : '#000000',
    },
    propsForHorizontalLabels: {
      fontSize: 10,
      fontWeight: 'bold',
      fill: darkMode ? '#FFFFFF' : '#000000',
    },
    formatTopBarValue: () => '',
  };

  // Force chart to update when theme changes
  useEffect(() => {
    // This will trigger a re-render of the charts when theme changes
    const updatedConfig = {
      ...chartConfig,
      color: (opacity = 1) => darkMode 
        ? `rgba(255, 255, 255, ${opacity})` 
        : `rgba(0, 0, 0, ${opacity})`,
      labelColor: (opacity = 1) => darkMode 
        ? `rgba(255, 255, 255, ${opacity})` 
        : `rgba(0, 0, 0, ${opacity})`,
      propsForLabels: {
        ...chartConfig.propsForLabels,
        fill: darkMode ? '#FFFFFF' : '#000000',
      },
      propsForVerticalLabels: {
        ...chartConfig.propsForVerticalLabels,
        fill: darkMode ? '#FFFFFF' : '#000000',
      },
      propsForHorizontalLabels: {
        ...chartConfig.propsForHorizontalLabels,
        fill: darkMode ? '#FFFFFF' : '#000000',
      },
    };
    
    // Force re-render by updating state
    setCategoryData([...categoryData]);
    setPaymentMethodData([...paymentMethodData]);
  }, [darkMode]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ padding: 16 }}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading insights...
          </Text>
        </View>
      ) : error ? (
        <Surface style={[styles.errorCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchInsights}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </Surface>
      ) : categoryData.length > 0 ? (
        <>
          <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>Total Expenses</Text>
            <Text style={[styles.summaryAmount, { color: theme.colors.primary }]}>
              {formatAmount(totalExpense, user?.currency)}
            </Text>
            <Text style={[styles.summaryPeriod, { color: darkMode ? '#aaa' : '#757575' }]}>
              {getTimePeriodLabel()}
            </Text>
          </Surface>
          
          <View style={styles.filterSection}>
            <Text style={[styles.filterLabel, { color: theme.colors.text }]}>Period:</Text>
            <Menu
              visible={timePeriodMenuVisible}
              onDismiss={() => setTimePeriodMenuVisible(false)}
              anchor={
                <Button 
                  mode="outlined" 
                  onPress={() => setTimePeriodMenuVisible(true)}
                  style={styles.periodButton}
                >
                  {getTimePeriodLabel()}
                </Button>
              }
            >
              {timePeriods.map(period => (
                <Menu.Item
                  key={period.value}
                  title={period.label}
                  onPress={() => {
                    setTimePeriod(period.value);
                    setTimePeriodMenuVisible(false);
                  }}
                />
              ))}
            </Menu>
          </View>
          
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Expenses by Category</Text>
            <View style={styles.chartContainer}>
              <PieChart
                data={categoryData}
                width={screenWidth - 64}
                height={240}
                chartConfig={chartConfig}
                accessor="amount"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
                hasLegend={false}
                center={[10, 0]}
              />
            </View>
            
            {/* Improved legend with better layout to prevent overlapping */}
            <View style={styles.legendContainer}>
              {categoryData.map((item, index) => (
                <View key={`legend-${index}`} style={styles.legendItem}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                  <View style={styles.legendTextContainer}>
                    <Text 
                      style={[styles.legendText, { color: theme.colors.text }]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>
                    <Text style={[styles.legendPercentage, { color: darkMode ? '#aaa' : '#757575' }]}>
                      {formatPercentage(item.percentage)}
                    </Text>
                  </View>
                  <Text style={[styles.legendAmount, { color: theme.colors.text }]}>
                    {formatAmountShort(item.amount, user?.currency)}
                  </Text>
                </View>
              ))}
            </View>
          </Surface>
          
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.chartTitle, { color: theme.colors.text }]}>Top 5 Categories</Text>
            <View style={styles.chartContainer}>
              {getBarChartData().datasets[0].data.length > 0 ? (
                <>
                  <BarChart
                    data={getBarChartData()}
                    width={screenWidth - 64}
                    height={260}
                    chartConfig={chartConfig}
                    verticalLabelRotation={30}
                    fromZero
                    showValuesOnTopOfBars={false}
                    withInnerLines={false}
                    withVerticalLabels={true}
                    withHorizontalLabels={true}
                    segments={4}
                    yAxisLabel=""
                    yAxisSuffix=""
                  />
                  
                  {/* Custom bar values on top to avoid formatYLabel issues */}
                  <View style={styles.customBarValues}>
                    {getBarChartData().datasets[0].data.map((value, index) => (
                      <Text 
                        key={`bar-value-${index}`} 
                        style={[
                          styles.barValue, 
                          { 
                            color: darkMode ? '#FFFFFF' : '#000000',
                            left: `${(index * 20) + 10}%`,
                          }
                        ]}
                      >
                        {formatAmountShort(value, user?.currency)}
                      </Text>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={[styles.emptyChartText, { color: theme.colors.text }]}>
                  No data available for chart
                </Text>
              )}
            </View>
          </Surface>
          
          <Surface style={[styles.detailsCard, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.detailsTitle, { color: theme.colors.text }]}>Expense Details</Text>
            
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>By Category</Text>
            {categoryData.map((item, index) => (
              <View key={`cat-${index}`} style={styles.detailRow}>
                <View style={styles.detailNameContainer}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                  <Text style={[styles.detailName, { color: theme.colors.text }]}>{item.name}</Text>
                </View>
                <View style={styles.detailValueContainer}>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {formatAmount(item.amount, user?.currency)}
                  </Text>
                  <Text style={[styles.detailPercentage, { color: darkMode ? '#aaa' : '#757575' }]}>
                    {formatPercentage(item.percentage)}
                  </Text>
                </View>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>By Payment Method</Text>
            {paymentMethodData.map((item, index) => (
              <View key={`pay-${index}`} style={styles.detailRow}>
                <View style={styles.detailNameContainer}>
                  <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
                  <Text style={[styles.detailName, { color: theme.colors.text }]}>{item.name}</Text>
                </View>
                <View style={styles.detailValueContainer}>
                  <Text style={[styles.detailValue, { color: theme.colors.text }]}>
                    {formatAmount(item.amount, user?.currency)}
                  </Text>
                  <Text style={[styles.detailPercentage, { color: darkMode ? '#aaa' : '#757575' }]}>
                    {formatPercentage(item.percentage)}
                  </Text>
                </View>
              </View>
            ))}
          </Surface>
        </>
      ) : (
        <Surface style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.emptyText, { color: theme.colors.text }]}>
            No expenses found for the selected period
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Add')}
            style={styles.addButton}
          >
            Add Your First Expense
          </Button>
        </Surface>
      )}
      
      <View style={styles.footer} />
    </ScrollView>
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
    minHeight: 300,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#D32F2F',
  },
  headerCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  filterSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  periodButton: {
    flex: 1,
  },
  summaryCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
  },
  summaryAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  summaryPeriod: {
    fontSize: 14,
  },
  chartCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    position: 'relative',
  },
  customBarValues: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  barValue: {
    fontSize: 10,
    fontWeight: 'bold',
    position: 'absolute',
  },
  emptyChartText: {
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 40,
  },
  legendContainer: {
    flexDirection: 'column',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  legendTextContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  legendPercentage: {
    fontSize: 11,
    marginTop: 2,
  },
  legendAmount: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  detailsCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 10,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  detailName: {
    fontSize: 14,
  },
  detailValueContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  detailPercentage: {
    fontSize: 12,
  },
  divider: {
    marginVertical: 16,
  },
  emptyCard: {
    marginBottom: 16,
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  addButton: {
    marginTop: 8,
  },
  footer: {
    height: 24,
  },
});

export default InsightsScreen;
