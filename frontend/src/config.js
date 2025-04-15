// Configuration for different environments
const config = {
  development: {
    apiUrl: 'http://localhost:5001'
  },
  production: {
    apiUrl: process.env.REACT_APP_API_URL || 'https://expense-tracker-backend-rosy.vercel.app'
  }
};

// Determine current environment
const env = process.env.NODE_ENV || 'development';

// Export the configuration for the current environment
export default config[env];
